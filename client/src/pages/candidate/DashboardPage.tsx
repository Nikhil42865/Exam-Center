import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api.js";
import { useAuth } from "../../features/auth/AuthContext.js";
import { Alert } from "../../components/ui/Alert.js";
import {
  Compass,
  CheckCircle2,
  Clock,
  Award,
  ArrowRight,
  PlayCircle,
  FileCheck,
} from "lucide-react";

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const { data: exams, isLoading: examsLoading } = useQuery({
    queryKey: ["candidate-exams"],
    queryFn: () => api.exams.getCandidateExams(),
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ["candidate-history"],
    queryFn: () => api.attempts.getCandidateHistory(),
  });

  const isLoading = examsLoading || historyLoading;

  // Compute metrics
  const completedAttempts = history?.filter((h) => h.status !== "in_progress") || [];
  const passedAttempts = completedAttempts.filter((h) => h.passed);
  const totalScorePct = completedAttempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
  const avgScore = completedAttempts.length > 0 ? Math.round(totalScorePct / completedAttempts.length) : 0;

  // Check for active in-progress exam
  const inProgressAttempt = history?.find((h) => h.status === "in_progress");

  return (
    <div className="page-container">
      {/* Greeting */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>
            Welcome back, {user?.name}!
          </h1>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Discover assessments, monitor your testing performance, and review past results.
          </p>
        </div>
        <Link to="/exams" className="btn btn-primary">
          <Compass size={18} /> Explore Exams
        </Link>
      </div>

      {/* Active in-progress banner */}
      {inProgressAttempt && (
        <div
          style={{
            marginBottom: "2rem",
            padding: "1.25rem 1.5rem",
            borderRadius: "var(--radius-lg)",
            background: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
            border: "1.5px solid var(--color-primary-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--color-primary)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Clock size={24} />
            </div>
            <div>
              <div style={{ fontWeight: "700", color: "var(--color-text)", fontSize: "1.05rem" }}>
                Active Attempt in Progress: {inProgressAttempt.examTitle}
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                Your exam timer is currently running on the server.
              </div>
            </div>
          </div>
          <Link
            to={`/exams/${inProgressAttempt.examId}/attempt/${inProgressAttempt.id}`}
            className="btn btn-primary"
          >
            <PlayCircle size={18} /> Resume Exam Now
          </Link>
        </div>
      )}

      {/* Metric Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.25rem",
          marginBottom: "2.5rem",
        }}
      >
        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--color-muted)" }}>Available Exams</span>
            <Compass size={20} color="var(--color-primary)" />
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "800", color: "var(--color-text)" }}>
            {exams?.length || 0}
          </div>
        </div>

        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--color-muted)" }}>Attempts Taken</span>
            <FileCheck size={20} color="var(--color-info)" />
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "800", color: "var(--color-text)" }}>
            {completedAttempts.length}
          </div>
        </div>

        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--color-muted)" }}>Exams Passed</span>
            <CheckCircle2 size={20} color="var(--color-success)" />
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "800", color: "var(--color-text)" }}>
            {passedAttempts.length}
          </div>
        </div>

        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--color-muted)" }}>Average Score</span>
            <Award size={20} color="var(--color-warning)" />
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "800", color: "var(--color-text)" }}>
            {avgScore}%
          </div>
        </div>
      </div>

      {/* Recent Attempts Table */}
      <div className="card">
        <div className="card-header">
          <h2 style={{ fontSize: "1.15rem" }}>Recent Attempt History</h2>
          <Link to="/history" className="btn btn-ghost btn-sm">
            View All History <ArrowRight size={16} />
          </Link>
        </div>

        <div className="table-responsive">
          {isLoading ? (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <div className="spinner spinner-primary" />
            </div>
          ) : completedAttempts.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-muted)" }}>
              <Compass size={40} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
              <p style={{ fontWeight: "500", marginBottom: "1rem" }}>You haven't completed any exams yet.</p>
              <Link to="/exams" className="btn btn-primary btn-sm">
                Browse Exam Catalogue
              </Link>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Exam Title</th>
                  <th>Subject</th>
                  <th>Submitted At</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {completedAttempts.slice(0, 5).map((attempt) => (
                  <tr key={attempt.id}>
                    <td style={{ fontWeight: "600" }}>{attempt.examTitle}</td>
                    <td>{attempt.subjectName || "—"}</td>
                    <td>{attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString() : "—"}</td>
                    <td>
                      {attempt.showScoreAfterSubmit && attempt.score !== undefined ? (
                        <span style={{ fontWeight: "700" }}>
                          {attempt.score}/{attempt.maximumMarks} ({attempt.percentage}%)
                        </span>
                      ) : (
                        <span style={{ color: "var(--color-muted)" }}>Score hidden</span>
                      )}
                    </td>
                    <td>
                      {attempt.passed ? (
                        <span className="badge badge-success">Passed</span>
                      ) : (
                        <span className="badge badge-danger">Not Passed</span>
                      )}
                    </td>
                    <td>
                      <Link to={`/results/${attempt.id}`} className="btn btn-outline btn-sm">
                        View Result
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
