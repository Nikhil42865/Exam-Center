# ExamCenter — Software Requirements Specification

**Version:** 1.0  
**Scope:** MVP  
**Requirement keywords:** MUST, SHOULD, MAY

## 1. System roles

| Role | Permissions |
|---|---|
| Guest | View public landing page, register, and sign in. |
| Candidate | Browse eligible exams, take exams, and view permitted results/history. |
| Admin | Manage subjects, exams, questions, publishing, and result reports. |

## 2. Functional requirements

### FR-AUTH — Authentication and authorization

- **FR-AUTH-01:** A guest MUST be able to register with name, email, and password.
- **FR-AUTH-02:** Email addresses MUST be unique and normalized.
- **FR-AUTH-03:** A user MUST be able to sign in and sign out.
- **FR-AUTH-04:** Passwords MUST be hashed; plaintext passwords MUST never be stored or logged.
- **FR-AUTH-05:** Protected endpoints MUST verify authentication.
- **FR-AUTH-06:** Admin endpoints MUST verify the `admin` role on the server.
- **FR-AUTH-07:** Self-registration MUST create only a `candidate`; admin accounts MUST be seeded or created through a protected administrative process.
- **FR-AUTH-08:** An authenticated user MUST be able to view and update permitted profile fields.

### FR-SUB — Subject management

- **FR-SUB-01:** An admin MUST be able to create a subject with unique name, slug, and optional description.
- **FR-SUB-02:** An admin MUST be able to edit or deactivate a subject.
- **FR-SUB-03:** A candidate MUST see only active subjects containing at least one visible exam.
- **FR-SUB-04:** A subject referenced by exams MUST NOT be hard-deleted.

### FR-EXAM — Exam management

- **FR-EXAM-01:** An admin MUST be able to create an exam in `draft` status.
- **FR-EXAM-02:** An exam MUST contain a title, subject, instructions, duration in minutes, passing percentage, attempt limit, and answer-review settings.
- **FR-EXAM-03:** An exam MAY contain `availableFrom` and `availableUntil` dates.
- **FR-EXAM-04:** An admin MUST be able to save, preview, publish, unpublish, and archive an exam.
- **FR-EXAM-05:** Publication MUST fail when an exam has no valid questions or invalid configuration.
- **FR-EXAM-06:** Candidate listing MUST return only published, active, and currently available exams, while future exams MAY be shown as upcoming without allowing start.
- **FR-EXAM-07:** Published-exam changes affecting grading MUST create a new version or require unpublishing; completed attempt snapshots MUST remain unchanged.
- **FR-EXAM-08:** Candidate exam details MUST expose rules and metadata but no correct answers.
- **FR-EXAM-09:** Search and filtering SHOULD support subject, title, status, and availability.

### FR-QUESTION — Question management

- **FR-QUESTION-01:** An admin MUST be able to add a single-answer MCQ to a draft exam.
- **FR-QUESTION-02:** A question MUST have text, positive marks, two to six non-empty options, and exactly one correct option.
- **FR-QUESTION-03:** Negative marks MUST be zero or greater and SHOULD default to zero.
- **FR-QUESTION-04:** Option IDs MUST be stable and independent of their displayed labels.
- **FR-QUESTION-05:** An admin MUST be able to edit, duplicate, reorder, and remove questions before publication.
- **FR-QUESTION-06:** An admin preview MUST visibly identify the configured correct answer.
- **FR-QUESTION-07:** Candidate question payloads MUST omit correct-option and correctness fields.
- **FR-QUESTION-08:** The API MUST validate that the selected correct option belongs to that question.

### FR-ATTEMPT — Attempt lifecycle

- **FR-ATTEMPT-01:** A candidate MUST be authenticated to start an exam.
- **FR-ATTEMPT-02:** The server MUST verify publication, availability window, account status, and attempt limit before start.
- **FR-ATTEMPT-03:** Only one `in_progress` attempt per candidate per exam MUST exist.
- **FR-ATTEMPT-04:** Start MUST store `startedAt` and server-calculated `expiresAt`.
- **FR-ATTEMPT-05:** The attempt MUST store the exam version and a grading snapshot.
- **FR-ATTEMPT-06:** The candidate MUST be able to save or clear one answer while the attempt is active.
- **FR-ATTEMPT-07:** A saved option MUST belong to the specified question.
- **FR-ATTEMPT-08:** The candidate SHOULD be able to flag a question for review.
- **FR-ATTEMPT-09:** Reopening an active attempt MUST return saved answers and authoritative server timing.
- **FR-ATTEMPT-10:** Submitting MUST be idempotent; repeated submission requests MUST return the same terminal result.
- **FR-ATTEMPT-11:** An expired attempt MUST reject answer updates and MUST be auto-submitted by the next relevant request or a background job.
- **FR-ATTEMPT-12:** A submitted/expired attempt MUST be immutable.

