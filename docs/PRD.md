# ExamCenter — Product Requirements Document

**Version:** 1.0  
**Status:** MVP planning  
**Product type:** Web-based examination and testing platform  
**AI usage:** None

## 1. Product overview

ExamCenter is a web application where registered users can discover and take tests from different subjects. Administrators create subjects, build exams, enter questions and options, mark the correct answer, configure test rules, publish exams, and review results.

All questions and answers are created by administrators. Scoring is rule-based: the server compares submitted option IDs with stored correct option IDs. The product does not generate questions, evaluate answers, recommend content, or perform any other work with AI.

## 2. Problem statement

Teachers, trainers, coaching centres, clubs, and small organizations need a simple way to publish objective tests without relying on paper, spreadsheets, or expensive learning-management systems. Candidates need one place to find tests, answer questions within the allowed time, and view trustworthy results.

## 3. Product vision

Provide a secure, simple, and reusable examination platform that supports tests for any subject and gives administrators full control over test content and publishing.

## 4. Target users

### Candidate

- Registers and signs in.
- Browses exams by subject.
- Reads instructions and starts an available exam.
- Answers questions, navigates between them, and submits.
- Views scores, answer review when permitted, and attempt history.

### Administrator

- Manages subjects.
- Creates draft exams and defines rules.
- Manually creates questions, options, and correct answers.
- Previews, publishes, unpublishes, and archives exams.
- Reviews candidate attempts and summary statistics.

## 5. Goals

- Let an administrator create and publish a complete MCQ exam without developer help.
- Let a candidate take a timed exam on desktop or mobile.
- Calculate results consistently without manual grading.
- Prevent correct-answer data from reaching the candidate before submission.
- Preserve an accurate record of every submitted attempt.
- Make the platform suitable for any academic or professional subject.

## 6. Non-goals for the MVP

- AI-generated questions, explanations, grading, or recommendations.
- Live proctoring, face detection, microphone monitoring, or screen recording.
- Essay/code-answer evaluation.
- Payments, subscriptions, certificates, leaderboards, or gamification.
- Video classes, chat, social feeds, or a full learning-management system.
- Native Android or iOS applications.
- Importing questions from PDFs, images, or spreadsheets.
- Multiple organizations or institution-level tenancy.

## 7. MVP features

### 7.1 Authentication and authorization

- Candidate registration, login, logout, and profile.
- Administrator login.
- Role-based route and API protection.
- Secure password hashing and authenticated sessions.

### 7.2 Subject catalogue

- Admin creates, edits, activates, and deactivates subjects.
- Candidate browses active subjects and their published exams.

### 7.3 Exam management

- Admin creates an exam as a draft.
- Fields include title, description, subject, duration, passing percentage, total attempts allowed, availability dates, question order, result visibility, and answer-review policy.
- Admin previews an exam before publication.
- Only valid exams with at least one question can be published.
- Published exams may be unpublished or archived according to business rules.

### 7.4 Question management

- MVP question type: single-answer multiple choice.
- Each question has text, marks, optional negative marks, two to six options, and exactly one correct option.
- Admin can add, edit, delete, duplicate, and reorder draft questions.
- Correct answers are visible only to administrators and server-side grading logic.

### 7.5 Exam-taking experience

- Candidate sees instructions before starting.
- Server creates an attempt and fixes its expiry time.
- Candidate answers, clears, flags, and navigates between questions.
- Answers can be saved during the attempt.
- Timer remains consistent after refresh.
- Attempt is automatically submitted when time expires.
- Candidate cannot exceed the configured attempt limit.

### 7.6 Results and review

- Server grades the attempt after submission.
- Result includes marks earned, maximum marks, percentage, pass/fail status, answered, unanswered, and correct/incorrect counts.
- Candidate sees results and correct-answer review only if the exam policy allows it.
- Candidate can view previous attempts.
- Admin can view attempts for exams they manage.

## 8. Core user stories

