import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Timer, CheckCircle, Award, ArrowRight, BookOpen } from "lucide-react";
import { useAuth } from "../../features/auth/AuthContext.js";

export const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          background: "linear-gradient(135deg, #eef2ff 0%, #ffffff 50%, #f8fafc 100%)",
          padding: "5rem 1.5rem 4rem",
          borderBottom: "1px solid var(--color-border)",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.35rem 1rem",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--color-primary-light)",
              color: "var(--color-primary)",
              fontWeight: "600",
              fontSize: "0.85rem",
              marginBottom: "1.5rem",
              border: "1px solid var(--color-primary-border)",
            }}
          >
            <ShieldCheck size={16} />
            <span>Robust, Rule-Based Examination Engine</span>
          </div>

          <h1
            style={{
              fontSize: "3rem",
              fontWeight: "800",
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              marginBottom: "1.25rem",
              color: "var(--color-text)",
            }}
          >
            Test your knowledge across every subject.
          </h1>

          <p
            style={{
              fontSize: "1.25rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.6,
              marginBottom: "2.5rem",
            }}
          >
            A distraction-free, reliable examination platform. Experience accurate timed assessments, 
            instant deterministic evaluation, and comprehensive answer reviews.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
            {user ? (
              <Link to={user.role === "admin" ? "/admin" : "/dashboard"} className="btn btn-primary btn-lg">
                Go to {user.role === "admin" ? "Admin Console" : "Dashboard"} <ArrowRight size={20} />
              </Link>
            ) : (
              <>
                <Link to="/exams" className="btn btn-primary btn-lg">
                  Explore Exams <ArrowRight size={20} />
                </Link>
                <Link to="/register" className="btn btn-secondary btn-lg">
                  Create Candidate Account
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="container" style={{ padding: "4rem 1.5rem" }}>
        <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 3rem" }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>Why ExamCenter?</h2>
          <p>Built from the ground up for absolute fairness, test integrity, and user ease.</p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "2rem",
          }}
        >
          <div className="card" style={{ padding: "2rem" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--color-primary-light)",
                color: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.25rem",
              }}
            >
              <Timer size={26} />
            </div>
            <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Server-Authoritative Timing</h3>
            <p style={{ fontSize: "0.95rem" }}>
              Exam clocks are locked to server timestamps. Page refreshes, tab closures, or device restarts 
              preserve your time and saved answers accurately.
            </p>
          </div>

          <div className="card" style={{ padding: "2rem" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--color-success-light)",
                color: "var(--color-success-text)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.25rem",
              }}
            >
              <ShieldCheck size={26} />
            </div>
            <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Zero-Leak Security</h3>
            <p style={{ fontSize: "0.95rem" }}>
              Correct answers and metadata are cryptographically isolated on the server. Never inspected in browser 
              inspectors or client memory until legitimate post-exam review.
            </p>
          </div>

          <div className="card" style={{ padding: "2rem" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--color-warning-light)",
                color: "var(--color-warning-text)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.25rem",
              }}
            >
              <Award size={26} />
            </div>
            <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Deterministic Scoring</h3>
            <p style={{ fontSize: "0.95rem" }}>
              Objective MCQ grading with negative marks handling, immediate pass/fail calculation, 
              and immutable historical attempt snapshots.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
