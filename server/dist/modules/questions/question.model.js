"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const QuestionOptionSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
}, { _id: false });
const QuestionSchema = new mongoose_1.Schema({
    examId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Exam",
        required: true,
        index: true,
    },
    text: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 2000,
    },
    type: {
        type: String,
        enum: ["single_choice"],
        default: "single_choice",
        required: true,
    },
    options: {
        type: [QuestionOptionSchema],
        required: true,
        validate: [
            (val) => val.length >= 2 && val.length <= 6,
            "A question must have between 2 and 6 options",
        ],
    },
    correctOptionId: {
        type: String,
        required: true,
    },
    explanation: {
        type: String,
        maxlength: 2000,
    },
    marks: {
        type: Number,
        required: true,
        min: 0.1,
    },
    negativeMarks: {
        type: Number,
        default: 0,
        min: 0,
    },
    order: {
        type: Number,
        default: 0,
        index: true,
    },
}, {
    timestamps: true,
    toJSON: {
        transform(_doc, ret) {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
});
QuestionSchema.index({ examId: 1, order: 1 });
QuestionSchema.methods.toAdminDto = function () {
    return {
        id: this._id.toString(),
        examId: this.examId.toString(),
        text: this.text,
        type: this.type,
        options: this.options.map((o) => ({ id: o.id, text: o.text })),
        correctOptionId: this.correctOptionId,
        explanation: this.explanation,
        marks: this.marks,
        negativeMarks: this.negativeMarks,
        order: this.order,
        createdAt: this.createdAt.toISOString(),
        updatedAt: this.updatedAt.toISOString(),
    };
};
// CRITICAL SECURITY REQUIREMENT: Candidate DTO strictly omits correctOptionId and explanation
QuestionSchema.methods.toCandidateDto = function () {
    return {
        id: this._id.toString(),
        examId: this.examId.toString(),
        text: this.text,
        type: this.type,
        options: this.options.map((o) => ({ id: o.id, text: o.text })),
        marks: this.marks,
        negativeMarks: this.negativeMarks,
        order: this.order,
    };
};
exports.QuestionModel = mongoose_1.default.model("Question", QuestionSchema);
