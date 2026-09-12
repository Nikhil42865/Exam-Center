import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Compass,
  History,
  User as UserIcon,
  BookMarked,
  FileCheck,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../../features/auth/AuthContext.js";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const candidateLinks = [
    { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { to: "/exams", label: "Explore Exams", icon: <Compass size={20} /> },
    { to: "/history", label: "My Attempts", icon: <History size={20} /> },
    { to: "/profile", label: "Profile", icon: <UserIcon size={20} /> },
  ];

  const adminLinks = [
    { to: "/admin", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { to: "/admin/subjects", label: "Subjects", icon: <BookMarked size={20} /> },
    { to: "/admin/exams", label: "Exams", icon: <FileCheck size={20} /> },
    { to: "/admin/results", label: "Results & Reports", icon: <BarChart3 size={20} /> },
  ];

  const links = isAdmin ? adminLinks : candidateLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.4)",
            zIndex: 90,
            display: "block",
          }}
          className="sidebar-backdrop"
        />
      )}

      <aside
        style={{
          width: "var(--sidebar-width)",
          backgroundColor: "var(--color-surface)",
          borderRight: "1px solid var(--color-border)",
          height: "calc(100vh - var(--header-height))",
          position: "sticky",
          top: "var(--header-height)",
          display: "flex",
          flexDirection: "column",
          padding: "1.5rem 1rem",
          zIndex: 95,
        }}
      >
        <div style={{ marginBottom: "1.5rem", padding: "0 0.5rem" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-muted)" }}>
            {isAdmin ? "Admin Console" : "Candidate Portal"}
          </span>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.35rem", flex: 1 }}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/admin" || link.to === "/dashboard"}
              onClick={onClose}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "0.875rem",
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-md)",
                fontWeight: isActive ? "600" : "500",
                fontSize: "0.925rem",
                color: isActive ? "var(--color-primary)" : "var(--color-text-secondary)",
                backgroundColor: isActive ? "var(--color-primary-light)" : "transparent",
                transition: "all var(--transition-fast)",
                textDecoration: "none",
              })}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: "1rem", backgroundColor: "var(--color-surface-subtle)", borderRadius: "var(--radius-md)" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--color-text)" }}>
            ExamCenter MVP
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>
            Deterministic Testing Platform
          </div>
        </div>
      </aside>
    </>
  );
};
