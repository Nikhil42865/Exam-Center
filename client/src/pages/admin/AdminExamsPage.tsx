import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../services/api.js";
import {
  PlusCircle,
  Edit,
  Eye,
  CheckCircle,
  Archive,
  Search,
  RotateCcw,
  Clock,
  HelpCircle,
  Award,
} from "lucide-react";

export const AdminExamsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  const { data: exams, isLoading } = useQuery({
    queryKey: ["admin-exams", statusFilter, search],
    queryFn: () =>
      api.exams.getAdminExams({
        status: statusFilter === "all" ? undefined : statusFilter,
        search: search.trim() || undefined,
      }),
  });

  const handlePublish = async (id: string, title: string) => {
    if (window.confirm(`Are you ready to publish "${title}"? Candidates will immediately be able to take it.`)) {
      try {
        await api.exams.publishExam(id);
        queryClient.invalidateQueries({ queryKey: ["admin-exams"] });
      } catch (err: any) {
        alert(err.message || "Failed to publish exam");
      }
    }
  };

  const handleUnpublish = async (id: string, title: string) => {
    if (window.confirm(`Unpublish "${title}"? The exam will revert to Draft status.`)) {
      try {
        await api.exams.unpublishExam(id);
        queryClient.invalidateQueries({ queryKey: ["admin-exams"] });
      } catch (err: any) {
        alert(err.message || "Failed to unpublish exam");
      }
    }
  };

  const handleArchive = async (id: string, title: string) => {
    if (window.confirm(`Archive "${title}"? Historical candidate attempts will be preserved, but the exam will be hidden.`)) {
      try {
        await api.exams.archiveExam(id);
        queryClient.invalidateQueries({ queryKey: ["admin-exams"] });
      } catch (err: any) {
        alert(err.message || "Failed to archive exam");
      }
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
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
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>Exam Management</h1>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Build exams, configure scoring policies, manage questions, and publish tests.
          </p>
        </div>

        <Link to="/admin/exams/new" className="btn btn-primary">
          <PlusCircle size={18} /> Create New Exam
        </Link>
      </div>

      {/* Tabs and Search */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        {/* Status Tabs */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {["all", "draft", "published", "archived"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`btn btn-sm ${statusFilter === st ? "btn-primary" : "btn-secondary"}`}
              style={{ textTransform: "capitalize" }}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: "relative", minWidth: "260px" }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search exams by title..."
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

      {/* Table */}
      <div className="card">
        <div className="table-responsive">
          {isLoading ? (
            <div style={{ padding: "4rem", textAlign: "center" }}>
              <div className="spinner spinner-primary" />
            </div>
          ) : exams?.length === 0 ? (
            <div style={{ padding: "4rem 2rem", textAlign: "center", color: "var(--color-muted)" }}>
              No exams found. Click "Create New Exam" to get started.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Exam Title</th>
                  <th>Subject</th>
                  <th>Questions</th>
                  <th>Duration</th>
                  <th>Pass Mark</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams?.map((exam) => (
                  <tr key={exam.id}>
                    <td>
                      <div style={{ fontWeight: "600" }}>{exam.title}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}>
                        v{exam.version} · {exam.slug}
                      </div>
                    </td>
                    <td>{exam.subjectName || "—"}</td>
                    <td>
                      <span style={{ fontWeight: "600" }}>{exam.questionCount}</span> ({exam.totalMarks} marks)
                    </td>
                    <td>{exam.durationMinutes} mins</td>
                    <td>{exam.passingPercentage}%</td>
                    <td>
                      {exam.status === "published" ? (
                        <span className="badge badge-success">Published</span>
                      ) : exam.status === "draft" ? (
                        <span className="badge badge-warning">Draft</span>
                      ) : (
                        <span className="badge badge-muted">Archived</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <Link
                          to={`/admin/exams/${exam.id}/edit`}
                          className="btn btn-secondary btn-icon"
                          title="Edit Exam & Questions"
                        >
                          <Edit size={15} />
                        </Link>

                        {exam.status === "draft" && (
                          <button
                            onClick={() => handlePublish(exam.id, exam.title)}
                            className="btn btn-primary btn-icon"
                            title="Publish Exam"
                          >
                            <CheckCircle size={15} />
                          </button>
                        )}

                        {exam.status === "published" && (
                          <button
                            onClick={() => handleUnpublish(exam.id, exam.title)}
                            className="btn btn-secondary btn-icon"
                            title="Unpublish to Draft"
                          >
                            <RotateCcw size={15} />
                          </button>
                        )}

                        {exam.status !== "archived" && (
                          <button
                            onClick={() => handleArchive(exam.id, exam.title)}
                            className="btn btn-ghost btn-icon"
                            title="Archive Exam"
                          >
                            <Archive size={15} color="var(--color-danger)" />
                          </button>
                        )}
                      </div>
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
