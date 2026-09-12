# ExamCenter — UI/UX Specification

**Version:** 1.0  
**Platforms:** Responsive web, 360 px and wider

## 1. Experience goals

- Make the next action obvious for both candidates and admins.
- Keep the exam screen focused and calm.
- Prevent accidental submission or loss of work.
- Show system status clearly: saved, saving, offline, expired, or submitted.
- Avoid revealing answers through visual or technical UI state.
- Work well with keyboard, screen reader, touch, and mouse.

## 2. Visual direction

- Clean academic appearance with generous white space.
- Primary colour: deep blue or indigo for trust and focus.
- Neutral background with high-contrast content cards.
- Green, amber, and red communicate state only when paired with text/icons.
- Use one readable sans-serif family such as Inter or system UI.
- Use an 8 px spacing system and consistent radii/shadows.
- Prefer plain CSS variables so the design system is easy to maintain.

Suggested tokens:

```css
:root {
  --color-primary: #3157d5;
  --color-primary-dark: #2442a7;
  --color-bg: #f6f7fb;
  --color-surface: #ffffff;
  --color-text: #172033;
  --color-muted: #667085;
  --color-border: #dfe3eb;
  --color-success: #18794e;
  --color-warning: #a15c00;
  --color-danger: #b42318;
  --radius-md: 10px;
  --shadow-card: 0 4px 16px rgb(20 30 55 / 8%);
}
```

## 3. Information architecture

### Public

- Home
- Login
- Register
- Not found

### Candidate application

- Dashboard
- Subjects
- Exam catalogue
- Exam details/instructions
- Active exam
- Result
- Attempt history
- Profile

### Admin application

- Admin dashboard
- Subjects
- Exams
- Exam editor
- Question editor
- Exam preview
- Results/reports

## 4. Navigation

### Candidate desktop navigation

- Left sidebar: Dashboard, Explore Exams, My Attempts, Profile.
- Top bar: page title, optional search, user menu, logout.
- The active-exam route removes normal navigation to reduce distraction.

### Admin desktop navigation

- Left sidebar: Dashboard, Subjects, Exams, Results.
- Top bar: contextual page title, admin badge, user menu.
- Primary action such as `Create exam` appears at the top right.

### Mobile navigation

- Header with logo, title, and menu button.
- Sidebar becomes a modal drawer with backdrop.
- Active exam uses a compact header with timer and question-progress button.

## 5. Page specifications

### 5.1 Public home

**Purpose:** Explain the product and direct users to available tests.

Sections:

- Logo and authentication actions.
- Hero: “Test your knowledge across every subject.”
- Benefits: many subjects, timed tests, immediate results.
- How it works: choose, attempt, review.
- Footer with basic policy links.

Primary CTA: `Explore exams` or `Create account`.

### 5.2 Login and registration

**Components:**

- Brand panel on desktop; compact logo on mobile.
- Labelled name/email/password fields.
- Show/hide password.
- Inline validation and form-level error alert.
- Primary submit button with loading state.
- Link between login and registration.

Do not reveal whether a particular email exists in sensitive error messages.

### 5.3 Candidate dashboard

**Header:** Personalized greeting and `Explore exams` action.

**Summary cards:**

- Available exams.
- Attempts completed.
- Average score.
- Exams passed.

**Content:**

- Continue in-progress attempt, if any.
- Recommended section is rule-based only: recent or newly published exams, not AI recommendations.
- Recent attempt table with exam, subject, date, score, and status.

Empty state: explain how to select the first exam and provide a direct CTA.

### 5.4 Subjects and exam catalogue

**Controls:** Search by title, subject filter, availability filter, and clear filters.

**Exam card:**

- Title and subject.
- Duration, question count, passing score, attempts remaining.
- Status badge: Available, Upcoming, Closed, Completed, or Attempts used.
- `View details` action.

Cards must not show a start action when the user is ineligible.

### 5.5 Exam details and instructions

Show:

- Title, subject, description.
- Duration, number of questions, total marks, passing percentage.
- Negative-marking statement.
- Attempt usage and availability window.
- Numbered instructions.
- Acknowledgement checkbox: “I understand the rules.”
- `Start exam` or `Resume exam` primary button.

Before creating the attempt, show a confirmation that time starts immediately and continues after closing the tab.

### 5.6 Active exam

Desktop layout:

```text
Header: exam title | saved status | countdown
Main: question number, marks, question text, options
Side panel: question palette and legend
Footer: previous | clear | flag | save & next | submit
```

Behaviour:

- One question per view.
- Radio inputs for single-choice options; the entire option card is clickable.
- Question palette states: current, unanswered, answered, flagged, answered+flagged.
- Provide text/icon/shape in addition to colour.
- Answer saves on selection or `Save & next`; show `Saving…`, `Saved`, or `Save failed—retry`.
- `Previous` and `Next` preserve selection.
- Timer becomes prominent at 5 minutes and critical at 1 minute without flashing continuously.
- Refresh resumes from server state.
- Network interruption displays a persistent banner; do not falsely show an answer as saved.
- `Submit exam` opens a summary modal showing answered, unanswered, and flagged counts.
- Auto-submit screen explains that time expired and grading is in progress.

On mobile, open the question palette as a bottom sheet/drawer. Keep the bottom action bar sticky without covering content.

### 5.7 Result page

Always show when policy permits scores:

