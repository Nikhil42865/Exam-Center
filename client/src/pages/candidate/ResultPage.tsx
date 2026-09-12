import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api.js";
import { Alert } from "../../components/ui/Alert.js";
import {
  CheckCircle2,
  XCircle,
  Award,
  Clock,
  Compass,
  History,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export const ResultPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["attempt-result", attemptId],
    queryFn: () => api.attempts.getResult(attemptId!),
    enabled: !!attemptId,
  });

  if (isLoading) {
    return (
      <div className="page-container" style={{ textAlign: "center", padding: "5rem 0" }}>
        <div className="spinner spinner-primary" style={{ width: "3rem", height: "3rem", marginBottom: "1rem" }} />
        <p style={{ fontWeight: "600" }}>Calculating deterministic score...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-container" style={{ maxWidth: "600px", margin: "3rem auto" }}>
        <Alert type="danger" message={(error as any)?.message || "Failed to load examination result."} />
        <Link to="/history" className="btn btn-secondary" style={{ marginTop: "1rem" }}>
          View Attempt History
        </Link>
      </div>
    );
  }

  const { summary, questions } = data;
  const isPassed = summary.passed;

  return (
    <div className="page-container" style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* Result Hero Banner */}
      <div
        className="card"
        style={{
          padding: "2.5rem 2rem",
          textAlign: "center",
          marginBottom: "2rem",
          background: isPassed
            ? "linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)"
            : "linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)",
          border: `1.5px solid ${isPassed ? "var(--color-success-border)" : "var(--color-danger-border)"}`,
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: isPassed ? "var(--color-success-light)" : "var(--color-danger-light)",
            color: isPassed ? "var(--color-success)" : "var(--color-danger)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1rem",
          }}
        >
          {isPassed ? <CheckCircle2 size={36} /> : <XCircle size={36} />}
        </div>

        <div style={{ fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-muted)", marginBottom: "0.25rem" }}>
          Examination Result
        </div>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{data.examTitle}</h1>

        <div style={{ display: "inline-block", margin: "1rem 0" }}>
          <span
            className={`badge ${isPassed ? "badge-success" : "badge-danger"}`}
            style={{ fontSize: "1.1rem", padding: "0.4rem 1.25rem", borderRadius: "var(--radius-full)" }}
          >
            {isPassed ? "PASSED" : "NOT PASSED"}
          </span>
        </div>

        {/* Score Display */}
        <div style={{ margin: "1.5rem 0" }}>
          <span style={{ fontSize: "3.5rem", fontWeight: "900", color: "var(--color-text)", letterSpacing: "-0.03em" }}>
            {summary.score}
          </span>
          <span style={{ fontSize: "1.75rem", color: "var(--color-muted)", fontWeight: "600" }}>
            {" "}/ {summary.maximumMarks}
          </span>
          <div style={{ fontSize: "1.15rem", fontWeight: "700", color: isPassed ? "var(--color-success)" : "var(--color-danger)" }}>
            {summary.percentage}% (Required: {summary.passingPercentage}%)
          </div>
        </div>

        {/* Breakdown Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1rem",
            maxWidth: "600px",
            margin: "2rem auto 1.5rem",
            padding: "1rem",
            backgroundColor: "var(--color-surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div>
            <div style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--color-text)" }}>
              {summary.counts.total}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-muted)", fontWeight: "600" }}>TOTAL</div>
          </div>
          <div>
            <div style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--color-success)" }}>
              {summary.counts.correct}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-muted)", fontWeight: "600" }}>CORRECT</div>
          </div>
          <div>
            <div style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--color-danger)" }}>
              {summary.counts.incorrect}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-muted)", fontWeight: "600" }}>INCORRECT</div>
          </div>
          <div>
            <div style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--color-muted)" }}>
              {summary.counts.unanswered}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-muted)", fontWeight: "600" }}>UNANSWERED</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
          <Link to="/exams" className="btn btn-primary">
            <Compass size={18} /> Explore Other Exams
          </Link>
          <Link to="/history" className="btn btn-secondary">
            <History size={18} /> View My Attempt History
          </Link>
        </div>
      </div>

      {/* Answer Review Section */}
      {summary.showAnswersAfterSubmit ? (
        <div style={{ marginTop: "3rem" }}>
          <h2 style={{ fontSize: "1.4rem", marginBottom: "1.5rem" }}>Detailed Answer Review</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {questions.map((q, idx) => {
              return (
                <div key={q.questionId} className="card">
                  <div className="card-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span style={{ fontWeight: "700" }}>Question {idx + 1}</span>
                      {q.isCorrect ? (
                        <span className="badge badge-success">Correct (+{q.marksAwarded})</span>
                      ) : !q.selectedOptionId ? (
                        <span className="badge badge-muted">Unanswered (0)</span>
                      ) : (
                        <span className="badge badge-danger">Incorrect ({q.marksAwarded})</span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "var(--color-muted)" }}>
                      Marks: {q.marksPossible}
                    </div>
                  </div>

                  <div className="card-body">
                    <p style={{ fontWeight: "600", fontSize: "1.05rem", marginBottom: "1.25rem", color: "var(--color-text)" }}>
                      {q.text}
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {q.options.map((opt, optIdx) => {
                        const isSelected = q.selectedOptionId === opt.id;
                        const isCorrect = q.correctOptionId === opt.id;
                        const optionLetter = String.fromCharCode(65 + optIdx);

                        let border = "1px solid var(--color-border)";
                        let bg = "var(--color-surface)";
                        let badgeText = null;

                        if (isCorrect) {
                          border = "2px solid var(--color-success)";
                          bg = "var(--color-success-light)";
                          badgeText = "Correct Answer";
                        } else if (isSelected && !isCorrect) {
                          border = "2px solid var(--color-danger)";
                          bg = "var(--color-danger-light)";
                          badgeText = "Your Answer";
                        }

                        return (
                          <div
                            key={opt.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "0.75rem 1rem",
                              borderRadius: "var(--radius-md)",
                              border,
                              backgroundColor: bg,
                              fontSize: "0.925rem",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                              <span style={{ fontWeight: "700", color: "var(--color-text-secondary)" }}>
                                {optionLetter}.
                              </span>
                              <span>{opt.text}</span>
                            </div>
                            {badgeText && (
                              <span
                                className={`badge ${isCorrect ? "badge-success" : "badge-danger"}`}
                                style={{ fontSize: "0.75rem" }}
                              >
                                {badgeText}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div
                        style={{
                          marginTop: "1.25rem",
                          padding: "0.875rem 1rem",
                          backgroundColor: "var(--color-info-light)",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid var(--color-info-border)",
                          fontSize: "0.875rem",
                          color: "var(--color-info-text)",
                        }}
                      >
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: "2rem", textAlign: "center", marginTop: "2rem" }}>
          <HelpCircle size={32} color="var(--color-muted)" style={{ margin: "0 auto 0.75rem" }} />
          <p style={{ fontWeight: "600", color: "var(--color-text-secondary)" }}>
            Detailed question & answer review is disabled for this exam according to institution policy.
          </p>
        </div>
      )}
    </div>
  );
};