### FR-GRADE — Grading

- **FR-GRADE-01:** Grading MUST occur only on the backend.
- **FR-GRADE-02:** Correct answer: award configured positive marks.
- **FR-GRADE-03:** Incorrect answer: subtract configured negative marks.
- **FR-GRADE-04:** Unanswered question: award zero and subtract zero.
- **FR-GRADE-05:** Final score SHOULD be bounded below by zero for the MVP.
- **FR-GRADE-06:** Percentage MUST use the total positive marks: `(score / maximumMarks) * 100`.
- **FR-GRADE-07:** Pass/fail MUST use the snapshotted passing percentage.
- **FR-GRADE-08:** Result MUST store score, maximum marks, percentage, pass status, and answer counts.
- **FR-GRADE-09:** Grading MUST use the attempt snapshot, not mutable current question records.

### FR-RESULT — Results and reporting

- **FR-RESULT-01:** A candidate MUST be able to view their own attempt summary.
- **FR-RESULT-02:** A candidate MUST NOT access another candidate's attempt.
- **FR-RESULT-03:** Correct answers and explanations MUST be hidden unless the exam review policy permits them.
- **FR-RESULT-04:** An admin MUST be able to list and inspect attempts for an exam.
- **FR-RESULT-05:** Admin result lists SHOULD support pagination, candidate search, status, pass/fail, and date filters.
- **FR-RESULT-06:** Dashboard summaries SHOULD include total exams, published exams, total attempts, completion count, average score, and pass rate.

### FR-AUDIT — Data lifecycle

- **FR-AUDIT-01:** Core records MUST store created and updated timestamps.
- **FR-AUDIT-02:** Subjects and exams with historical references MUST be archived or soft-deleted.
- **FR-AUDIT-03:** Admin publication and archive actions SHOULD be recorded in an audit log.

## 3. Exam state requirements

### Exam states

| State | Candidate visibility | Admin editing | Allowed transitions |
|---|---|---|---|
| `draft` | Hidden | Full | `published`, `archived` |
| `published` | Visible when eligible | Safe metadata only | `draft` via unpublish, `archived` |
| `archived` | Hidden from catalogue | Read-only | Optional restore to `draft` |

### Attempt states

| State | Meaning | Allowed transitions |
|---|---|---|
| `in_progress` | Candidate may save answers before expiry. | `submitted`, `expired` |
| `submitted` | Candidate submitted within time. | Terminal |
| `expired` | Time limit elapsed and system finalized the attempt. | Terminal |

## 4. Validation rules

| Field | Rule |
|---|---|
| User name | 2–80 characters |
| Email | Valid format; lowercase normalized; unique |
| Password | Minimum 8 characters; at least one letter and one number |
| Subject name | 2–80 characters; unique case-insensitively |
| Exam title | 3–150 characters |
| Duration | Integer from 1 to 300 minutes |
| Passing percentage | Number from 0 to 100 |
| Attempt limit | Integer from 1 to 20 |
| Question text | 1–2,000 characters |
| Options | 2–6 options; each 1–500 characters; no empty duplicate options |
| Positive marks | Number greater than 0 |
| Negative marks | Number from 0 through positive marks |
| Availability | `availableUntil` must be later than `availableFrom` |

## 5. Non-functional requirements

### NFR-PERF — Performance

- **NFR-PERF-01:** Typical read API responses SHOULD complete within 500 ms at the 95th percentile under the agreed MVP load, excluding network latency.
- **NFR-PERF-02:** Lists MUST use pagination and database indexes.
- **NFR-PERF-03:** Saving one answer SHOULD feel immediate and MUST not reload the exam page.
- **NFR-PERF-04:** The initial candidate application bundle SHOULD be optimized with route-level lazy loading.

