import {
  ApiResponse,
  UserDto,
  LoginRequestDto,
  RegisterRequestDto,
  SubjectDto,
  CreateSubjectDto,
  UpdateSubjectDto,
  ExamDto,
  CandidateExamDto,
  CreateExamDto,
  UpdateExamDto,
  AdminQuestionDto,
  CreateQuestionDto,
  UpdateQuestionDto,
  ActiveAttemptDto,
  SaveAnswerDto,
  ResultSummaryDto,
  DetailedReviewDto,
  AttemptHistoryItemDto,
  AdminDashboardMetricsDto,
  AdminAttemptListItemDto,
  AdminAttemptDetailDto,
} from "@examcenter/contracts";

const API_BASE = "/api/v1";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include", // Essential for HttpOnly authentication cookies
  });

  const data: ApiResponse<T> = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || "An unexpected error occurred");
  }

  return data.data;
}

export const api = {
  // Auth & Profile
  auth: {
    register: (dto: RegisterRequestDto) =>
      request<{ user: UserDto; accessToken?: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(dto),
      }),
    login: (dto: LoginRequestDto) =>
      request<{ user: UserDto; accessToken?: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(dto),
      }),
    logout: () =>
      request<{ message: string }>("/auth/logout", {
        method: "POST",
      }),
    getMe: () => request<{ user: UserDto }>("/users/me"),
    updateMe: (name: string) =>
      request<{ user: UserDto }>("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ name }),
      }),
  },

  // Subjects
  subjects: {
    getCandidateSubjects: () => request<SubjectDto[]>("/subjects"),
    getAdminSubjects: () => request<SubjectDto[]>("/admin/subjects"),
    createSubject: (dto: CreateSubjectDto) =>
      request<SubjectDto>("/admin/subjects", {
        method: "POST",
        body: JSON.stringify(dto),
      }),
    updateSubject: (id: string, dto: UpdateSubjectDto) =>
      request<SubjectDto>(`/admin/subjects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(dto),
      }),
    deleteSubject: (id: string) =>
      request<{ action: "deleted" | "deactivated"; subject: SubjectDto }>(`/admin/subjects/${id}`, {
        method: "DELETE",
      }),
  },

  // Exams
  exams: {
    getCandidateExams: (params?: { subjectId?: string; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.subjectId) q.append("subjectId", params.subjectId);
      if (params?.search) q.append("search", params.search);
      return request<CandidateExamDto[]>(`/exams?${q.toString()}`);
    },
    getCandidateExamDetails: (id: string) => request<CandidateExamDto>(`/exams/${id}`),
    getAdminExams: (params?: { status?: string; subjectId?: string; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.status) q.append("status", params.status);
      if (params?.subjectId) q.append("subjectId", params.subjectId);
      if (params?.search) q.append("search", params.search);
      return request<ExamDto[]>(`/admin/exams?${q.toString()}`);
    },
    getAdminExamById: (id: string) => request<ExamDto>(`/admin/exams/${id}`),
    createExam: (dto: CreateExamDto) =>
      request<ExamDto>("/admin/exams", {
        method: "POST",
        body: JSON.stringify(dto),
      }),
    updateExam: (id: string, dto: UpdateExamDto) =>
      request<ExamDto>(`/admin/exams/${id}`, {
        method: "PATCH",
        body: JSON.stringify(dto),
      }),
    publishExam: (id: string) =>
      request<ExamDto>(`/admin/exams/${id}/publish`, {
        method: "POST",
      }),
    unpublishExam: (id: string) =>
      request<ExamDto>(`/admin/exams/${id}/unpublish`, {
        method: "POST",
      }),
    archiveExam: (id: string) =>
      request<ExamDto>(`/admin/exams/${id}/archive`, {
        method: "POST",
      }),
    getAdminPreview: (id: string) => request<{ exam: ExamDto; questions: AdminQuestionDto[] }>(`/admin/exams/${id}/preview`),
  },

  // Questions
  questions: {
    getExamQuestions: (examId: string) => request<AdminQuestionDto[]>(`/admin/exams/${examId}/questions`),
    createQuestion: (examId: string, dto: CreateQuestionDto) =>
      request<AdminQuestionDto>(`/admin/exams/${examId}/questions`, {
        method: "POST",
        body: JSON.stringify(dto),
      }),
    updateQuestion: (id: string, dto: UpdateQuestionDto) =>
      request<AdminQuestionDto>(`/admin/questions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(dto),
      }),
    deleteQuestion: (id: string) =>
      request<{ message: string }>(`/admin/questions/${id}`, {
        method: "DELETE",
      }),
    duplicateQuestion: (id: string) =>
      request<AdminQuestionDto>(`/admin/questions/${id}/duplicate`, {
        method: "POST",
      }),
    reorderQuestions: (examId: string, questionIds: string[]) =>
      request<AdminQuestionDto[]>(`/admin/exams/${examId}/questions/order`, {
        method: "PUT",
        body: JSON.stringify({ questionIds }),
      }),
    bulkCreateQuestions: (examId: string, questions: CreateQuestionDto[]) =>
      request<AdminQuestionDto[]>(`/admin/exams/${examId}/questions/bulk`, {
        method: "POST",
        body: JSON.stringify({ questions }),
      }),
  },

  // Attempts
  attempts: {
    startAttempt: (examId: string) =>
      request<ActiveAttemptDto>(`/exams/${examId}/attempts`, {
        method: "POST",
      }),
    getActiveAttempt: (attemptId: string) => request<ActiveAttemptDto>(`/attempts/${attemptId}`),
    saveAnswer: (attemptId: string, questionId: string, dto: SaveAnswerDto) =>
      request<{ success: boolean; savedAt: string }>(`/attempts/${attemptId}/answers/${questionId}`, {
        method: "PUT",
        body: JSON.stringify(dto),
      }),
    submitAttempt: (attemptId: string) =>
      request<ResultSummaryDto>(`/attempts/${attemptId}/submit`, {
        method: "POST",
      }),
    getResult: (attemptId: string) => request<DetailedReviewDto>(`/attempts/${attemptId}/result`),
    getCandidateHistory: () => request<AttemptHistoryItemDto[]>("/attempts"),
  },

  // Reports
  reports: {
    getDashboardMetrics: () => request<AdminDashboardMetricsDto>("/admin/dashboard"),
    getAttempts: (params?: { examId?: string; status?: string; passed?: boolean; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.examId) q.append("examId", params.examId);
      if (params?.status) q.append("status", params.status);
      if (params?.passed !== undefined) q.append("passed", String(params.passed));
      if (params?.search) q.append("search", params.search);
      return request<AdminAttemptListItemDto[]>(`/admin/attempts?${q.toString()}`);
    },
    getAttemptDetail: (attemptId: string) => request<AdminAttemptDetailDto>(`/admin/attempts/${attemptId}`),
  },
};
