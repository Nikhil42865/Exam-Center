import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../services/api.js";
import { ActiveAttemptDto, CandidateQuestionDto, CandidateAnswerState } from "@examcenter/contracts";
import { Modal } from "../../components/ui/Modal.js";
import { Alert } from "../../components/ui/Alert.js";
import {
  Clock,
  Flag,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  Menu,
} from "lucide-react";

export const ActiveExamPage: React.FC = () => {
  const { examId, attemptId } = useParams<{ examId: string; attemptId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, { selectedOptionId?: string; isFlagged: boolean }>>(
    new Map()
  );
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number | null>(null);
  const [paletteDrawerOpen, setPaletteDrawerOpen] = useState(false);

  // Fetch Attempt
  const {
    data: attempt,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["active-attempt", attemptId],
    queryFn: () => api.attempts.getActiveAttempt(attemptId!),
    enabled: !!attemptId,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Sync initial answers and server timer
  useEffect(() => {
    if (attempt) {
      const map = new Map<string, { selectedOptionId?: string; isFlagged: boolean }>();
      for (const a of attempt.answers) {
        map.set(a.questionId, {
          selectedOptionId: a.selectedOptionId,
          isFlagged: a.isFlagged,
        });
      }
      setAnswers(map);

      // Calculate server authoritative remaining time
      const serverNow = new Date(attempt.serverNow).getTime();
      const clientNow = Date.now();
      const clockOffset = serverNow - clientNow;

      const expiresAtMs = new Date(attempt.expiresAt).getTime();
      const currentServerTime = Date.now() + clockOffset;
      const diffSec = Math.max(0, Math.floor((expiresAtMs - currentServerTime) / 1000));
      setTimeRemainingSeconds(diffSec);
    }
  }, [attempt]);

  // Submit attempt helper
  const performSubmit = useCallback(async () => {
    if (!attemptId) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await api.attempts.submitAttempt(attemptId);
      queryClient.invalidateQueries({ queryKey: ["candidate-history"] });
      navigate(`/results/${result.attemptId}`, { replace: true });
    } catch (err: any) {
      setSubmitError(err.message || "Submission failed. Please try again.");
      setIsSubmitting(false);
    }
  }, [attemptId, navigate, queryClient]);

  // Synchronized countdown timer
  useEffect(() => {
    if (timeRemainingSeconds === null) return;

    if (timeRemainingSeconds <= 0) {
      // Auto-submit on expiry!
      performSubmit();
      return;
    }

    const interval = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          performSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemainingSeconds, performSubmit]);

  // Warn on accidental exit
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Are you sure you want to leave? Your exam timer will continue running.";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Save answer to server
  const saveAnswerToServer = async (
    questionId: string,
    selectedOptionId?: string | null,
    isFlagged = false
  ) => {
    if (!attemptId) return;
    setSaveStatus("saving");

    try {
      await api.attempts.saveAnswer(attemptId, questionId, {
        selectedOptionId,
        isFlagged,
      });
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  };

  const currentQuestion: CandidateQuestionDto | undefined = attempt?.questions[currentIndex];
  const currentAnswerState = currentQuestion ? answers.get(currentQuestion.id) : undefined;
  const currentSelectedOptionId = currentAnswerState?.selectedOptionId;
  const isCurrentFlagged = currentAnswerState?.isFlagged || false;

  const handleSelectOption = (optionId: string) => {
    if (!currentQuestion) return;

    const newMap = new Map(answers);
    newMap.set(currentQuestion.id, {
      selectedOptionId: optionId,
      isFlagged: isCurrentFlagged,
    });
    setAnswers(newMap);

    saveAnswerToServer(currentQuestion.id, optionId, isCurrentFlagged);
  };

  const handleClearAnswer = () => {
    if (!currentQuestion) return;

    const newMap = new Map(answers);
    newMap.set(currentQuestion.id, {
      selectedOptionId: undefined,
      isFlagged: isCurrentFlagged,
    });
    setAnswers(newMap);

    saveAnswerToServer(currentQuestion.id, null, isCurrentFlagged);
  };

  const handleToggleFlag = () => {
    if (!currentQuestion) return;

    const newFlag = !isCurrentFlagged;
    const newMap = new Map(answers);
    newMap.set(currentQuestion.id, {
      selectedOptionId: currentSelectedOptionId,
      isFlagged: newFlag,
    });
    setAnswers(newMap);

    saveAnswerToServer(currentQuestion.id, currentSelectedOptionId, newFlag);
  };

  const handleNext = () => {
    if (attempt && currentIndex < attempt.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Format seconds into MM:SS or HH:MM:SS
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Counts for submission modal
  const totalQuestions = attempt?.questions.length || 0;
  let answeredCount = 0;
  let flaggedCount = 0;
  for (const [, ans] of answers.entries()) {
    if (ans.selectedOptionId) answeredCount++;
    if (ans.isFlagged) flaggedCount++;
  }
  const unansweredCount = totalQuestions - answeredCount;

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div className="spinner spinner-primary" style={{ width: "3rem", height: "3rem", marginBottom: "1rem" }} />
          <p style={{ fontWeight: "600" }}>Securing and loading exam session...</p>
        </div>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div style={{ maxWidth: "600px", margin: "4rem auto", padding: "0 1.5rem" }}>
        <Alert type="danger" message={(error as any)?.message || "Failed to load active exam session."} />
        <button onClick={() => navigate("/dashboard")} className="btn btn-secondary" style={{ marginTop: "1rem" }}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  const isWarningTimer = (timeRemainingSeconds || 0) <= 300 && (timeRemainingSeconds || 0) > 60;
  const isCriticalTimer = (timeRemainingSeconds || 0) <= 60;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--color-bg)" }}>
      {/* Distraction-Free Header */}
      <header
        style={{
          height: "64px",
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.5rem",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--color-text)" }}>
            {attempt.examTitle}
          </span>
          <span className="badge badge-muted">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
        </div>

        {/* Save Status & Timer & Submit */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          {/* Save status */}
          <div style={{ fontSize: "0.825rem", color: "var(--color-muted)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
            {saveStatus === "saving" && (
              <>
                <span className="spinner spinner-primary" style={{ width: "12px", height: "12px" }} />
                <span>Saving...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <CheckCircle2 size={14} color="var(--color-success)" />
                <span style={{ color: "var(--color-success)" }}>Saved</span>
              </>
            )}
            {saveStatus === "error" && (
              <>
                <AlertCircle size={14} color="var(--color-danger)" />
                <span style={{ color: "var(--color-danger)" }}>Save failed</span>
              </>
            )}
          </div>

          {/* Countdown Clock */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.4rem 0.85rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: isCriticalTimer
                ? "var(--color-danger-light)"
                : isWarningTimer
                ? "var(--color-warning-light)"
                : "var(--color-surface-subtle)",
              color: isCriticalTimer
                ? "var(--color-danger-text)"
                : isWarningTimer
                ? "var(--color-warning-text)"
                : "var(--color-text)",
              border: `1.5px solid ${
                isCriticalTimer
                  ? "var(--color-danger)"
                  : isWarningTimer
                  ? "var(--color-warning)"
                  : "var(--color-border)"
              }`,
              fontWeight: "700",
              fontSize: "1.05rem",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <Clock size={18} />
            <span>{timeRemainingSeconds !== null ? formatTime(timeRemainingSeconds) : "--:--"}</span>
          </div>

          {/* Submit Exam Button */}
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="btn btn-primary btn-sm"
            style={{ fontWeight: "600" }}
          >
            <Send size={16} /> Submit Exam
          </button>

          {/* Palette button for mobile */}
          <button
            onClick={() => setPaletteDrawerOpen(true)}
            className="btn btn-secondary btn-icon"
            style={{ display: "none" }}
            id="mobile-palette-toggle"
            aria-label="Open Question Palette"
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {/* Exam Main Area */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Question Area */}
        <main
          style={{
            flex: 1,
            padding: "2rem 2rem 4rem",
            maxWidth: "900px",
            margin: "0 auto",
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {currentQuestion ? (
            <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              {/* Question Header */}
              <div className="card-header">
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontWeight: "700", fontSize: "1.1rem" }}>
                    Question {currentIndex + 1}
                  </span>
                  {isCurrentFlagged && <span className="badge badge-warning">Flagged for Review</span>}
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--color-muted)", fontWeight: "600" }}>
                  +{currentQuestion.marks} marks
                  {currentQuestion.negativeMarks > 0 && ` | -${currentQuestion.negativeMarks} negative`}
                </div>
              </div>

              {/* Question Body */}
              <div className="card-body" style={{ flex: 1 }}>
                <p
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: "500",
                    lineHeight: 1.6,
                    color: "var(--color-text)",
                    marginBottom: "2rem",
                  }}
                >
                  {currentQuestion.text}
                </p>

                {/* Options list */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                  {currentQuestion.options.map((option, optIdx) => {
                    const isSelected = currentSelectedOptionId === option.id;
                    const optionLetter = String.fromCharCode(65 + optIdx);

                    return (
                      <div
                        key={option.id}
                        onClick={() => handleSelectOption(option.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                          padding: "1rem 1.25rem",
                          borderRadius: "var(--radius-lg)",
                          border: `1.5px solid ${isSelected ? "var(--color-primary)" : "var(--color-border)"}`,
                          backgroundColor: isSelected ? "var(--color-primary-light)" : "var(--color-surface)",
                          cursor: "pointer",
                          transition: "all var(--transition-fast)",
                          userSelect: "none",
                        }}
                      >
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            border: `2px solid ${isSelected ? "var(--color-primary)" : "var(--color-border)"}`,
                            backgroundColor: isSelected ? "var(--color-primary)" : "transparent",
                            color: isSelected ? "#fff" : "var(--color-text-secondary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "700",
                            fontSize: "0.85rem",
                            flexShrink: 0,
                          }}
                        >
                          {optionLetter}
                        </div>
                        <span style={{ fontSize: "1rem", color: "var(--color-text)", flex: 1 }}>
                          {option.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Navigation Toolbar */}
              <div className="card-footer" style={{ flexWrap: "wrap", gap: "0.75rem" }}>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={handleClearAnswer}
                    className="btn btn-ghost btn-sm"
                    disabled={!currentSelectedOptionId}
                  >
                    <RotateCcw size={15} /> Clear Answer
                  </button>
                  <button
                    onClick={handleToggleFlag}
                    className={`btn btn-sm ${isCurrentFlagged ? "btn-secondary" : "btn-ghost"}`}
                    style={isCurrentFlagged ? { borderColor: "var(--color-warning)", color: "var(--color-warning-text)" } : {}}
                  >
                    <Flag size={15} /> {isCurrentFlagged ? "Remove Flag" : "Flag for Review"}
                  </button>
                </div>

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    onClick={handlePrev}
                    className="btn btn-secondary"
                    disabled={currentIndex === 0}
                  >
                    <ChevronLeft size={18} /> Previous
                  </button>
                  {currentIndex < totalQuestions - 1 ? (
                    <button onClick={handleNext} className="btn btn-primary">
                      Save & Next <ChevronRight size={18} />
                    </button>
                  ) : (
                    <button onClick={() => setIsSubmitModalOpen(true)} className="btn btn-primary">
                      Review & Submit <Send size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p>Question not found.</p>
          )}
        </main>

        {/* Right Side Question Palette (Desktop) */}
        <aside
          style={{
            width: "300px",
            backgroundColor: "var(--color-surface)",
            borderLeft: "1px solid var(--color-border)",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          <div style={{ marginBottom: "1.25rem" }}>
            <h3 style={{ fontSize: "1.05rem", marginBottom: "0.25rem" }}>Question Palette</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}>
              Navigate to any question directly
            </p>
          </div>

          {/* Palette Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "0.6rem",
              marginBottom: "2rem",
            }}
          >
            {attempt.questions.map((q, idx) => {
              const ansState = answers.get(q.id);
              const isAnswered = !!ansState?.selectedOptionId;
              const isFlagged = !!ansState?.isFlagged;
              const isCurrent = idx === currentIndex;

              // Color logic
              let bg = "var(--color-surface-subtle)";
              let color = "var(--color-text)";
              let border = "1px solid var(--color-border)";

              if (isAnswered && isFlagged) {
                bg = "var(--color-warning-light)";
                border = "1.5px solid var(--color-warning)";
                color = "var(--color-warning-text)";
              } else if (isAnswered) {
                bg = "var(--color-success-light)";
                border = "1.5px solid var(--color-success)";
                color = "var(--color-success-text)";
              } else if (isFlagged) {
                bg = "var(--color-warning-light)";
                border = "1.5px solid var(--color-warning)";
                color = "var(--color-warning-text)";
              }

              if (isCurrent) {
                border = "2px solid var(--color-primary)";
                bg = isAnswered ? bg : "var(--color-primary-light)";
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    height: "40px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: bg,
                    border,
                    color,
                    fontWeight: isCurrent ? "800" : "600",
                    fontSize: "0.9rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    position: "relative",
                  }}
                  aria-label={`Question ${idx + 1}${isAnswered ? ", answered" : ""}${isFlagged ? ", flagged" : ""}`}
                >
                  {idx + 1}
                  {isFlagged && (
                    <div
                      style={{
                        position: "absolute",
                        top: "2px",
                        right: "3px",
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        backgroundColor: "var(--color-warning)",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Palette Legend */}
          <div
            style={{
              padding: "1rem",
              backgroundColor: "var(--color-surface-subtle)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              fontSize: "0.8rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
            }}
          >
            <div style={{ fontWeight: "700", marginBottom: "0.2rem" }}>Legend</div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "16px", height: "16px", borderRadius: "4px", backgroundColor: "var(--color-success-light)", border: "1px solid var(--color-success)" }} />
              <span>Answered ({answeredCount})</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "16px", height: "16px", borderRadius: "4px", backgroundColor: "var(--color-surface-subtle)", border: "1px solid var(--color-border)" }} />
              <span>Unanswered ({unansweredCount})</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "16px", height: "16px", borderRadius: "4px", backgroundColor: "var(--color-warning-light)", border: "1px solid var(--color-warning)" }} />
              <span>Flagged for review ({flaggedCount})</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Examination"
        footer={
          <>
            <button
              onClick={() => setIsSubmitModalOpen(false)}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Continue Test
            </button>
            <button
              onClick={performSubmit}
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" /> Evaluating...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} /> Yes, Submit Final Answers
                </>
              )}
            </button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {submitError && <Alert type="danger" message={submitError} />}

          <p style={{ fontSize: "0.95rem" }}>
            Are you sure you want to finish and submit your exam? Once submitted, your answers cannot be altered.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "0.75rem",
              textAlign: "center",
              padding: "1rem",
              backgroundColor: "var(--color-surface-subtle)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--color-success)" }}>
                {answeredCount}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-muted)", fontWeight: "600" }}>ANSWERED</div>
            </div>
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--color-danger)" }}>
                {unansweredCount}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-muted)", fontWeight: "600" }}>UNANSWERED</div>
            </div>
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--color-warning)" }}>
                {flaggedCount}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-muted)", fontWeight: "600" }}>FLAGGED</div>
            </div>
          </div>

          {unansweredCount > 0 && (
            <div style={{ fontSize: "0.85rem", color: "var(--color-warning-text)" }}>
              ⚠️ You still have <strong>{unansweredCount} unanswered questions</strong>. They will receive 0 marks.
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
