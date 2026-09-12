import React from "react";
import { Outlet, Link } from "react-router-dom";
import { AppHeader } from "../components/common/AppHeader.js";

export const PublicLayout: React.FC = () => {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppHeader />
      <main style={{ flex: 1, backgroundColor: "var(--color-bg)" }}>
        <Outlet />
      </main>
      <footer
        style={{
          borderTop: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface)",
          padding: "2rem 1.5rem",
          textAlign: "center",
          color: "var(--color-muted)",
          fontSize: "0.875rem",
        }}
      >
        <div className="container" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          <div>
            <strong>ExamCenter</strong> &copy; {new Date().getFullYear()} — Enterprise Testing Platform. All rights reserved.
          </div>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <Link to="/exams" style={{ color: "var(--color-text-secondary)" }}>Catalogue</Link>
            <Link to="/login" style={{ color: "var(--color-text-secondary)" }}>Sign In</Link>
            <Link to="/register" style={{ color: "var(--color-text-secondary)" }}>Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
