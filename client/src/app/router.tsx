import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { PublicLayout } from "../layouts/PublicLayout.js";
import { CandidateLayout, AdminLayout } from "../layouts/CandidateLayout.js";
import { ProtectedRoute } from "../features/auth/ProtectedRoute.js";

// Pages
import { HomePage } from "../pages/public/HomePage.js";
import { LoginPage } from "../pages/public/LoginPage.js";
import { RegisterPage } from "../pages/public/RegisterPage.js";

// Candidate Pages
import { DashboardPage } from "../pages/candidate/DashboardPage.js";
import { CataloguePage } from "../pages/candidate/CataloguePage.js";
import { ExamDetailPage } from "../pages/candidate/ExamDetailPage.js";
import { ActiveExamPage } from "../pages/candidate/ActiveExamPage.js";
import { ResultPage } from "../pages/candidate/ResultPage.js";
import { HistoryPage } from "../pages/candidate/HistoryPage.js";
import { ProfilePage } from "../pages/candidate/ProfilePage.js";

// Admin Pages
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage.js";
import { AdminSubjectsPage } from "../pages/admin/AdminSubjectsPage.js";
import { AdminExamsPage } from "../pages/admin/AdminExamsPage.js";
import { AdminExamEditorPage } from "../pages/admin/AdminExamEditorPage.js";
import { AdminResultsPage } from "../pages/admin/AdminResultsPage.js";

export const router = createBrowserRouter([
  // Public Routes
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "exams", element: <CataloguePage /> },
    ],
  },

  // Candidate Protected Routes
  {
    path: "/",
    element: (
      <ProtectedRoute allowedRoles={["candidate", "admin"]}>
        <CandidateLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <DashboardPage /> },
      { path: "exams/:id", element: <ExamDetailPage /> },
      { path: "results/:attemptId", element: <ResultPage /> },
      { path: "history", element: <HistoryPage /> },
      { path: "profile", element: <ProfilePage /> },
    ],
  },

  // Active Exam Route (Distraction-free, no standard layout)
  {
    path: "/exams/:examId/attempt/:attemptId",
    element: (
      <ProtectedRoute allowedRoles={["candidate", "admin"]}>
        <ActiveExamPage />
      </ProtectedRoute>
    ),
  },

  // Admin Protected Routes
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: "subjects", element: <AdminSubjectsPage /> },
      { path: "exams", element: <AdminExamsPage /> },
      { path: "exams/new", element: <AdminExamEditorPage /> },
      { path: "exams/:id/edit", element: <AdminExamEditorPage /> },
      { path: "results", element: <AdminResultsPage /> },
    ],
  },

  // Catch-all
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
