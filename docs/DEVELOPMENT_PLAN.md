# ExamCenter — Development Plan

**Version:** 1.0  
**Strategy:** Vertical slices with verification after every phase  
**Suggested duration:** 8–10 weeks for one developer working consistently

## 1. Delivery principles

- Build the smallest complete candidate/admin workflow first.
- Put business rules in backend services, never only in the UI.
- Write tests alongside grading, authorization, timing, and state transitions.
- Keep the application deployable at the end of every phase.
- Use manual question entry and deterministic grading only; do not add AI dependencies.
- Do not move to the next phase until its exit criteria pass.

## 2. Milestones

| Milestone | Outcome | Suggested time |
|---|---|---|
| M0 | Scope, repository, tooling, and UI foundation | 3–4 days |
| M1 | Authentication and role protection | 5–7 days |
| M2 | Subjects and draft exam management | 5–7 days |
| M3 | Question editor and publishing | 7–9 days |
| M4 | Candidate catalogue and timed attempt | 8–10 days |
| M5 | Grading, results, and history | 6–8 days |
| M6 | Admin reporting and hardening | 5–7 days |
| M7 | Production deployment and release | 4–6 days |

## 3. Phase 0 — Product and project setup

### Tasks

- Review and freeze the MVP in the five documents under `docs/`.
- Create repository structure: `client`, `server`, and `shared/contracts`.
- Initialize React + Vite + TypeScript.
- Initialize Express + TypeScript.
- Configure ESLint, Prettier, strict TypeScript, and path aliases.
- Add `.env.example`, environment validation, and separate test configuration.
- Configure Vitest, Supertest, React Testing Library, and Playwright.
- Set up MongoDB connection and health endpoint.
- Create shared API error/response types.
- Build CSS tokens and foundational components: Button, Input, Card, Alert, Modal, Spinner.
- Add CI for lint, type-check, unit tests, and production build.

### Verification

- Client and server start locally with one command each.
- `GET /api/v1/health` returns success.
- CI passes on a clean checkout.
- No secrets are committed.

### Exit criteria

- Base project is deployable and documented.

## 4. Phase 1 — Authentication and roles

### Backend

- User schema with candidate/admin role and account status.
- Register, login, refresh, logout, and `GET /users/me` endpoints.
- Password hashing and authentication-cookie/token strategy.
- Authentication, active-account, and role middleware.
- Seed script for the first admin; prevent admin self-registration.
- Rate limits and generic auth errors.

### Frontend

- Login and registration pages.
- Auth provider/session bootstrap.
- Public, candidate, and admin route guards.
- Candidate and admin layouts with responsive navigation.
- Profile and logout flows.

### Tests

- Registration validation and duplicate email.
- Login success/failure, refresh rotation, logout.
- Candidate cannot access admin endpoint.
- Disabled user cannot use protected endpoints.
- Route-guard loading state does not flash protected content.

### Exit criteria

- Seeded admin and registered candidate can sign in and reach only their permitted layout.

## 5. Phase 2 — Subjects and draft exams

### Backend

- Subject and Exam schemas with indexes and state fields.
- Admin subject CRUD with deactivate/soft-delete behaviour.
- Admin exam list/create/read/update endpoints.
- Validation for rules, dates, duration, pass mark, and attempt limit.
- Candidate subject/exam catalogue endpoints with safe projections.

### Frontend

- Admin subject table and create/edit form.
- Admin exam list with state filters.
- Exam editor steps for basic details and rules.
- Candidate catalogue shell and exam-card components.

### Tests

- Duplicate subject/slug validation.
- Candidate cannot see draft/archived exams.
- Availability and active-subject filters.
- Admin-only mutation checks.

### Exit criteria

- Admin can create a valid draft exam associated with a subject.

## 6. Phase 3 — Questions, preview, and publishing

### Backend

- Question schema and admin CRUD endpoints.
- Validate two-to-six options and exactly one correct option.
- Reordering endpoint with atomic validation.
- Publish validation service and state transitions.
- Version increment/snapshot policy for published content.
- Admin preview endpoint with correct answers.
- Candidate serializers that remove all answer metadata.

### Frontend

- Question list and running totals.
- Question form with dynamic options and explicit correct-answer radio.
- Duplicate, edit, delete, and reorder interactions.
- Validation summary and invalid-question links.
- Exam preview and publish checklist/dialog.

### Tests

- Question validation boundaries.
- Correct option must belong to the question.
- Cannot publish an empty or invalid exam.
- Candidate DTO recursively excludes correct-answer fields.
- Published and archived state transitions.

### Exit criteria

- Admin can build, preview, and publish a complete ten-question exam.

## 7. Phase 4 — Candidate catalogue and exam attempt

### Backend

- Attempt schema with immutable exam/question snapshot.
- Eligibility service: publication, dates, account, attempt limit, and active attempt.
- Start/resume attempt endpoint with concurrency protection.
- Safe active-attempt response.
- Save/clear answer and flag endpoint.
- Server-authoritative expiry logic.
- Optional scheduled expiry worker after request-time expiry is correct.

### Frontend

- Subject/exam search and filters.
- Exam details, rules, eligibility, and start confirmation.
- Active exam route with question view and radio options.
- Question palette, previous/next, clear, and flag controls.
- Save status and retry handling.
- Server-synchronized timer and refresh recovery.
- Responsive mobile palette drawer and sticky actions.
- Leave-attempt warning.

### Tests

