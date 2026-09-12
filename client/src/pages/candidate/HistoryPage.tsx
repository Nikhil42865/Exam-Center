import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api.js";
import { History, PlayCircle, Eye, Compass } from "lucide-react";

export const HistoryPage: React.FC = () => {
  const { data: history, isLoading } = useQuery({
    queryKey: ["candidate-history"],
    queryFn: () => api.attempts.getCandidateHistory(),
  });

  return (
    <div className="page-container">
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>My Attempt History</h1>
        <p style={{ color: "var(--color-text-secondary)" }}>
          A permanent record of all your submitted and in-progress examination sessions.
        </p>
      </div>

      <div className="card">
        <div className="table-responsive">
          {isLoading ? (
            <div style={{ padding: "4rem", textAlign: "center" }}>
              <div className="spinner spinner-primary" />
            </div>
          ) : history?.length === 0 ? (
            <div style={{ padding: "4rem 2rem", textAlign: "center", color: "var(--color-muted)" }}>
              <History size={40} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
              <p style={{ fontWeight: "600", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                No exam attempts found
              </p>
              <p style={{ fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                Browse our subject catalogue to start your first exam.
              </p>
              <Link to="/exams" className="btn btn-primary">
                <Compass size={18} /> Explore Exams
              </Link>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Exam Title</th>
                  <th>Subject</th>
                  <th>Attempt #</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Outcome</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {history?.map((attempt) => {
                  const isInProgress = attempt.status === "in_progress";
                  return (
                    <tr key={attempt.id}>
                      <td style={{ fontWeight: "600" }}>{attempt.examTitle}</td>
                      <td>{attempt.subjectName || "—"}</td>
                      <td>Attempt #{attempt.sequenceNumber}</td>
                      <td>
                        {new Date(attempt.submittedAt || attempt.startedAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td>
                        {isInProgress ? (
                          <span className="badge badge-warning">In Progress</span>
                        ) : attempt.status === "expired" ? (
                          <span className="badge badge-muted">Expired</span>
                        ) : (
                          <span className="badge badge-success">Submitted</span>
                        )}
                      </td>
                      <td>
                        {isInProgress ? (
                          <span style={{ color: "var(--color-muted)" }}>—</span>
                        ) : attempt.showScoreAfterSubmit && attempt.score !== undefined ? (
                          <span style={{ fontWeight: "700" }}>
                            {attempt.score}/{attempt.maximumMarks} ({attempt.percentage}%)
                          </span>
                        ) : (
                          <span style={{ color: "var(--color-muted)" }}>Hidden</span>
                        )}
                      </td>
                      <td>
                        {isInProgress ? (
                          <span style={{ color: "var(--color-muted)" }}>—</span>
                        ) : attempt.passed ? (
                          <span className="badge badge-success">Passed</span>
                        ) : (
                          <span className="badge badge-danger">Not Passed</span>
                        )}
                      </td>
                      <td>
                        {isInProgress ? (
                          <Link
                            to={`/exams/${attempt.examId}/attempt/${attempt.id}`}
                            className="btn btn-primary btn-sm"
                          >
                            <PlayCircle size={15} /> Resume
                          </Link>
                        ) : (
                          <Link to={`/results/${attempt.id}`} className="btn btn-outline btn-sm">
                            <Eye size={15} /> Result
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
