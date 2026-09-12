import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api.js";
import { Modal } from "../../components/ui/Modal.js";
import { Search, Eye, BarChart3, CheckCircle2, XCircle } from "lucide-react";

export const AdminResultsPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialAttemptId = queryParams.get("attemptId");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [passedFilter, setPassedFilter] = useState<string>("all");
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(initialAttemptId);

  // Fetch attempts list
  const { data: attempts, isLoading } = useQuery({
    queryKey: ["admin-attempts", search, statusFilter, passedFilter],
    queryFn: () =>
      api.reports.getAttempts({
        search: search.trim() || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        passed: passedFilter === "all" ? undefined : passedFilter === "passed",
      }),
  });

  // Fetch single attempt detail when selected
  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ["admin-attempt-detail", selectedAttemptId],
    queryFn: () => api.reports.getAttemptDetail(selectedAttemptId!),
    enabled: !!selectedAttemptId,
  });

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>Candidate Results & Reports</h1>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Audit individual candidate submissions, evaluate pass rates, and verify deterministic grading integrity.
        </p>
      </div>

      {/* Filters Bar */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {/* Status Filter */}
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: "160px" }}
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="expired">Auto-Expired</option>
            <option value="in_progress">In Progress</option>
          </select>

          {/* Outcome Filter */}
          <select
            className="form-select"
            value={passedFilter}
            onChange={(e) => setPassedFilter(e.target.value)}
            style={{ width: "160px" }}
          >
            <option value="all">All Outcomes</option>
            <option value="passed">Passed Only</option>
            <option value="failed">Failed Only</option>
          </select>
        </div>

        {/* Search */}
        <div style={{ position: "relative", minWidth: "280px" }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search candidate name or exam..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "2.25rem" }}
          />
          <Search
            size={16}
            color="var(--color-muted)"
            style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }}
          />
        </div>
      </div>

      {/* Attempts Table */}
      <div className="card">
        <div className="table-responsive">
          {isLoading ? (
            <div style={{ padding: "4rem", textAlign: "center" }}>
              <div className="spinner spinner-primary" />
            </div>
          ) : attempts?.length === 0 ? (
            <div style={{ padding: "4rem 2rem", textAlign: "center", color: "var(--color-muted)" }}>
              <BarChart3 size={40} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
              <p style={{ fontWeight: "600", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                No candidate attempts found
              </p>
              <p style={{ fontSize: "0.9rem" }}>Try loosening your filters or search terms.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Exam Title</th>
                  <th>Subject</th>
                  <th>Attempt</th>
                  <th>Score</th>
                  <th>Outcome</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {attempts?.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ fontWeight: "600" }}>{a.candidateName}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}>
                        {a.candidateEmail}
                      </div>
                    </td>
                    <td style={{ fontWeight: "500" }}>{a.examTitle}</td>
                    <td>{a.subjectName || "—"}</td>
                    <td>#{a.sequenceNumber}</td>
                    <td>
                      <span style={{ fontWeight: "700" }}>
                        {a.score}/{a.maximumMarks} ({a.percentage}%)
                      </span>
                    </td>
                    <td>
                      {a.status === "in_progress" ? (
                        <span className="badge badge-warning">Active</span>
                      ) : a.passed ? (
                        <span className="badge badge-success">Passed</span>
                      ) : (
                        <span className="badge badge-danger">Not Passed</span>
                      )}
                    </td>
                    <td>
                      {new Date(a.submittedAt || a.startedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedAttemptId(a.id)}
                        className="btn btn-outline btn-sm"
                      >
                        <Eye size={14} /> View Audit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Attempt Audit Detail Modal */}
      <Modal
        isOpen={!!selectedAttemptId}
        onClose={() => setSelectedAttemptId(null)}
        title="Candidate Attempt Audit"
        size="large"
      >
        {detailLoading || !detailData ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <div className="spinner spinner-primary" />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Header Summary */}
            <div
              style={{
                padding: "1.25rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--color-surface-subtle)",
                border: "1px solid var(--color-border)",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "1rem",
              }}
            >
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-muted)", fontWeight: "600" }}>CANDIDATE</div>
                <div style={{ fontWeight: "700" }}>{detailData.attempt.candidateName}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}>{detailData.attempt.candidateEmail}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-muted)", fontWeight: "600" }}>SCORE</div>
                <div style={{ fontWeight: "800", fontSize: "1.2rem", color: detailData.attempt.passed ? "var(--color-success)" : "var(--color-danger)" }}>
                  {detailData.attempt.score} / {detailData.attempt.maximumMarks} ({detailData.attempt.percentage}%)
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-muted)", fontWeight: "600" }}>OUTCOME</div>
                <div style={{ marginTop: "2px" }}>
                  <span className={`badge ${detailData.attempt.passed ? "badge-success" : "badge-danger"}`}>
                    {detailData.attempt.passed ? "PASSED" : "FAILED"}
                  </span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-muted)", fontWeight: "600" }}>BREAKDOWN</div>
                <div style={{ fontSize: "0.85rem", marginTop: "2px" }}>
                  {detailData.counts.correct} correct · {detailData.counts.incorrect} wrong · {detailData.counts.unanswered} skipped
                </div>
              </div>
            </div>

            {/* Questions Inspection List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {detailData.questions.map((q, idx) => (
                <div key={q.questionId} className="card">
                  <div className="card-header" style={{ padding: "0.75rem 1.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontWeight: "700" }}>Q{idx + 1}.</span>
                      <span style={{ fontWeight: "600" }}>{q.text}</span>
                    </div>
                    <div>
                      {q.isCorrect ? (
                        <span className="badge badge-success">+{q.marksAwarded} marks</span>
                      ) : !q.selectedOptionId ? (
                        <span className="badge badge-muted">Unanswered (0)</span>
                      ) : (
                        <span className="badge badge-danger">{q.marksAwarded} marks</span>
                      )}
                    </div>
                  </div>

                  <div className="card-body" style={{ padding: "0.875rem 1.25rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = opt.id === q.correctOptionId;
                        const isSelected = opt.id === q.selectedOptionId;
                        const letter = String.fromCharCode(65 + optIdx);

                        let bg = "transparent";
                        let border = "1px solid var(--color-border)";

                        if (isCorrect) {
                          bg = "var(--color-success-light)";
                          border = "1.5px solid var(--color-success)";
                        } else if (isSelected && !isCorrect) {
                          bg = "var(--color-danger-light)";
                          border = "1.5px solid var(--color-danger)";
                        }

                        return (
                          <div
                            key={opt.id}
                            style={{
                              padding: "0.5rem 0.75rem",
                              borderRadius: "var(--radius-md)",
                              backgroundColor: bg,
                              border,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              fontSize: "0.85rem",
                            }}
                          >
                            <span>
                              <strong>{letter}.</strong> {opt.text}
                            </span>
                            <div style={{ display: "flex", gap: "0.35rem" }}>
                              {isSelected && (
                                <span className="badge badge-muted" style={{ fontSize: "0.7rem" }}>
                                  Candidate Choice
                                </span>
                              )}
                              {isCorrect && (
                                <span className="badge badge-success" style={{ fontSize: "0.7rem" }}>
                                  Correct Key
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "var(--color-muted)" }}>
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