- Start denied for unavailable/unpublished exam.
- Attempt limit and single-active-attempt rules.
- Save rejects foreign question/option and wrong owner.
- Expired attempt rejects changes.
- Client-clock changes cannot extend the attempt.
- Refresh restores answers and remaining server time.
- Two-tab behaviour preserves server truth.

### Exit criteria

- Candidate can start, answer, refresh, resume, and reach the submission confirmation without losing saved work.

## 8. Phase 5 — Submission, grading, and results

### Backend

- Pure deterministic grading service.
- Atomic/idempotent submit service.
- Lazy and scheduled auto-submission for expired attempts.
- Result summary endpoint.
- Policy-filtered answer review endpoint.
- Candidate attempt-history endpoint.

### Frontend

- Submission summary confirmation.
- Processing, success, retry, and expired screens.
- Result score summary and pass/fail treatment.
- Conditional detailed answer review.
- Attempt history filters and pagination.

### Tests

- All correct, all incorrect, unanswered, mixed, and negative-mark cases.
- Exact pass threshold and rounding.
- Duplicate submission returns the same result.
- Current exam edits cannot change old attempt score.
- Result ownership checks.
- Review policy hides/shows answers correctly.
- Full E2E journey from registration through result.

### Exit criteria

- A candidate receives a reproducible result, and repeated submission or later exam edits cannot alter it.

## 9. Phase 6 — Admin reporting, accessibility, and hardening

### Features

- Admin dashboard metrics.
- Paginated exam-attempt report and attempt details.
- Search/filter by candidate, status, pass/fail, and date.
- Archive flows and historical-data protections.
- Structured audit records for critical admin actions.

### Hardening

- Security headers, CORS allowlist, request size limits, and rate limits.
- Centralized error handling and request IDs.
- Structured logging and error monitoring.
- Database indexes verified with representative queries.
- Loading, empty, offline, forbidden, and error states on every page.
- Keyboard-only and screen-reader spot checks.
- Responsive QA at 360, 768, 1024, and 1440 px.

### Tests

- Cross-user and cross-role access attempts.
- Payload tests for answer leakage.
- Concurrency tests for starting and submitting attempts.
- Basic performance/load test on answer save and submit.
- Playwright tests for admin publish and candidate completion journeys.

### Exit criteria

- Security-critical tests pass, primary flows meet accessibility expectations, and admin can inspect results reliably.

## 10. Phase 7 — Deployment and MVP release

### Infrastructure

- Create production MongoDB database with restricted credentials.
- Deploy API and client to chosen platforms.
- Configure HTTPS, origins, cookies, secrets, and environment validation.
- Run database indexes and seed the first admin securely.
- Configure daily backups, error monitoring, uptime check, and log retention.
- Add staging environment and production smoke-test checklist.

### Release tasks

- Test real mobile and desktop browsers.
- Verify authentication cookies across deployed domains.
- Execute a complete exam using a disposable candidate account.
- Verify correct answers are absent from active-attempt network responses.
- Verify expiry and idempotent submission in production-like conditions.
- Add privacy policy, terms, support contact, and data-retention decision.
- Prepare rollback steps and known-limitations list.

### Exit criteria

- The production MVP is reachable, monitored, backed up, and passes the smoke test.

## 11. Testing matrix

| Layer | Focus | Examples |
|---|---|---|
| Unit | Pure business rules | grading, eligibility, publication validation, serializers |
| Integration/API | Routes + database | auth, ownership, state transitions, concurrency |
| Component | UI interaction | question form, palette, timer display, submit dialog |
| E2E | User journeys | admin publishes; candidate completes; review policy |
| Security | Data isolation | answer leakage, IDOR, role bypass, injection validation |
| Accessibility | Operability | keyboard, focus, names, errors, contrast |

## 12. Suggested issue order

Use one issue or small pull request for each numbered unit:

1. Monorepo and CI setup.
2. API foundation and database connection.
3. UI tokens and reusable components.
4. User model and admin seed.
5. Authentication APIs.
6. Authentication UI and protected layouts.
7. Subject management.
8. Draft exam model and admin form.
9. Question model and validation.
10. Question editor and reordering.
11. Publish validation and preview.
12. Candidate catalogue and exam details.
13. Attempt start/resume and snapshots.
14. Active exam UI and answer saving.
15. Server timer/expiry behaviour.
16. Grading and idempotent submit.
17. Result review and attempt history.
18. Admin metrics and results table.
19. Security/accessibility/responsive hardening.
20. Staging, production deployment, and smoke tests.

## 13. MVP launch checklist

- [ ] No AI dependency, key, prompt, or model call exists.
- [ ] Admin self-registration is impossible.
- [ ] Candidate active-attempt payload contains no correct answers.
- [ ] Server owns expiry and grading.
- [ ] Attempt snapshots preserve historical results.
- [ ] Submit is idempotent.
- [ ] Role and ownership tests pass.
- [ ] Admin publish and candidate exam E2E tests pass.
- [ ] Responsive and keyboard checks pass.
- [ ] HTTPS, secrets, CORS, cookies, backups, logs, and monitoring are configured.
- [ ] Privacy, retention, support, and rollback decisions are documented.

## 14. Post-MVP backlog priority

1. Email verification and password reset.
2. Question-bank reuse, tags, and difficulty.
3. CSV question import with validation preview.
4. Multiple-select and true/false question types.
5. Result export and certificates.
6. Scheduled groups/batches and invitation links.
7. Multi-admin permissions and audit-log UI.
8. Institution/workspace separation.

Any backlog item should receive its own PRD amendment, requirements, threat review, and tests before implementation.

