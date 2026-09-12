import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api.js";
import {
  FileCheck,
  BookMarked,
  Users,
  Award,
  PlusCircle,
  BarChart3,
  CheckCircle2,
  XCircle,
  Eye,
} from "lucide-react";

export const AdminDashboardPage: React.FC = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["admin-dashboard-metrics"],
    queryFn: () => api.reports.getDashboardMetrics(),
  });

  return (
    <div className="page-container">
      {/* Header & Quick Actions */}
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
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>Admin Dashboard</h1>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Real-time platform overview, exam publishing status, and assessment results.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link to="/admin/subjects" className="btn btn-secondary btn-sm">
            <PlusCircle size={16} /> New Subject
          </Link>
          <Link to="/admin/exams/new" className="btn btn-primary btn-sm">
            <PlusCircle size={16} /> Create New Exam
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1.25rem",
          marginBottom: "2.5rem",
        }}
      >
        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-muted)" }}>Total Exams</span>
            <FileCheck size={20} color="var(--color-primary)" />
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "800", color: "var(--color-text)" }}>
            {isLoading ? "..." : metrics?.totalExams || 0}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--color-muted)", marginTop: "0.35rem" }}>
            {metrics?.publishedExams || 0} published · {metrics?.draftExams || 0} drafts
          </div>
        </div>

        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-muted)" }}>Active Subjects</span>
            <BookMarked size={20} color="var(--color-accent)" />
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "800", color: "var(--color-text)" }}>
            {isLoading ? "..." : metrics?.totalSubjects || 0}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--color-muted)", marginTop: "0.35rem" }}>
            In catalogue
          </div>
        </div>

        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-muted)" }}>Total Attempts</span>
            <Users size={20} color="var(--color-info)" />
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "800", color: "var(--color-text)" }}>
            {isLoading ? "..." : metrics?.totalAttempts || 0}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--color-muted)", marginTop: "0.35rem" }}>
            {metrics?.completedAttempts || 0} completed
          </div>
        </div>

        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-muted)" }}>Pass Rate</span>
            <CheckCircle2 size={20} color="var(--color-success)" />
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "800", color: "var(--color-text)" }}>
            {isLoading ? "..." : `${metrics?.passRatePercentage || 0}%`}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--color-muted)", marginTop: "0.35rem" }}>
            Average: {metrics?.averageScorePercentage || 0}%
          </div>
        </div>
      </div>

      {/* Recent Attempts Feed */}
      <div className="card">
        <div className="card-header">
          <h2 style={{ fontSize: "1.15rem" }}>Recent Candidate Attempts</h2>
          <Link to="/admin/results" className="btn btn-ghost btn-sm">
            View All Reports <BarChart3 size={16} />
          </Link>
        </div>

        <div className="table-responsive">
          {isLoading ? (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <div className="spinner spinner-primary" />
            </div>
          ) : metrics?.recentAttempts.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-muted)" }}>
              No candidate attempts recorded yet.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Exam</th>
                  <th>Subject</th>
                  <th>Score</th>
                  <th>Outcome</th>
                  <th>Submitted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {metrics?.recentAttempts.map((attempt) => (
                  <tr key={attempt.id}>
                    <td>
                      <div style={{ fontWeight: "600" }}>{attempt.candidateName}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}>
                        {attempt.candidateEmail}
                      </div>
                    </td>
                    <td style={{ fontWeight: "500" }}>{attempt.examTitle}</td>
                    <td>{attempt.subjectName || "—"}</td>
                    <td style={{ fontWeight: "700" }}>
                      {attempt.score}/{attempt.maximumMarks} ({attempt.percentage}%)
                    </td>
                    <td>
                      {attempt.passed ? (
                        <span className="badge badge-success">Passed</span>
                      ) : (
                        <span className="badge badge-danger">Not Passed</span>
                      )}
                    </td>
                    <td>
                      {attempt.submittedAt
                        ? new Date(attempt.submittedAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "In progress"}
                    </td>
                    <td>
                      <Link to={`/admin/results?attemptId=${attempt.id}`} className="btn btn-outline btn-sm">
                        <Eye size={14} /> Audit
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
