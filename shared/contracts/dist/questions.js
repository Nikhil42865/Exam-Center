"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkCreateQuestionsSchema = exports.reorderQuestionsSchema = exports.updateQuestionSchema = exports.createQuestionSchema = exports.baseQuestionSchema = exports.questionOptionSchema = void 0;
const zod_1 = require("zod");
exports.questionOptionSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    text: zod_1.z.string().min(1, "Option text cannot be empty").max(500, "Option text cannot exceed 500 characters").trim(),
});
exports.baseQuestionSchema = zod_1.z.object({
    text: zod_1.z.string().min(1, "Question text cannot be empty").max(2000, "Question text cannot exceed 2000 characters").trim(),
    type: zod_1.z.literal("single_choice").default("single_choice"),
    options: zod_1.z
        .array(exports.questionOptionSchema)
        .min(2, "A question must have at least 2 options")
        .max(6, "A question cannot have more than 6 options")
        .refine((opts) => {
        const texts = opts.map((o) => o.text.toLowerCase());
        return new Set(texts).size === texts.length;
    }, { message: "Duplicate option texts are not allowed" }),
    correctOptionId: zod_1.z.string().min(1, "Correct answer must be specified"),
    explanation: zod_1.z.string().max(2000).optional(),
    marks: zod_1.z.number().positive("Marks must be greater than 0"),
    negativeMarks: zod_1.z.number().min(0, "Negative marks must be 0 or greater").default(0),
    order: zod_1.z.number().int().min(0).optional(),
});
exports.createQuestionSchema = exports.baseQuestionSchema
    .refine((data) => data.negativeMarks <= data.marks, {
    message: "Negative marks cannot exceed positive marks",
    path: ["negativeMarks"],
})
    .refine((data) => data.options.some((opt) => opt.id === data.correctOptionId), {
    message: "Selected correct option ID must belong to the question options",
    path: ["correctOptionId"],
});
exports.updateQuestionSchema = exports.baseQuestionSchema.partial();
exports.reorderQuestionsSchema = zod_1.z.object({
    questionIds: zod_1.z.array(zod_1.z.string().min(1)).min(1, "At least one question ID required"),
});
exports.bulkCreateQuestionsSchema = zod_1.z.object({
    questions: zod_1.z
        .array(exports.createQuestionSchema)
        .min(1, "At least one question is required for bulk import")
        .max(200, "Maximum 200 questions can be imported in a single batch"),
});
//# sourceMappingURL=questions.js.map