import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext.js";
import { LogOut, User, Menu, BookOpen } from "lucide-react";

interface AppHeaderProps {
  onToggleSidebar?: () => void;
  title?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onToggleSidebar, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header
      style={{
        height: "var(--header-height)",
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.5rem",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="btn btn-ghost btn-icon"
            aria-label="Toggle navigation menu"
          >
            <Menu size={20} />
          </button>
        )}

        <Link
          to={user?.role === "admin" ? "/admin" : "/dashboard"}
          style={{ display: "flex", alignItems: "center", gap: "0.65rem", textDecoration: "none" }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--color-primary)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BookOpen size={20} />
          </div>
          <span style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--color-text)", letterSpacing: "-0.02em" }}>
            ExamCenter
          </span>
        </Link>

        {title && (
          <div style={{ marginLeft: "1.5rem", borderLeft: "1px solid var(--color-border)", paddingLeft: "1.5rem" }}>
            <span style={{ fontSize: "1rem", fontWeight: "600", color: "var(--color-text-secondary)" }}>
              {title}
            </span>
          </div>
        )}
      </div>

      {user ? (
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", textAlign: "right" }}>
            <div>
              <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--color-text)" }}>
                {user.name}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", justifyContent: "flex-end" }}>
                <span className={`badge ${user.role === "admin" ? "badge-primary" : "badge-muted"}`}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-icon"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={19} color="var(--color-muted)" />
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link to="/login" className="btn btn-ghost btn-sm">
            Sign In
          </Link>
          <Link to="/register" className="btn btn-primary btn-sm">
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
};
