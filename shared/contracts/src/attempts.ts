import { z } from "zod";
import { CandidateQuestionDto, QuestionOptionDto } from "./questions.js";

export type AttemptStatus = "in_progress" | "submitted" | "expired";

export interface CandidateAnswerState {
  questionId: string;
  selectedOptionId?: string;
  isFlagged: boolean;
  savedAt?: string;
}

export interface ActiveAttemptDto {
  id: string;
  examId: string;
  examTitle: string;
  sequenceNumber: number;
  durationMinutes: number;
  startedAt: string;
  expiresAt: string;
  serverNow: string; // Authoritative server timestamp to sync client countdown
  status: AttemptStatus;
  questions: CandidateQuestionDto[];
  answers: CandidateAnswerState[];
}

export interface ResultSummaryDto {
  attemptId: string;
  examId: string;
  examTitle: string;
  sequenceNumber: number;
  status: AttemptStatus;
  score: number;
  maximumMarks: number;
  percentage: number;
  passed: boolean;
  passingPercentage: number;
  counts: {
    correct: number;
    incorrect: number;
    unanswered: number;
    total: number;
  };
  startedAt: string;
  submittedAt?: string;
  showAnswersAfterSubmit: boolean;
}

export interface DetailedReviewQuestionDto {
  questionId: string;
  order: number;
  text: string;
  options: QuestionOptionDto[];
  selectedOptionId?: string;
  correctOptionId: string;
  isCorrect: boolean;
  marksAwarded: number;
  marksPossible: number;
  explanation?: string;
}

export interface DetailedReviewDto {
  attemptId: string;
  examId: string;
  examTitle: string;
  summary: ResultSummaryDto;
  questions: DetailedReviewQuestionDto[];
}

export interface AttemptHistoryItemDto {
  id: string;
  examId: string;
  examTitle: string;
  subjectName: string;
  sequenceNumber: number;
  status: AttemptStatus;
  score?: number;
  maximumMarks?: number;
  percentage?: number;
  passed?: boolean;
  startedAt: string;
  submittedAt?: string;
  showScoreAfterSubmit: boolean;
  showAnswersAfterSubmit: boolean;
}

export const saveAnswerSchema = z.object({
  selectedOptionId: z.string().optional().nullable(),
  isFlagged: z.boolean().default(false),
});

export type SaveAnswerDto = z.infer<typeof saveAnswerSchema>;
