import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api.js";
import { Modal } from "../../components/ui/Modal.js";
import { Alert } from "../../components/ui/Alert.js";
import {
  Clock,
  HelpCircle,
  Award,
  AlertTriangle,
  CheckSquare,
  ArrowLeft,
  PlayCircle,
  Lock,
} from "lucide-react";

export const ExamDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [rulesAcknowledged, setRulesAcknowledged] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const { data: exam, isLoading, error } = useQuery({
    queryKey: ["exam-detail", id],
    queryFn: () => api.exams.getCandidateExamDetails(id!),
    enabled: !!id,
  });

  const handleStartExam = async () => {
    if (!id) return;
    setIsStarting(true);
    setStartError(null);

    try {
      const attempt = await api.attempts.startAttempt(id);
      setIsConfirmOpen(false);
      navigate(`/exams/${id}/attempt/${attempt.id}`);
    } catch (err: any) {
      setStartError(err.message || "Failed to start exam. Please try again.");
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container" style={{ textAlign: "center", padding: "4rem" }}>
        <div className="spinner spinner-primary" style={{ width: "2.5rem", height: "2.5rem" }} />
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="page-container" style={{ maxWidth: "600px", margin: "3rem auto" }}>
        <Alert type="danger" message={(error as any)?.message || "Exam not found or currently unavailable."} />
        <Link to="/exams" className="btn btn-secondary">
          <ArrowLeft size={18} /> Back to Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* Back button */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Link to="/exams" className="btn btn-ghost btn-sm">
          <ArrowLeft size={16} /> Back to Catalogue
        </Link>
      </div>

      <div className="card">
        {/* Header */}
        <div className="card-header" style={{ alignItems: "flex-start", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span className="badge badge-primary">{exam.subjectName}</span>
            {exam.activeAttemptId && <span className="badge badge-warning">Attempt in progress</span>}
          </div>
          <h1 style={{ fontSize: "1.85rem", marginTop: "0.25rem" }}>{exam.title}</h1>
          {exam.description && (
            <p style={{ fontSize: "1rem", color: "var(--color-text-secondary)" }}>{exam.description}</p>
          )}
        </div>

        <div className="card-body">
          {/* Ineligibility notice */}
          {!exam.isEligible && !exam.activeAttemptId && (
            <Alert
              type="danger"
              message={`You are not currently eligible to take this exam. Reason: ${
                exam.ineligibilityReason || "Attempt limit reached or exam window closed."
              }`}
            />
          )}

          {/* Quick Metrics */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "1rem",
              padding: "1.25rem",
              backgroundColor: "var(--color-surface-subtle)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border)",
              marginBottom: "2rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Clock size={24} color="var(--color-primary)" />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-muted)", fontWeight: "600" }}>DURATION</div>
                <div style={{ fontSize: "1.1rem", fontWeight: "700" }}>{exam.durationMinutes} Minutes</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <HelpCircle size={24} color="var(--color-info)" />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-muted)", fontWeight: "600" }}>QUESTIONS</div>
                <div style={{ fontSize: "1.1rem", fontWeight: "700" }}>{exam.questionCount} Questions</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Award size={24} color="var(--color-warning)" />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-muted)", fontWeight: "600" }}>TOTAL MARKS</div>
                <div style={{ fontSize: "1.1rem", fontWeight: "700" }}>{exam.totalMarks} Marks</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <CheckSquare size={24} color="var(--color-success)" />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-muted)", fontWeight: "600" }}>PASSING SCORE</div>
                <div style={{ fontSize: "1.1rem", fontWeight: "700" }}>{exam.passingPercentage}%</div>
              </div>
            </div>
          </div>

          {/* Exam Instructions */}
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Examination Rules & Instructions</h2>
            <div
              style={{
                padding: "1.25rem",
                backgroundColor: "var(--color-surface)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                whiteSpace: "pre-line",
                lineHeight: "1.65",
                fontSize: "0.95rem",
                color: "var(--color-text)",
              }}
            >
              {exam.instructions}
            </div>
          </div>

          {/* Important Notice */}
          <div className="alert alert-warning" style={{ marginBottom: "2rem" }}>
            <AlertTriangle size={20} />
            <div>
              <strong>Timing Policy:</strong> The exam timer runs strictly on the server. Once started, 
              the timer continues uninterrupted even if you navigate away or close the browser. Automatic 
              grading will finalize your attempt once the time limit expires.
            </div>
          </div>

          {/* Acknowledgement */}
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
              cursor: "pointer",
              padding: "1rem",
              backgroundColor: "var(--color-surface-subtle)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              userSelect: "none",
            }}
          >
            <input
              type="checkbox"
              checked={rulesAcknowledged}
              onChange={(e) => setRulesAcknowledged(e.target.checked)}
              style={{ width: "18px", height: "18px", marginTop: "2px" }}
            />
            <span style={{ fontSize: "0.925rem", fontWeight: "500", color: "var(--color-text)" }}>
              I have read, understood, and agreed to all instructions, exam timing conditions, and integrity rules.
            </span>
          </label>
        </div>

        {/* Footer actions */}
        <div className="card-footer">
          <div style={{ fontSize: "0.85rem", color: "var(--color-muted)" }}>
            Attempt {exam.attemptsUsed + 1} of {exam.attemptLimit} allowed
          </div>

          {exam.activeAttemptId ? (
            <Link
              to={`/exams/${exam.id}/attempt/${exam.activeAttemptId}`}
              className="btn btn-primary"
            >
              <PlayCircle size={18} /> Resume Active Attempt
            </Link>
          ) : (
            <button
              onClick={() => setIsConfirmOpen(true)}
              className="btn btn-primary btn-lg"
              disabled={!exam.isEligible || !rulesAcknowledged}
            >
              {!exam.isEligible ? (
                <>
                  <Lock size={18} /> Not Eligible
                </>
              ) : (
                <>
                  <PlayCircle size={20} /> Start Examination
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Start Confirmation Modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirm Starting Examination"
        footer={
          <>
            <button onClick={() => setIsConfirmOpen(false)} className="btn btn-secondary" disabled={isStarting}>
              Cancel
            </button>
            <button onClick={handleStartExam} className="btn btn-primary" disabled={isStarting}>
              {isStarting ? <span className="spinner" /> : "I Understand, Begin Now"}
            </button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {startError && <Alert type="danger" message={startError} />}
          <p>
            You are about to start <strong>{exam.title}</strong>.
          </p>
          <div style={{ padding: "1rem", backgroundColor: "var(--color-warning-light)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-warning-border)", fontSize: "0.9rem", color: "var(--color-warning-text)" }}>
            ⚠️ <strong>Notice:</strong> Your {exam.durationMinutes}-minute countdown will begin immediately upon confirmation. 
            Do not start unless you are ready to complete the exam.
          </div>
        </div>
      </Modal>
    </div>
  );
};
