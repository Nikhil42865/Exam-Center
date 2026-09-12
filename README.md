# ExamCenter — Examination & Assessment Platform

A production-grade, web-based examination and testing platform built with deterministic rule-based evaluation, server-synchronized exam timing, and complete candidate answer isolation.

---

## 🚀 Quick Start (Commands to Run)

From the `ExamCenter/` root directory:

### 1. Start Both Backend & Frontend in One Command
```bash
npm run dev
```
This starts:
- **Backend API**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **Frontend App**: [http://localhost:5173/](http://localhost:5173/)

---

### 2. (Optional) Run Separately in Two Terminals

If you prefer separate terminal windows:

- **Terminal 1 (Backend Server)**:
  ```bash
  npm run dev:server
  ```
- **Terminal 2 (Frontend Client)**:
  ```bash
  npm run dev:client
  ```

---

### 3. Run Automated Tests
```bash
npm test
```
Runs the full Vitest suite covering deterministic grading boundary cases, zero answer leakage security checks, authentication & role authorization, and the complete candidate lifecycle journey.

---

### 4. Re-Seed Initial Admin & Demo Exams
```bash
npm run seed
```
Seeds the initial administrator account and pre-populates sample subjects ("Computer Networks", "Database Systems") and published MCQ tests.

---

## 🔑 Default Login Credentials

| Role | Portal URL | Email | Password |
|---|---|---|---|
| **Administrator** | [http://localhost:5173/login](http://localhost:5173/login) | `admin@examcenter.internal` | `AdminPassword123!` |
| **Candidate** | [http://localhost:5173/register](http://localhost:5173/register) | *(Create any candidate account)* | *(Your password)* |

> **Tip**: On the login page, you can click the **"Quick-fill Seeded Admin Account"** button to fill in the admin credentials with one click.

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express, TypeScript, Mongoose, Pino, Helmet, CORS, Cookie-parser, Bcrypt, JsonWebToken.
- **Frontend**: React 19, TypeScript, Vite, TanStack Query, React Router, Lucide Icons, Vanilla CSS Design System.
- **Database**: MongoDB (Local instance running at `mongodb://127.0.0.1:27017/examcenter`).
- **AI Dependencies**: **Zero**. 100% deterministic rule-based evaluation.
