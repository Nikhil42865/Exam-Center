import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../services/api.js";
import {
  ExamDto,
  SubjectDto,
  AdminQuestionDto,
  CreateExamDto,
  CreateQuestionDto,
} from "@examcenter/contracts";
import { Modal } from "../../components/ui/Modal.js";
import { Alert } from "../../components/ui/Alert.js";
import { BulkQuestionImportModal } from "../../components/admin/BulkQuestionImportModal.js";
import {
  ArrowLeft,
  Save,
  PlusCircle,
  Edit,
  Trash2,
  Copy,
  CheckCircle2,
  AlertCircle,
  Eye,
  Send,
  Layers,
  Settings,
  HelpCircle,
  Check,
  Upload,
} from "lucide-react";

export const AdminExamEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"details" | "rules" | "questions" | "publish">("details");
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Exam Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState(
    "1. Read each question carefully before choosing an answer.\n2. You can navigate between questions and flag questions for review.\n3. Your remaining time is calculated on the server and continues if you close your browser.\n4. Click 'Submit Exam' once you have completed all questions."
  );
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [passingPercentage, setPassingPercentage] = useState(60);
  const [attemptLimit, setAttemptLimit] = useState(1);
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableUntil, setAvailableUntil] = useState("");
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const [showScoreAfterSubmit, setShowScoreAfterSubmit] = useState(true);
  const [showAnswersAfterSubmit, setShowAnswersAfterSubmit] = useState(true);

  const [examSaveError, setExamSaveError] = useState<string | null>(null);
  const [examSaveSuccess, setExamSaveSuccess] = useState<string | null>(null);
  const [isSavingExam, setIsSavingExam] = useState(false);
  const [savedExamId, setSavedExamId] = useState<string | null>(isNew ? null : id);

  // Question Modal State
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<AdminQuestionDto | null>(null);
  const [qText, setQText] = useState("");
  const [qMarks, setQMarks] = useState(1);
  const [qNegativeMarks, setQNegativeMarks] = useState(0);
  const [qExplanation, setQExplanation] = useState("");
  const [qOptions, setQOptions] = useState<{ id: string; text: string }[]>([
    { id: "opt_1", text: "" },
    { id: "opt_2", text: "" },
  ]);
  const [qCorrectOptionId, setQCorrectOptionId] = useState("opt_1");
  const [questionError, setQuestionError] = useState<string | null>(null);

  // Fetch subjects for dropdown
  const {
    data: subjects,
    isLoading: isSubjectsLoading,
    error: subjectsError,
  } = useQuery({
    queryKey: ["admin-subjects"],
    queryFn: () => api.subjects.getAdminSubjects(),
  });

  // Fetch existing exam if editing
  const { data: existingExam } = useQuery({
    queryKey: ["admin-exam", savedExamId],
    queryFn: () => api.exams.getAdminExamById(savedExamId!),
    enabled: !!savedExamId,
  });

  // Fetch questions for this exam
  const { data: questions, refetch: refetchQuestions } = useQuery({
    queryKey: ["admin-questions", savedExamId],
    queryFn: () => api.questions.getExamQuestions(savedExamId!),
    enabled: !!savedExamId,
  });

  // Populate state from existing exam
  useEffect(() => {
    if (existingExam) {
      setTitle(existingExam.title);
      setSlug(existingExam.slug);
      setSubjectId(existingExam.subjectId);
      setDescription(existingExam.description || "");
      setInstructions(existingExam.instructions);
      setDurationMinutes(existingExam.durationMinutes);
      setPassingPercentage(existingExam.passingPercentage);
      setAttemptLimit(existingExam.attemptLimit);
      setAvailableFrom(existingExam.availableFrom ? existingExam.availableFrom.slice(0, 16) : "");
      setAvailableUntil(existingExam.availableUntil ? existingExam.availableUntil.slice(0, 16) : "");
      setShuffleQuestions(existingExam.shuffleQuestions);
      setShuffleOptions(existingExam.shuffleOptions);
      setShowScoreAfterSubmit(existingExam.showScoreAfterSubmit);
      setShowAnswersAfterSubmit(existingExam.showAnswersAfterSubmit);
    }
  }, [existingExam]);

  // Set default subject if creating new
  useEffect(() => {
    if (subjects && subjects.length > 0 && !subjectId) {
      setSubjectId(subjects[0].id);
    }
  }, [subjects, subjectId]);

  // Save Exam (Basic details & rules)
  const handleSaveExam = async (e?: React.FormEvent): Promise<boolean> => {
    if (e) e.preventDefault();
    setExamSaveError(null);
    setExamSaveSuccess(null);
    setIsSavingExam(true);

    try {
      if (!title.trim()) {
        throw new Error("Exam title is required.");
      }
      if (!subjectId) {
        throw new Error("Please select a subject.");
      }

      const payload: CreateExamDto = {
        subjectId,
        title: title.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        instructions,
        durationMinutes,
        passingPercentage,
        attemptLimit,
        availableFrom: availableFrom ? new Date(availableFrom).toISOString() : null,
        availableUntil: availableUntil ? new Date(availableUntil).toISOString() : null,
        shuffleQuestions,
        shuffleOptions,
        showScoreAfterSubmit,
        showAnswersAfterSubmit,
      };

      if (savedExamId) {
        const updated = await api.exams.updateExam(savedExamId, payload);
        if (updated.slug) setSlug(updated.slug);
      } else {
        const created = await api.exams.createExam(payload);
        setSavedExamId(created.id);
        if (created.slug) setSlug(created.slug);
        navigate(`/admin/exams/${created.id}/edit`, { replace: true });
      }
      queryClient.invalidateQueries({ queryKey: ["admin-exams"] });
      setExamSaveSuccess("Exam configuration saved successfully.");
      setTimeout(() => setExamSaveSuccess(null), 4000);
      return true;
    } catch (err: any) {
      setExamSaveError(err.message || "Failed to save exam details");
      return false;
    } finally {
      setIsSavingExam(false);
    }
  };

  const handleTabClick = async (tab: "details" | "rules" | "questions" | "publish") => {
    if (tab === activeTab) return;
    if ((tab === "questions" || tab === "publish") && !savedExamId) {
      if (!title.trim() || !subjectId) {
        setExamSaveError("Please provide an Exam Title and Subject first before proceeding to questions or publish.");
        setActiveTab("details");
        return;
      }
      const ok = await handleSaveExam();
      if (!ok) return;
    }
    setActiveTab(tab);
  };

  // Open Question Modal
  const handleOpenAddQuestion = async () => {
    let currentId = savedExamId;
    if (!currentId) {
      if (!title.trim() || !subjectId) {
        setExamSaveError("Please complete basic exam details (Title and Subject) first before adding questions.");
        setActiveTab("details");
        return;
      }
      const ok = await handleSaveExam();
      if (!ok) return;
    }
    setEditingQuestion(null);
    setQText("");
    setQMarks(1);
    setQNegativeMarks(0);
    setQExplanation("");
    setQOptions([
      { id: "opt_1", text: "" },
      { id: "opt_2", text: "" },
    ]);
    setQCorrectOptionId("opt_1");
    setQuestionError(null);
    setIsQuestionModalOpen(true);
  };

  const handleOpenBulkImport = async () => {
    let currentId = savedExamId;
    if (!currentId) {
      if (!title.trim() || !subjectId) {
        setExamSaveError("Please complete basic exam details (Title and Subject) first before importing questions.");
        setActiveTab("details");
        return;
      }
      const ok = await handleSaveExam();
      if (!ok) return;
    }
    setIsBulkModalOpen(true);
  };

  const handleOpenEditQuestion = (q: AdminQuestionDto) => {
    setEditingQuestion(q);
    setQText(q.text);
    setQMarks(q.marks);
    setQNegativeMarks(q.negativeMarks);
    setQExplanation(q.explanation || "");
    setQOptions(q.options.map((o) => ({ id: o.id, text: o.text })));
    setQCorrectOptionId(q.correctOptionId);
    setQuestionError(null);
    setIsQuestionModalOpen(true);
  };

  // Add / Remove Option in Question Modal
  const handleAddOption = () => {
    if (qOptions.length >= 6) return;
    const newId = `opt_${Date.now()}_${qOptions.length + 1}`;
    setQOptions([...qOptions, { id: newId, text: "" }]);
  };

  const handleRemoveOption = (index: number) => {
    if (qOptions.length <= 2) return;
    const removedId = qOptions[index].id;
    const filtered = qOptions.filter((_, i) => i !== index);
    setQOptions(filtered);
    if (qCorrectOptionId === removedId) {
      setQCorrectOptionId(filtered[0].id);
    }
  };

  // Save Question
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuestionError(null);

    // Validate options
    if (qOptions.some((o) => !o.text.trim())) {
      setQuestionError("All options must contain text.");
      return;
    }

    if (qNegativeMarks > qMarks) {
      setQuestionError("Negative marks cannot exceed positive marks.");
      return;
    }

    try {
      const payload: CreateQuestionDto = {
        text: qText.trim(),
        type: "single_choice",
        options: qOptions.map((o) => ({ id: o.id, text: o.text.trim() })),
        correctOptionId: qCorrectOptionId,
        explanation: qExplanation.trim() || undefined,
        marks: qMarks,
        negativeMarks: qNegativeMarks,
      };

      if (editingQuestion) {
        await api.questions.updateQuestion(editingQuestion.id, payload);
      } else {
        await api.questions.createQuestion(savedExamId!, payload);
      }

      await refetchQuestions();
      queryClient.invalidateQueries({ queryKey: ["admin-exam", savedExamId] });
      setIsQuestionModalOpen(false);
    } catch (err: any) {
      setQuestionError(err.message || "Failed to save question");
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await api.questions.deleteQuestion(qId);
        await refetchQuestions();
        queryClient.invalidateQueries({ queryKey: ["admin-exam", savedExamId] });
      } catch (err: any) {
        alert(err.message || "Failed to delete question");
      }
    }
  };

  const handleDuplicateQuestion = async (qId: string) => {
    try {
      await api.questions.duplicateQuestion(qId);
      await refetchQuestions();
      queryClient.invalidateQueries({ queryKey: ["admin-exam", savedExamId] });
    } catch (err: any) {
      alert(err.message || "Failed to duplicate question");
    }
  };

  const handlePublishExam = async () => {
    if (!savedExamId) return;
    try {
      await api.exams.publishExam(savedExamId);
      queryClient.invalidateQueries({ queryKey: ["admin-exams"] });
      queryClient.invalidateQueries({ queryKey: ["admin-exam", savedExamId] });
      alert("🎉 Exam successfully published! It is now live in the candidate catalogue.");
      navigate("/admin/exams");
    } catch (err: any) {
      alert(err.message || "Failed to publish exam");
    }
  };

  const totalExamMarks = questions?.reduce((sum, q) => sum + q.marks, 0) || 0;
  const isPublishReady = (questions?.length || 0) >= 1 && title.trim().length >= 3;

  return (
    <div className="page-container" style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {/* Top Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <Link to="/admin/exams" className="btn btn-ghost btn-sm">
          <ArrowLeft size={16} /> Back to Exams
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span className={`badge ${existingExam?.status === "published" ? "badge-success" : "badge-warning"}`}>
            {existingExam?.status || "Draft"}
          </span>
          <button onClick={() => handleSaveExam()} className="btn btn-primary btn-sm" disabled={isSavingExam}>
            {isSavingExam ? <span className="spinner" /> : <><Save size={16} /> Save Changes</>}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.85rem", marginBottom: "0.25rem" }}>
          {isNew ? "Create Examination" : `Edit: ${title || "Exam"}`}
        </h1>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Configure test metadata, scoring parameters, and multiple-choice questions.
        </p>
      </div>

      {examSaveSuccess && <Alert type="success" message={examSaveSuccess} />}
      {examSaveError && <Alert type="danger" message={examSaveError} />}

      {/* Step Navigation Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--color-border)",
          marginBottom: "2rem",
          gap: "0.5rem",
        }}
      >
        <button
          onClick={() => handleTabClick("details")}
          style={{
            padding: "0.75rem 1.25rem",
            fontWeight: activeTab === "details" ? "700" : "500",
            color: activeTab === "details" ? "var(--color-primary)" : "var(--color-text-secondary)",
            borderBottom: activeTab === "details" ? "2px solid var(--color-primary)" : "none",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Layers size={16} /> 1. Basic Details
        </button>

        <button
          onClick={() => handleTabClick("rules")}
          style={{
            padding: "0.75rem 1.25rem",
            fontWeight: activeTab === "rules" ? "700" : "500",
            color: activeTab === "rules" ? "var(--color-primary)" : "var(--color-text-secondary)",
            borderBottom: activeTab === "rules" ? "2px solid var(--color-primary)" : "none",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Settings size={16} /> 2. Rules & Timing
        </button>

        <button
          onClick={() => handleTabClick("questions")}
          style={{
            padding: "0.75rem 1.25rem",
            fontWeight: activeTab === "questions" ? "700" : "500",
            color: activeTab === "questions" ? "var(--color-primary)" : "var(--color-text-secondary)",
            borderBottom: activeTab === "questions" ? "2px solid var(--color-primary)" : "none",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <HelpCircle size={16} /> 3. Questions ({questions?.length || 0})
        </button>

        <button
          onClick={() => handleTabClick("publish")}
          style={{
            padding: "0.75rem 1.25rem",
            fontWeight: activeTab === "publish" ? "700" : "500",
            color: activeTab === "publish" ? "var(--color-primary)" : "var(--color-text-secondary)",
            borderBottom: activeTab === "publish" ? "2px solid var(--color-primary)" : "none",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Send size={16} /> 4. Preview & Publish
        </button>
      </div>

      {/* Tab 1: Details */}
      {activeTab === "details" && (
        <div className="card">
          <div className="card-body">
            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                <label className="form-label" htmlFor="ex-subject" style={{ marginBottom: 0 }}>
                  Subject *
                </label>
                <Link
                  to="/admin/subjects"
                  style={{ fontSize: "0.825rem", color: "var(--color-primary)", textDecoration: "none", fontWeight: "600" }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  + Manage / Add Subject
                </Link>
              </div>
              <select
                id="ex-subject"
                className="form-select"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                required
                disabled={isSubjectsLoading}
              >
                {isSubjectsLoading ? (
                  <option value="">Loading subjects...</option>
                ) : !subjects || subjects.length === 0 ? (
                  <option value="" disabled>No subjects available</option>
                ) : (
                  <>
                    <option value="" disabled>Select a subject...</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} {!s.isActive ? "(Inactive)" : ""}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {subjectsError && (
                <p style={{ fontSize: "0.825rem", color: "var(--color-danger)", marginTop: "0.35rem" }}>
                  {(subjectsError as any)?.message || "Failed to load subjects. Please check permissions."}
                </p>
              )}
              {subjects && subjects.length === 0 && !isSubjectsLoading && (
                <p style={{ fontSize: "0.825rem", color: "var(--color-muted)", marginTop: "0.35rem" }}>
                  No subjects found. Please <Link to="/admin/subjects" style={{ color: "var(--color-primary)" }}>create a subject</Link> first.
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ex-title">
                Exam Title *
              </label>
              <input
                id="ex-title"
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cisco CCNA Certification Practice Quiz"
                required
                minLength={3}
                maxLength={150}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ex-slug">
                URL Slug (Optional)
              </label>
              <input
                id="ex-slug"
                type="text"
                className="form-input"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated-from-title"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ex-desc">
                Short Description
              </label>
              <textarea
                id="ex-desc"
                className="form-textarea"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary shown on catalog cards..."
                maxLength={2000}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ex-instructions">
                Candidate Instructions *
              </label>
              <textarea
                id="ex-instructions"
                className="form-textarea"
                rows={5}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
              <button
                type="button"
                disabled={isSavingExam}
                onClick={async () => {
                  if (title.trim() && subjectId) {
                    await handleSaveExam();
                  }
                  setActiveTab("rules");
                }}
                className="btn btn-primary"
              >
                {isSavingExam ? "Saving..." : "Proceed to Rules →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Rules */}
      {activeTab === "rules" && (
        <div className="card">
          <div className="card-body">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="ex-dur">
                  Duration (Minutes) *
                </label>
                <input
                  id="ex-dur"
                  type="number"
                  className="form-input"
                  min={1}
                  max={300}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 1)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ex-pass">
                  Passing Percentage (%) *
                </label>
                <input
                  id="ex-pass"
                  type="number"
                  className="form-input"
                  min={0}
                  max={100}
                  value={passingPercentage}
                  onChange={(e) => setPassingPercentage(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ex-attempts">
                  Maximum Attempts Allowed *
                </label>
                <input
                  id="ex-attempts"
                  type="number"
                  className="form-input"
                  min={1}
                  max={20}
                  value={attemptLimit}
                  onChange={(e) => setAttemptLimit(parseInt(e.target.value, 10) || 1)}
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1rem" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="ex-from">
                  Available From (Optional)
                </label>
                <input
                  id="ex-from"
                  type="datetime-local"
                  className="form-input"
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ex-until">
                  Available Until (Optional)
                </label>
                <input
                  id="ex-until"
                  type="datetime-local"
                  className="form-input"
                  value={availableUntil}
                  onChange={(e) => setAvailableUntil(e.target.value)}
                />
              </div>
            </div>

            {/* Toggle Switches */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  style={{ width: "18px", height: "18px" }}
                />
                <span style={{ fontSize: "0.95rem" }}>Shuffle Questions for each candidate attempt</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={shuffleOptions}
                  onChange={(e) => setShuffleOptions(e.target.checked)}
                  style={{ width: "18px", height: "18px" }}
                />
                <span style={{ fontSize: "0.95rem" }}>Shuffle Multiple Choice Options</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={showScoreAfterSubmit}
                  onChange={(e) => setShowScoreAfterSubmit(e.target.checked)}
                  style={{ width: "18px", height: "18px" }}
                />
                <span style={{ fontSize: "0.95rem" }}>Show immediate Score & Pass/Fail status upon submission</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={showAnswersAfterSubmit}
                  onChange={(e) => setShowAnswersAfterSubmit(e.target.checked)}
                  style={{ width: "18px", height: "18px" }}
                />
                <span style={{ fontSize: "0.95rem" }}>Allow Candidate to review correct answers and explanations after submit</span>
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
              <button
                type="button"
                disabled={isSavingExam}
                onClick={async () => {
                  if (!title.trim() || !subjectId) {
                    setExamSaveError("Please enter an Exam Title and select a Subject before managing questions.");
                    setActiveTab("details");
                    return;
                  }
                  const ok = await handleSaveExam();
                  if (ok) {
                    setActiveTab("questions");
                  }
                }}
                className="btn btn-primary"
              >
                {isSavingExam ? "Saving Exam..." : "Save & Manage Questions →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Questions Manager */}
      {activeTab === "questions" && (
        <div>
          {!savedExamId && (
            <div style={{ marginBottom: "1.25rem" }}>
              <Alert
                type="warning"
                message="Basic exam details need to be saved first so questions can be associated with the exam. Click 'Add Question' or 'Bulk Import' to automatically save and proceed."
              />
            </div>
          )}

          {/* Running Totals Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem 1.5rem",
              backgroundColor: "var(--color-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border)",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div style={{ display: "flex", gap: "2rem" }}>
              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--color-muted)", fontWeight: "600" }}>QUESTIONS: </span>
                <strong style={{ fontSize: "1.1rem" }}>{questions?.length || 0}</strong>
              </div>
              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--color-muted)", fontWeight: "600" }}>TOTAL MARKS: </span>
                <strong style={{ fontSize: "1.1rem" }}>{totalExamMarks}</strong>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={handleOpenBulkImport}
                className="btn btn-secondary btn-sm"
              >
                <Upload size={16} /> Bulk Import Questions
              </button>
              <button onClick={handleOpenAddQuestion} className="btn btn-primary btn-sm">
                <PlusCircle size={16} /> Add Question
              </button>
            </div>
          </div>

          {/* Question List */}
          {questions?.length === 0 ? (
            <div className="card" style={{ padding: "4rem 2rem", textAlign: "center", color: "var(--color-muted)" }}>
              <HelpCircle size={40} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
              <p style={{ fontWeight: "600", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                No questions added yet
              </p>
              <p style={{ fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                Every exam requires at least one multiple choice question to be published.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={handleOpenBulkImport}
                  className="btn btn-secondary"
                >
                  <Upload size={18} /> Bulk Import Questions
                </button>
                <button onClick={handleOpenAddQuestion} className="btn btn-primary">
                  <PlusCircle size={18} /> Add First Question
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {questions?.map((q, idx) => (
                <div key={q.id} className="card">
                  <div className="card-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span style={{ fontWeight: "700" }}>Q{idx + 1}.</span>
                      <span style={{ fontWeight: "600", color: "var(--color-text)" }}>{q.text}</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span className="badge badge-muted">+{q.marks} / -{q.negativeMarks}</span>
                      <button
                        onClick={() => handleOpenEditQuestion(q)}
                        className="btn btn-secondary btn-icon"
                        title="Edit Question"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDuplicateQuestion(q.id)}
                        className="btn btn-ghost btn-icon"
                        title="Duplicate Question"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="btn btn-ghost btn-icon"
                        title="Delete Question"
                      >
                        <Trash2 size={14} color="var(--color-danger)" />
                      </button>
                    </div>
                  </div>

                  <div className="card-body" style={{ padding: "1rem 1.5rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.5rem" }}>
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = opt.id === q.correctOptionId;
                        return (
                          <div
                            key={opt.id}
                            style={{
                              padding: "0.5rem 0.75rem",
                              borderRadius: "var(--radius-md)",
                              backgroundColor: isCorrect ? "var(--color-success-light)" : "var(--color-surface-subtle)",
                              border: `1px solid ${isCorrect ? "var(--color-success)" : "var(--color-border)"}`,
                              fontSize: "0.85rem",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <span>
                              <strong>{String.fromCharCode(65 + optIdx)}.</strong> {opt.text}
                            </span>
                            {isCorrect && (
                              <span className="badge badge-success" style={{ fontSize: "0.7rem", padding: "0.15rem 0.45rem" }}>
                                Correct
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Preview & Publish */}
      {activeTab === "publish" && (
        <div className="card">
          <div className="card-header">
            <h2 style={{ fontSize: "1.2rem" }}>Pre-Publication Checklist</h2>
          </div>

          <div className="card-body">
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                {title.trim().length >= 3 ? (
                  <CheckCircle2 size={20} color="var(--color-success)" />
                ) : (
                  <AlertCircle size={20} color="var(--color-danger)" />
                )}
                <span>Exam title is defined ({title.length} characters)</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                {(questions?.length || 0) >= 1 ? (
                  <CheckCircle2 size={20} color="var(--color-success)" />
                ) : (
                  <AlertCircle size={20} color="var(--color-danger)" />
                )}
                <span>Exam contains at least 1 validated question ({questions?.length || 0} questions configured)</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <CheckCircle2 size={20} color="var(--color-success)" />
                <span>Timer is set to {durationMinutes} minutes with {passingPercentage}% passing threshold</span>
              </div>
            </div>

            {/* Publication button */}
            <div style={{ padding: "1.5rem", backgroundColor: "var(--color-surface-subtle)", borderRadius: "var(--radius-md)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <div style={{ fontWeight: "700", fontSize: "1.05rem" }}>Ready to launch?</div>
                <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                  Publishing makes this exam immediately discoverable by registered candidates.
                </div>
              </div>

              <button
                onClick={handlePublishExam}
                className="btn btn-primary btn-lg"
                disabled={!isPublishReady}
              >
                <Send size={18} /> Publish Exam Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Question Modal */}
      <Modal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        title={editingQuestion ? "Edit Question" : "Add Multiple Choice Question"}
        size="large"
      >
        {questionError && <Alert type="danger" message={questionError} />}

        <form onSubmit={handleSaveQuestion}>
          <div className="form-group">
            <label className="form-label" htmlFor="q-text">
              Question Text *
            </label>
            <textarea
              id="q-text"
              className="form-textarea"
              rows={3}
              value={qText}
              onChange={(e) => setQText(e.target.value)}
              placeholder="Enter your question statement here..."
              required
              autoFocus
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="q-marks">
                Positive Marks *
              </label>
              <input
                id="q-marks"
                type="number"
                step="0.5"
                min="0.5"
                className="form-input"
                value={qMarks}
                onChange={(e) => setQMarks(parseFloat(e.target.value) || 1)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="q-neg">
                Negative Marks (Penalty)
              </label>
              <input
                id="q-neg"
                type="number"
                step="0.25"
                min="0"
                className="form-input"
                value={qNegativeMarks}
                onChange={(e) => setQNegativeMarks(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Dynamic Options List */}
          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <label className="form-label">
                Options (Select the Radio button to mark the CORRECT answer) *
              </label>
              {qOptions.length < 6 && (
                <button type="button" onClick={handleAddOption} className="btn btn-ghost btn-sm">
                  <PlusCircle size={14} /> Add Option
                </button>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {qOptions.map((opt, optIdx) => {
                const isSelectedCorrect = qCorrectOptionId === opt.id;
                const letter = String.fromCharCode(65 + optIdx);

                return (
                  <div
                    key={opt.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "var(--radius-md)",
                      border: `1.5px solid ${isSelectedCorrect ? "var(--color-success)" : "var(--color-border)"}`,
                      backgroundColor: isSelectedCorrect ? "var(--color-success-light)" : "var(--color-surface)",
                    }}
                  >
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="correct-option-group"
                        checked={isSelectedCorrect}
                        onChange={() => setQCorrectOptionId(opt.id)}
                        style={{ width: "18px", height: "18px" }}
                      />
                      <span style={{ fontWeight: "700" }}>{letter}.</span>
                    </label>

                    <input
                      type="text"
                      className="form-input"
                      value={opt.text}
                      onChange={(e) => {
                        const updated = [...qOptions];
                        updated[optIdx].text = e.target.value;
                        setQOptions(updated);
                      }}
                      placeholder={`Option ${letter} text...`}
                      required
                    />

                    {qOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(optIdx)}
                        className="btn btn-ghost btn-icon"
                        title="Remove Option"
                      >
                        <Trash2 size={16} color="var(--color-danger)" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: "1rem" }}>
            <label className="form-label" htmlFor="q-exp">
              Answer Explanation (Optional)
            </label>
            <textarea
              id="q-exp"
              className="form-textarea"
              rows={2}
              value={qExplanation}
              onChange={(e) => setQExplanation(e.target.value)}
              placeholder="Will be displayed to candidates during post-exam review if enabled..."
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
            <button
              type="button"
              onClick={() => setIsQuestionModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingQuestion ? "Save Changes" : "Add Question"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Bulk Question Import Modal */}
      <BulkQuestionImportModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        examId={savedExamId || ""}
        onSuccess={() => {
          refetchQuestions();
          queryClient.invalidateQueries({ queryKey: ["admin-exam", savedExamId] });
        }}
      />
    </div>
  );
};
