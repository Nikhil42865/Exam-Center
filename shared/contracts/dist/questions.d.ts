import { z } from "zod";
export interface QuestionOptionDto {
    id: string;
    text: string;
}
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
export declare const questionOptionSchema: z.ZodObject<{
    id: z.ZodString;
    text: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    text: string;
}, {
    id: string;
    text: string;
}>;
export declare const baseQuestionSchema: z.ZodObject<{
    text: z.ZodString;
    type: z.ZodDefault<z.ZodLiteral<"single_choice">>;
    options: z.ZodEffects<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        text: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        text: string;
    }, {
        id: string;
        text: string;
    }>, "many">, {
        id: string;
        text: string;
    }[], {
        id: string;
        text: string;
    }[]>;
    correctOptionId: z.ZodString;
    explanation: z.ZodOptional<z.ZodString>;
    marks: z.ZodNumber;
    negativeMarks: z.ZodDefault<z.ZodNumber>;
    order: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    text: string;
    options: {
        id: string;
        text: string;
    }[];
    type: "single_choice";
    correctOptionId: string;
    marks: number;
    negativeMarks: number;
    explanation?: string | undefined;
    order?: number | undefined;
}, {
    text: string;
    options: {
        id: string;
        text: string;
    }[];
    correctOptionId: string;
    marks: number;
    type?: "single_choice" | undefined;
    explanation?: string | undefined;
    negativeMarks?: number | undefined;
    order?: number | undefined;
}>;
export declare const createQuestionSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    text: z.ZodString;
    type: z.ZodDefault<z.ZodLiteral<"single_choice">>;
    options: z.ZodEffects<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        text: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        text: string;
    }, {
        id: string;
        text: string;
    }>, "many">, {
        id: string;
        text: string;
    }[], {
        id: string;
        text: string;
    }[]>;
    correctOptionId: z.ZodString;
    explanation: z.ZodOptional<z.ZodString>;
    marks: z.ZodNumber;
    negativeMarks: z.ZodDefault<z.ZodNumber>;
    order: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    text: string;
    options: {
        id: string;
        text: string;
    }[];
    type: "single_choice";
    correctOptionId: string;
    marks: number;
    negativeMarks: number;
    explanation?: string | undefined;
    order?: number | undefined;
}, {
    text: string;
    options: {
        id: string;
        text: string;
    }[];
    correctOptionId: string;
    marks: number;
    type?: "single_choice" | undefined;
    explanation?: string | undefined;
    negativeMarks?: number | undefined;
    order?: number | undefined;
}>, {
    text: string;
    options: {
        id: string;
        text: string;
    }[];
    type: "single_choice";
    correctOptionId: string;
    marks: number;
    negativeMarks: number;
    explanation?: string | undefined;
    order?: number | undefined;
}, {
    text: string;
    options: {
        id: string;
        text: string;
    }[];
    correctOptionId: string;
    marks: number;
    type?: "single_choice" | undefined;
    explanation?: string | undefined;
    negativeMarks?: number | undefined;
    order?: number | undefined;
}>, {
    text: string;
    options: {
        id: string;
        text: string;
    }[];
    type: "single_choice";
    correctOptionId: string;
    marks: number;
    negativeMarks: number;
    explanation?: string | undefined;
    order?: number | undefined;
}, {
    text: string;
    options: {
        id: string;
        text: string;
    }[];
    correctOptionId: string;
    marks: number;
    type?: "single_choice" | undefined;
    explanation?: string | undefined;
    negativeMarks?: number | undefined;
    order?: number | undefined;
}>;
export type CreateQuestionDto = z.infer<typeof createQuestionSchema>;
export declare const updateQuestionSchema: z.ZodObject<{
    text: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodDefault<z.ZodLiteral<"single_choice">>>;
    options: z.ZodOptional<z.ZodEffects<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        text: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        text: string;
    }, {
        id: string;
        text: string;
    }>, "many">, {
        id: string;
        text: string;
    }[], {
        id: string;
        text: string;
    }[]>>;
    correctOptionId: z.ZodOptional<z.ZodString>;
    explanation: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    marks: z.ZodOptional<z.ZodNumber>;
    negativeMarks: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    order: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    text?: string | undefined;
    options?: {
        id: string;
        text: string;
    }[] | undefined;
    type?: "single_choice" | undefined;
    correctOptionId?: string | undefined;
    explanation?: string | undefined;
    marks?: number | undefined;
    negativeMarks?: number | undefined;
    order?: number | undefined;
}, {
    text?: string | undefined;
    options?: {
        id: string;
        text: string;
    }[] | undefined;
    type?: "single_choice" | undefined;
    correctOptionId?: string | undefined;
    explanation?: string | undefined;
    marks?: number | undefined;
    negativeMarks?: number | undefined;
    order?: number | undefined;
}>;
export type UpdateQuestionDto = z.infer<typeof updateQuestionSchema>;
export declare const reorderQuestionsSchema: z.ZodObject<{
    questionIds: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    questionIds: string[];
}, {
    questionIds: string[];
}>;
export type ReorderQuestionsDto = z.infer<typeof reorderQuestionsSchema>;
export declare const bulkCreateQuestionsSchema: z.ZodObject<{
    questions: z.ZodArray<z.ZodEffects<z.ZodEffects<z.ZodObject<{
        text: z.ZodString;
        type: z.ZodDefault<z.ZodLiteral<"single_choice">>;
        options: z.ZodEffects<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            text: string;
        }, {
            id: string;
            text: string;
        }>, "many">, {
            id: string;
            text: string;
        }[], {
            id: string;
            text: string;
        }[]>;
        correctOptionId: z.ZodString;
        explanation: z.ZodOptional<z.ZodString>;
        marks: z.ZodNumber;
        negativeMarks: z.ZodDefault<z.ZodNumber>;
        order: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        text: string;
        options: {
            id: string;
            text: string;
        }[];
        type: "single_choice";
        correctOptionId: string;
        marks: number;
        negativeMarks: number;
        explanation?: string | undefined;
        order?: number | undefined;
    }, {
        text: string;
        options: {
            id: string;
            text: string;
        }[];
        correctOptionId: string;
        marks: number;
        type?: "single_choice" | undefined;
        explanation?: string | undefined;
        negativeMarks?: number | undefined;
        order?: number | undefined;
    }>, {
        text: string;
        options: {
            id: string;
            text: string;
        }[];
        type: "single_choice";
        correctOptionId: string;
        marks: number;
        negativeMarks: number;
        explanation?: string | undefined;
        order?: number | undefined;
    }, {
        text: string;
        options: {
            id: string;
            text: string;
        }[];
        correctOptionId: string;
        marks: number;
        type?: "single_choice" | undefined;
        explanation?: string | undefined;
        negativeMarks?: number | undefined;
        order?: number | undefined;
    }>, {
        text: string;
        options: {
            id: string;
            text: string;
        }[];
        type: "single_choice";
        correctOptionId: string;
        marks: number;
        negativeMarks: number;
        explanation?: string | undefined;
        order?: number | undefined;
    }, {
        text: string;
        options: {
            id: string;
            text: string;
        }[];
        correctOptionId: string;
        marks: number;
        type?: "single_choice" | undefined;
        explanation?: string | undefined;
        negativeMarks?: number | undefined;
        order?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    questions: {
        text: string;
        options: {
            id: string;
            text: string;
        }[];
        type: "single_choice";
        correctOptionId: string;
        marks: number;
        negativeMarks: number;
        explanation?: string | undefined;
        order?: number | undefined;
    }[];
}, {
    questions: {
        text: string;
        options: {
            id: string;
            text: string;
        }[];
        correctOptionId: string;
        marks: number;
        type?: "single_choice" | undefined;
        explanation?: string | undefined;
        negativeMarks?: number | undefined;
        order?: number | undefined;
    }[];
}>;
export type BulkCreateQuestionsDto = z.infer<typeof bulkCreateQuestionsSchema>;
//# sourceMappingURL=questions.d.ts.map