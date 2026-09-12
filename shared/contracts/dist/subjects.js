"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubjectSchema = exports.createSubjectSchema = void 0;
const zod_1 = require("zod");
exports.createSubjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Subject name must be at least 2 characters").max(80, "Subject name cannot exceed 80 characters").trim(),
    slug: zod_1.z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase alphanumeric characters and hyphens").optional(),
    description: zod_1.z.string().max(1000).optional(),
    isActive: zod_1.z.boolean().default(true),
});
exports.updateSubjectSchema = exports.createSubjectSchema.partial();
//# sourceMappingURL=subjects.js.map