- Score and maximum marks.
- Percentage and Pass/Not passed label.
- Correct, incorrect, and unanswered counts.
- Submission timestamp and attempt number.
- Actions: `Back to exams` and `View attempt history`.

If answer review is enabled, show each question with the candidate answer, correct answer, awarded marks, and optional admin explanation. If disabled, clearly state that detailed review is not available.

### 5.8 Attempt history

- Paginated table/cards.
- Filters by subject, pass status, and date.
- Fields: exam, attempt number, submitted date, status, score, percentage.
- Selecting a row opens the permitted result.

### 5.9 Admin dashboard

**Summary cards:** total exams, published exams, total attempts, average score, pass rate.

**Sections:**

- Recent attempts.
- Exams requiring action: drafts and currently active exams.
- Quick actions: create subject, create exam.

### 5.10 Admin subjects

- Searchable table with name, number of exams, state, updated date, actions.
- Create/edit drawer or modal.
- Deactivation confirmation explains candidate impact.
- Block hard deletion when referenced.

### 5.11 Admin exam list

- Tabs or filters: All, Draft, Published, Archived.
- Table: title, subject, questions, duration, attempts, status, updated date, actions.
- Row actions: edit, preview, publish/unpublish, archive.
- Empty state with `Create your first exam`.

### 5.12 Exam editor

Use a step-based layout:

1. Basic details.
2. Rules and availability.
3. Questions.
4. Preview and publish.

Keep an always-visible status line: `Draft · All changes saved`.

The questions step includes:

- Question list with order, excerpt, marks, and validity indicator.
- Add, edit, duplicate, reorder, and delete actions.
- Running totals for questions and maximum marks.
- Validation summary linking directly to invalid questions.

### 5.13 Question editor

Fields:

- Question text.
- Positive marks and negative marks.
- Two initial option rows and `Add option`, up to six.
- Radio button identifying exactly one correct answer.
- Optional explanation.
- Save, save-and-add-another, and cancel actions.

The correct-answer control must be explicit; never infer the correct answer from option position.

### 5.14 Admin results

- Exam selector and summary metrics.
- Paginated candidate-attempt table.
- Filters: candidate, terminal status, pass/fail, date.
- Attempt details include submitted answers and grading breakdown.
- Export is deferred unless added to the release scope.

## 6. Component inventory

### Shared foundation

- Button, IconButton, LinkButton.
- TextInput, PasswordInput, Textarea, RadioGroup, Checkbox, Select.
- Card, Badge, Alert, Toast, Skeleton, Spinner.
- Modal, Drawer, DropdownMenu, ConfirmDialog.
- DataTable, Pagination, EmptyState, ErrorState.
- AppHeader, Sidebar, Breadcrumbs, PageHeader.

### Domain components

- SubjectCard, ExamCard, EligibilityBadge.
- ExamRules, StartExamDialog.
- QuestionView, OptionCard, QuestionPalette, ExamTimer, SaveStatus.
- SubmissionSummaryDialog, ScoreSummary, AnswerReview.
- ExamForm, QuestionForm, QuestionList, PublishChecklist.

## 7. Key states for every data page

| State | UI treatment |
|---|---|
| Loading | Skeletons that match final layout; no layout jump. |
| Empty | Explain why it is empty and show one useful action. |
| Error | Plain-language message, retry action, and support/request ID when useful. |
| Saving | Disable conflicting actions and show progress. |
| Success | Toast for background actions; inline confirmation for major workflows. |
| Unauthorized | Explain access restriction and provide safe navigation. |
| Offline | Persistent banner; distinguish local selection from server-saved answer. |

## 8. Submission safeguards

- The submit button is visually distinct from question navigation.
- Confirmation shows unanswered and flagged counts.
- While submission is processing, disable duplicate action and show progress.
- If the request is retried, the same result is displayed.
- Navigation away from an in-progress attempt shows a warning, while clarifying that the timer continues.
- Browser back does not silently end or submit the attempt.

## 9. Responsive behaviour

| Width | Behaviour |
|---|---|
| 1200 px+ | Fixed sidebar; broad tables; active exam uses main + palette columns. |
| 768–1199 px | Collapsible sidebar; tighter cards; tables may scroll horizontally. |
| 360–767 px | Drawer navigation; one-column cards; tables become cards where useful; palette is a sheet. |

Touch targets should be at least 44 × 44 px. Do not depend on hover-only actions.

## 10. Accessibility checklist

- Logical heading hierarchy and landmarks.
- Visible keyboard focus and skip-to-content link.
- Native radio/checkbox inputs or fully equivalent accessible behaviour.
- Form labels, descriptions, and inline errors connected through ARIA attributes.
- Dialog focus trap, initial focus, Escape handling, and focus restoration.
- Minimum WCAG AA colour contrast.
- Status meaning uses text/icon in addition to colour.
- Question palette exposes a readable accessible name such as “Question 4, answered and flagged.”
- Respect reduced-motion preferences.
- Avoid announcing the countdown every second; announce milestone warnings.

## 11. UX acceptance checklist

- A first-time admin can publish a valid exam without documentation.
- A candidate can distinguish answered, unanswered, and flagged questions.
- Refreshing an exam restores server-saved selections and correct time.
- No candidate screen or network payload contains correct-answer data before allowed review.
- Every async action communicates loading, success, and failure.
- Final submission cannot occur from a single accidental click.
- Primary workflows are complete with keyboard only and at 360 px width.

