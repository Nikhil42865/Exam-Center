import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api.js";
import { Search, Clock, HelpCircle, Award, ArrowRight, PlayCircle, Lock } from "lucide-react";

export const CataloguePage: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ["candidate-subjects"],
    queryFn: () => api.subjects.getCandidateSubjects(),
  });

  const { data: exams, isLoading: examsLoading } = useQuery({
    queryKey: ["candidate-exams", selectedSubject, search],
    queryFn: () =>
      api.exams.getCandidateExams({
        subjectId: selectedSubject === "all" ? undefined : selectedSubject,
        search: search.trim() || undefined,
      }),
  });

  const isLoading = subjectsLoading || examsLoading;

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>Exam Catalogue</h1>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Browse available standardized tests, read instructions, and begin your timed assessments.
        </p>
      </div>

      {/* Filter Controls */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "2rem",
        }}
      >
        {/* Subject Pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          <button
            onClick={() => setSelectedSubject("all")}
            className={`btn btn-sm ${selectedSubject === "all" ? "btn-primary" : "btn-secondary"}`}
          >
            All Subjects
          </button>
          {subjects?.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubject(sub.id)}
              className={`btn btn-sm ${selectedSubject === sub.id ? "btn-primary" : "btn-secondary"}`}
            >
              {sub.name} ({sub.examCount || 0})
            </button>
          ))}
        </div>

        {/* Search Input */}
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

      {/* Exams Grid */}
      {isLoading ? (
        <div style={{ padding: "4rem", textAlign: "center" }}>
          <div className="spinner spinner-primary" style={{ width: "2.5rem", height: "2.5rem" }} />
        </div>
      ) : exams?.length === 0 ? (
        <div className="card" style={{ padding: "4rem 2rem", textAlign: "center", color: "var(--color-muted)" }}>
          <p style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "0.5rem" }}>
            No exams match your selection
          </p>
          <p style={{ fontSize: "0.9rem" }}>
            Try clearing your search query or selecting another subject filter.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {exams?.map((exam) => (
            <div
              key={exam.id}
              className="card card-clickable"
              style={{ display: "flex", flexDirection: "column", height: "100%" }}
            >
              <div className="card-body" style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem", gap: "0.5rem" }}>
                  <span className="badge badge-primary">{exam.subjectName || "Subject"}</span>
                  {exam.activeAttemptId ? (
                    <span className="badge badge-warning">In Progress</span>
                  ) : !exam.isEligible ? (
                    <span className="badge badge-danger">Not Eligible</span>
                  ) : (
                    <span className="badge badge-success">Available</span>
                  )}
                </div>

                <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem", color: "var(--color-text)" }}>
                  {exam.title}
                </h3>

                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text-secondary)",
                    marginBottom: "1.25rem",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {exam.description || "No description provided."}
                </p>

                {/* Exam Metadata Pills */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.75rem",
                    padding: "0.875rem",
                    backgroundColor: "var(--color-surface-subtle)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "0.825rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--color-text-secondary)" }}>
                    <Clock size={16} color="var(--color-primary)" />
                    <span>{exam.durationMinutes} minutes</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--color-text-secondary)" }}>
                    <HelpCircle size={16} color="var(--color-info)" />
                    <span>{exam.questionCount} questions</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--color-text-secondary)" }}>
                    <Award size={16} color="var(--color-warning)" />
                    <span>{exam.totalMarks} total marks</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--color-text-secondary)" }}>
                    <Award size={16} color="var(--color-success)" />
                    <span>Pass: {exam.passingPercentage}%</span>
                  </div>
                </div>

                {/* Attempt Status */}
                <div style={{ marginTop: "1rem", fontSize: "0.825rem", color: "var(--color-muted)", display: "flex", justifyContent: "space-between" }}>
                  <span>Attempts: {exam.attemptsUsed} / {exam.attemptLimit} used</span>
                  {exam.ineligibilityReason && (
                    <span style={{ color: "var(--color-danger)", fontWeight: "500" }}>
                      {exam.ineligibilityReason}
                    </span>
                  )}
                </div>
              </div>

              <div className="card-footer">
                <Link to={`/exams/${exam.id}`} className="btn btn-ghost btn-sm">
                  View Rules
                </Link>

                {exam.activeAttemptId ? (
                  <Link
                    to={`/exams/${exam.id}/attempt/${exam.activeAttemptId}`}
                    className="btn btn-primary btn-sm"
                  >
                    <PlayCircle size={16} /> Resume Attempt
                  </Link>
                ) : exam.isEligible ? (
                  <Link to={`/exams/${exam.id}`} className="btn btn-primary btn-sm">
                    Start Exam <ArrowRight size={16} />
                  </Link>
                ) : (
                  <button className="btn btn-secondary btn-sm" disabled>
                    <Lock size={15} /> Unavailable
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
