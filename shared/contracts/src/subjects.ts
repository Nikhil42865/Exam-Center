import { z } from "zod";

export interface SubjectDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  examCount?: number;
  createdAt: string;
  updatedAt: string;
}

export const createSubjectSchema = z.object({
  name: z.string().min(2, "Subject name must be at least 2 characters").max(80, "Subject name cannot exceed 80 characters").trim(),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase alphanumeric characters and hyphens").optional(),
  description: z.string().max(1000).optional(),
  isActive: z.boolean().default(true),
});

export type CreateSubjectDto = z.infer<typeof createSubjectSchema>;

export const updateSubjectSchema = createSubjectSchema.partial();
export type UpdateSubjectDto = z.infer<typeof updateSubjectSchema>;
