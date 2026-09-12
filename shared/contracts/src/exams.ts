import { z } from "zod";

export type ExamStatus = "draft" | "published" | "archived";

export interface ExamDto {
  id: string;
  subjectId: string;
  subjectName?: string;
  title: string;
  slug: string;
  description?: string;
  instructions: string;
  durationMinutes: number;
  passingPercentage: number;
  attemptLimit: number;
  availableFrom?: string;
  availableUntil?: string;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showScoreAfterSubmit: boolean;
  showAnswersAfterSubmit: boolean;
  status: ExamStatus;
  version: number;
  questionCount: number;
  totalMarks: number;
  createdBy: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateExamDto {
  id: string;
  subjectId: string;
  subjectName?: string;
  title: string;
  slug: string;
  description?: string;
  instructions: string;
  durationMinutes: number;
  passingPercentage: number;
  attemptLimit: number;
  attemptsUsed: number;
  isEligible: boolean;
  ineligibilityReason?: string;
  availableFrom?: string;
  availableUntil?: string;
  showScoreAfterSubmit: boolean;
  showAnswersAfterSubmit: boolean;
  status: ExamStatus;
  questionCount: number;
  totalMarks: number;
  activeAttemptId?: string;
}

export const baseExamSchema = z.object({
  subjectId: z.string().min(1, "Subject is required"),
  title: z.string().min(3, "Title must be at least 3 characters").max(150, "Title cannot exceed 150 characters").trim(),
  slug: z.string().min(3).max(180).regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase alphanumeric characters and hyphens").optional(),
  description: z.string().max(2000).optional(),
  instructions: z.string().min(5, "Instructions must be at least 5 characters").max(5000),
  durationMinutes: z.number().int().min(1, "Duration must be at least 1 minute").max(300, "Duration cannot exceed 300 minutes"),
  passingPercentage: z.number().min(0, "Passing percentage must be at least 0").max(100, "Passing percentage cannot exceed 100"),
  attemptLimit: z.number().int().min(1, "Attempt limit must be at least 1").max(20, "Attempt limit cannot exceed 20").default(1),
  availableFrom: z.string().datetime({ offset: true }).or(z.string().datetime()).optional().nullable(),
  availableUntil: z.string().datetime({ offset: true }).or(z.string().datetime()).optional().nullable(),
  shuffleQuestions: z.boolean().default(false),
  shuffleOptions: z.boolean().default(false),
  showScoreAfterSubmit: z.boolean().default(true),
  showAnswersAfterSubmit: z.boolean().default(false),
});

export const createExamSchema = baseExamSchema.refine(
  (data) => {
    if (data.availableFrom && data.availableUntil) {
      return new Date(data.availableUntil).getTime() > new Date(data.availableFrom).getTime();
    }
    return true;
  },
  {
    message: "Available until must be later than available from",
    path: ["availableUntil"],
  }
);

export type CreateExamDto = z.infer<typeof createExamSchema>;

export const updateExamSchema = baseExamSchema.partial();
export type UpdateExamDto = z.infer<typeof updateExamSchema>;
