import { z } from "zod";

export interface QuestionOptionDto {
  id: string;
  text: string;
}

// Admin question DTO includes correctOptionId and explanation
export interface AdminQuestionDto {
  id: string;
  examId: string;
  text: string;
  type: "single_choice";
  options: QuestionOptionDto[];
  correctOptionId: string;
  explanation?: string;
  marks: number;
  negativeMarks: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// Candidate question DTO strictly omits correctOptionId and explanation
export interface CandidateQuestionDto {
  id: string;
  examId: string;
  text: string;
  type: "single_choice";
  options: QuestionOptionDto[];
  marks: number;
  negativeMarks: number;
  order: number;
}

export const questionOptionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1, "Option text cannot be empty").max(500, "Option text cannot exceed 500 characters").trim(),
});

export const baseQuestionSchema = z.object({
  text: z.string().min(1, "Question text cannot be empty").max(2000, "Question text cannot exceed 2000 characters").trim(),
  type: z.literal("single_choice").default("single_choice"),
  options: z
    .array(questionOptionSchema)
    .min(2, "A question must have at least 2 options")
    .max(6, "A question cannot have more than 6 options")
    .refine(
      (opts) => {
        const texts = opts.map((o) => o.text.toLowerCase());
        return new Set(texts).size === texts.length;
      },
      { message: "Duplicate option texts are not allowed" }
    ),
  correctOptionId: z.string().min(1, "Correct answer must be specified"),
  explanation: z.string().max(2000).optional(),
  marks: z.number().positive("Marks must be greater than 0"),
  negativeMarks: z.number().min(0, "Negative marks must be 0 or greater").default(0),
  order: z.number().int().min(0).optional(),
});

export const createQuestionSchema = baseQuestionSchema
  .refine((data) => data.negativeMarks <= data.marks, {
    message: "Negative marks cannot exceed positive marks",
    path: ["negativeMarks"],
  })
  .refine((data) => data.options.some((opt) => opt.id === data.correctOptionId), {
    message: "Selected correct option ID must belong to the question options",
    path: ["correctOptionId"],
  });

export type CreateQuestionDto = z.infer<typeof createQuestionSchema>;

export const updateQuestionSchema = baseQuestionSchema.partial();
export type UpdateQuestionDto = z.infer<typeof updateQuestionSchema>;

export const reorderQuestionsSchema = z.object({
  questionIds: z.array(z.string().min(1)).min(1, "At least one question ID required"),
});

export type ReorderQuestionsDto = z.infer<typeof reorderQuestionsSchema>;

export const bulkCreateQuestionsSchema = z.object({
  questions: z
    .array(createQuestionSchema)
    .min(1, "At least one question is required for bulk import")
    .max(200, "Maximum 200 questions can be imported in a single batch"),
});

export type BulkCreateQuestionsDto = z.infer<typeof bulkCreateQuestionsSchema>;

