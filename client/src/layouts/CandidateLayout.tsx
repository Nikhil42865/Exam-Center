import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppHeader } from "../components/common/AppHeader.js";
import { Sidebar } from "../components/common/Sidebar.js";

export const CandidateLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppHeader onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main style={{ flex: 1, backgroundColor: "var(--color-bg)", minWidth: 0 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppHeader title="Admin Portal" onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main style={{ flex: 1, backgroundColor: "var(--color-bg)", minWidth: 0 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