| ID | User story | Priority |
|---|---|---|
| US-01 | As a candidate, I want to create an account and sign in securely. | Must |
| US-02 | As a candidate, I want to browse published exams by subject. | Must |
| US-03 | As a candidate, I want to read rules before starting an exam. | Must |
| US-04 | As a candidate, I want my answers and remaining time preserved after refresh. | Must |
| US-05 | As a candidate, I want to submit and receive an accurate result. | Must |
| US-06 | As a candidate, I want to see my previous attempts. | Must |
| US-07 | As an admin, I want to manage subjects. | Must |
| US-08 | As an admin, I want to create a draft exam with configurable rules. | Must |
| US-09 | As an admin, I want to add questions, options, and the correct answer manually. | Must |
| US-10 | As an admin, I want to preview and publish a valid exam. | Must |
| US-11 | As an admin, I want to review candidate results. | Must |
| US-12 | As an admin, I want to archive exams without deleting historical attempts. | Should |

## 9. Primary workflows

### Admin publishes an exam

1. Sign in as admin.
2. Create or select a subject.
3. Create an exam in draft status.
4. Configure its instructions and rules.
5. Add and validate MCQ questions.
6. Preview the candidate experience.
7. Publish the exam.

### Candidate completes an exam

1. Register or sign in.
2. Browse subjects and select a published exam.
3. Read instructions and eligibility information.
4. Start the exam.
5. Answer and navigate through questions.
6. Submit voluntarily or allow automatic submission at expiry.
7. View the permitted result information.

## 10. Business rules

- Only admins can create or modify subjects, exams, and questions.
- Candidates can start only published, active, currently available exams.
- A candidate can have only one in-progress attempt for the same exam.
- Attempt count is enforced on the server.
- Exam time is based on server timestamps, not the browser clock.
- A submitted or expired attempt is immutable.
- The server never sends `isCorrect` or the correct option ID in an active attempt response.
- Grading uses the exam/question snapshot attached to the attempt so later edits cannot alter historical scores.
- Deleting content referenced by attempts should be prevented; archive or soft-delete it instead.
- Pass status is `percentage >= passingPercentage`.
- An unanswered question receives zero marks and no negative marking.

## 11. MVP acceptance criteria

- An admin can create a subject and a ten-question test, preview it, and publish it.
- A candidate can find the test, start it, answer questions, refresh safely, and submit it.
- The backend calculates the expected marks for correct, incorrect, and unanswered questions.
- The timer cannot be extended by editing the client clock or refreshing.
- A candidate API response contains no correct-answer metadata during an active attempt.
- Attempt limits and availability windows are enforced by the API.
- Both candidate and admin workflows work on modern desktop and mobile browsers.

## 12. Success metrics

- At least 95% of started attempts submit successfully or are auto-submitted.
- Zero known incidents of correct-answer leakage through candidate APIs.
- Zero score changes when an exam is edited after an attempt.
- An admin can create and publish a basic exam in under 10 minutes.
- The main catalogue and question navigation remain usable at 360 px screen width.

## 13. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Correct answers leak to the browser | Separate admin and candidate serializers; add API tests that reject answer metadata. |
| Refresh loses answers or resets time | Save answers through the API and calculate expiry from server timestamps. |
| Exam edits change old scores | Store immutable snapshots for attempts and restrict published-exam editing. |
| Duplicate submissions | Make submission idempotent and lock terminal attempts. |
| Admin publishes incomplete questions | Validate options, correct answer, marks, and question count before publication. |
| Candidate opens multiple tabs | Treat the server attempt as the source of truth; make answer saves upserts. |

## 14. Future releases

- Multiple-select, true/false, numeric, and manually graded questions.
- Question-bank reuse, tags, difficulty, random question pools, and CSV import.
- Explanations, downloadable resources, certificates, leaderboards, and scheduled batches.
- Email verification, password reset, notifications, analytics exports, and audit logs.
- Institution workspaces and granular roles such as teacher, reviewer, and super-admin.
- Optional proctoring integrations. These remain separate from AI and are not part of the MVP.

