"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateExamSchema = exports.createExamSchema = exports.baseExamSchema = void 0;
const zod_1 = require("zod");
exports.baseExamSchema = zod_1.z.object({
    subjectId: zod_1.z.string().min(1, "Subject is required"),
    title: zod_1.z.string().min(3, "Title must be at least 3 characters").max(150, "Title cannot exceed 150 characters").trim(),
    slug: zod_1.z.string().min(3).max(180).regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase alphanumeric characters and hyphens").optional(),
    description: zod_1.z.string().max(2000).optional(),
    instructions: zod_1.z.string().min(5, "Instructions must be at least 5 characters").max(5000),
    durationMinutes: zod_1.z.number().int().min(1, "Duration must be at least 1 minute").max(300, "Duration cannot exceed 300 minutes"),
    passingPercentage: zod_1.z.number().min(0, "Passing percentage must be at least 0").max(100, "Passing percentage cannot exceed 100"),
    attemptLimit: zod_1.z.number().int().min(1, "Attempt limit must be at least 1").max(20, "Attempt limit cannot exceed 20").default(1),
    availableFrom: zod_1.z.string().datetime({ offset: true }).or(zod_1.z.string().datetime()).optional().nullable(),
    availableUntil: zod_1.z.string().datetime({ offset: true }).or(zod_1.z.string().datetime()).optional().nullable(),
    shuffleQuestions: zod_1.z.boolean().default(false),
    shuffleOptions: zod_1.z.boolean().default(false),
    showScoreAfterSubmit: zod_1.z.boolean().default(true),
    showAnswersAfterSubmit: zod_1.z.boolean().default(false),
});
exports.createExamSchema = exports.baseExamSchema.refine((data) => {
    if (data.availableFrom && data.availableUntil) {
        return new Date(data.availableUntil).getTime() > new Date(data.availableFrom).getTime();
    }
    return true;
}, {
    message: "Available until must be later than available from",
    path: ["availableUntil"],
});
exports.updateExamSchema = exports.baseExamSchema.partial();
//# sourceMappingURL=exams.js.map