import { AttemptStatus } from "./attempts.js";

export interface AdminDashboardMetricsDto {
  totalExams: number;
  publishedExams: number;
  draftExams: number;
  archivedExams: number;
  totalSubjects: number;
  totalAttempts: number;
  completedAttempts: number;
  averageScorePercentage: number;
  passRatePercentage: number;
  recentAttempts: AdminAttemptListItemDto[];
}

export interface AdminAttemptListItemDto {
  id: string;
  examId: string;
  examTitle: string;
  subjectName: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  sequenceNumber: number;
  status: AttemptStatus;
  score: number;
  maximumMarks: number;
  percentage: number;
  passed: boolean;
  startedAt: string;
  submittedAt?: string;
}

export interface AdminAttemptDetailQuestionDto {
  questionId: string;
  order: number;
  text: string;
  options: Array<{ id: string; text: string }>;
  selectedOptionId?: string;
  correctOptionId: string;
  isCorrect: boolean;
  marksAwarded: number;
  marksPossible: number;
  explanation?: string;
}

export interface AdminAttemptDetailDto {
  attempt: AdminAttemptListItemDto;
  counts: {
    correct: number;
    incorrect: number;
    unanswered: number;
    total: number;
  };
  questions: AdminAttemptDetailQuestionDto[];
}
