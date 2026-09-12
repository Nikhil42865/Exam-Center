"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveAnswerSchema = void 0;
const zod_1 = require("zod");
exports.saveAnswerSchema = zod_1.z.object({
    selectedOptionId: zod_1.z.string().optional().nullable(),
    isFlagged: zod_1.z.boolean().default(false),
});
//# sourceMappingURL=attempts.js.map