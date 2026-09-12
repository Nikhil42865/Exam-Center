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
export declare const createSubjectSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    isActive: boolean;
    slug?: string | undefined;
    description?: string | undefined;
}, {
    name: string;
    slug?: string | undefined;
    description?: string | undefined;
    isActive?: boolean | undefined;
}>;
export type CreateSubjectDto = z.infer<typeof createSubjectSchema>;
export declare const updateSubjectSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    slug?: string | undefined;
    description?: string | undefined;
    isActive?: boolean | undefined;
}, {
    name?: string | undefined;
    slug?: string | undefined;
    description?: string | undefined;
    isActive?: boolean | undefined;
}>;
export type UpdateSubjectDto = z.infer<typeof updateSubjectSchema>;
//# sourceMappingURL=subjects.d.ts.map