### NFR-SEC — Security

- **NFR-SEC-01:** All production traffic MUST use HTTPS.
- **NFR-SEC-02:** Password hashing MUST use an established adaptive algorithm such as Argon2id or bcrypt.
- **NFR-SEC-03:** Authentication cookies, if used, MUST be `HttpOnly`, `Secure`, and appropriately `SameSite`.
- **NFR-SEC-04:** Inputs MUST be schema-validated and MongoDB operator injection prevented.
- **NFR-SEC-05:** Authentication and start/submit routes MUST be rate-limited.
- **NFR-SEC-06:** Correct answers MUST never be serialized by candidate endpoints before permitted review.
- **NFR-SEC-07:** Authorization MUST verify both role and record ownership.
- **NFR-SEC-08:** Secrets MUST be stored in environment variables, not source control.
- **NFR-SEC-09:** Logs MUST exclude passwords, tokens, correct answers, and unnecessary personal data.
- **NFR-SEC-10:** Security headers and a restrictive CORS policy MUST be enabled.

### NFR-REL — Reliability and consistency

- **NFR-REL-01:** Submit and answer-save operations MUST be safe against retries.
- **NFR-REL-02:** Grading and terminal-state update SHOULD occur atomically.
- **NFR-REL-03:** The database MUST enforce or support a unique active-attempt constraint.
- **NFR-REL-04:** Daily automated database backups SHOULD be configured for production.
- **NFR-REL-05:** Times MUST be stored in UTC and formatted in the user's locale.

### NFR-UX — Usability and accessibility

- **NFR-UX-01:** Candidate and admin flows MUST support current Chrome, Edge, Firefox, and Safari releases.
- **NFR-UX-02:** The UI MUST remain usable at widths from 360 px upward.
- **NFR-UX-03:** All interactive controls MUST be keyboard accessible.
- **NFR-UX-04:** Inputs MUST have labels; errors MUST be announced and associated with fields.
- **NFR-UX-05:** Colour MUST not be the only indicator of answered, flagged, correct, or incorrect states.
- **NFR-UX-06:** The timer MUST provide a non-colour warning and SHOULD use an accessible live update at sensible intervals.
- **NFR-UX-07:** Destructive actions and final exam submission MUST require confirmation.

### NFR-MAINT — Maintainability

- **NFR-MAINT-01:** Frontend and backend MUST use TypeScript.
- **NFR-MAINT-02:** Controllers SHOULD delegate business logic to services.
- **NFR-MAINT-03:** Validation, authorization, errors, and response formats SHOULD be centralized.
- **NFR-MAINT-04:** Unit, integration, and end-to-end tests MUST protect grading and exam lifecycle rules.
- **NFR-MAINT-05:** APIs SHOULD be versioned under `/api/v1`.

## 6. Data and privacy requirements

- Collect only name, email, password hash, role, account state, and exam activity needed for the product.
- Provide a policy for retention and account deletion before public launch.
- Candidate emails MUST be visible only to authorized admins.
- Attempt data MUST not be publicly enumerable.
- Database backups and production access MUST be restricted.

## 7. API acceptance examples

### Active-attempt candidate question

```json
{
  "id": "question-id",
  "text": "Which protocol is connection-oriented?",
  "marks": 1,
  "negativeMarks": 0,
  "options": [
    { "id": "option-a", "text": "TCP" },
    { "id": "option-b", "text": "UDP" }
  ]
}
```

The response MUST NOT contain `correctOptionId`, `isCorrect`, or any equivalent hint.

### Result summary

```json
{
  "attemptId": "attempt-id",
  "status": "submitted",
  "score": 8,
  "maximumMarks": 10,
  "percentage": 80,
  "passed": true,
  "counts": {
    "correct": 8,
    "incorrect": 1,
    "unanswered": 1
  }
}
```

## 8. Definition of done for the MVP

- All MUST requirements are implemented.
- Authorization and candidate data isolation are covered by automated tests.
- Grading boundary cases are covered by unit tests.
- The active-attempt payload is tested for answer leakage.
- The primary admin and candidate journeys pass end-to-end tests.
- Responsive and keyboard-only checks are complete.
- Production environment configuration, backup, logging, and error monitoring are documented.

