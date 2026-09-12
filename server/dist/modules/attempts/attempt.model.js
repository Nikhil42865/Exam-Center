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
exports.AttemptModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AttemptSnapshotQuestionSchema = new mongoose_1.Schema({
    questionId: { type: String, required: true },
    text: { type: String, required: true },
    options: [
        {
            id: { type: String, required: true },
            text: { type: String, required: true },
        },
    ],
    correctOptionId: { type: String, required: true },
    explanation: { type: String },
    marks: { type: Number, required: true },
    negativeMarks: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
}, { _id: false });
const AttemptSnapshotSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    passingPercentage: { type: Number, required: true },
    durationMinutes: { type: Number, required: true },
    questions: [AttemptSnapshotQuestionSchema],
}, { _id: false });
const AttemptAnswerSchema = new mongoose_1.Schema({
    questionId: { type: String, required: true },
    selectedOptionId: { type: String },
    isFlagged: { type: Boolean, default: false },
    savedAt: { type: Date, default: Date.now },
}, { _id: false });
const AttemptResultSchema = new mongoose_1.Schema({
    score: { type: Number, required: true },
    maximumMarks: { type: Number, required: true },
    percentage: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    correctCount: { type: Number, required: true },
    incorrectCount: { type: Number, required: true },
    unansweredCount: { type: Number, required: true },
}, { _id: false });
const AttemptSchema = new mongoose_1.Schema({
    examId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Exam",
        required: true,
        index: true,
    },
    examVersion: {
        type: Number,
        required: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    sequenceNumber: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["in_progress", "submitted", "expired"],
        default: "in_progress",
        required: true,
        index: true,
    },
    startedAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true,
    },
    submittedAt: {
        type: Date,
    },
    snapshot: {
        type: AttemptSnapshotSchema,
        required: true,
    },
    answers: {
        type: [AttemptAnswerSchema],
        default: [],
    },
    result: {
        type: AttemptResultSchema,
    },
}, {
    timestamps: true,
});
// Indexes
AttemptSchema.index({ userId: 1, examId: 1, sequenceNumber: 1 }, { unique: true });
AttemptSchema.index({ examId: 1, status: 1, submittedAt: -1 });
// Critical Security: toActiveDto strictly omits correctOptionId and explanation
AttemptSchema.methods.toActiveDto = function () {
    const safeQuestions = this.snapshot.questions.map((q) => ({
        id: q.questionId,
        examId: this.examId.toString(),
        text: q.text,
        type: "single_choice",
        options: q.options.map((o) => ({ id: o.id, text: o.text })),
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        order: q.order,
    }));
    return {
        id: this._id.toString(),
        examId: this.examId.toString(),
        examTitle: this.snapshot.title,
        sequenceNumber: this.sequenceNumber,
        durationMinutes: this.snapshot.durationMinutes,
        startedAt: this.startedAt.toISOString(),
        expiresAt: this.expiresAt.toISOString(),
        serverNow: new Date().toISOString(),
        status: this.status,
        questions: safeQuestions,
        answers: this.answers.map((a) => ({
            questionId: a.questionId,
            selectedOptionId: a.selectedOptionId,
            isFlagged: a.isFlagged,
            savedAt: a.savedAt?.toISOString(),
        })),
    };
};
AttemptSchema.methods.toResultSummaryDto = function (showAnswersAfterSubmit) {
    const total = this.snapshot.questions.length;
    const res = this.result || {
        score: 0,
        maximumMarks: 0,
        percentage: 0,
        passed: false,
        correctCount: 0,
        incorrectCount: 0,
        unansweredCount: total,
    };
    return {
        attemptId: this._id.toString(),
        examId: this.examId.toString(),
        examTitle: this.snapshot.title,
        sequenceNumber: this.sequenceNumber,
        status: this.status,
        score: res.score,
        maximumMarks: res.maximumMarks,
        percentage: res.percentage,
        passed: res.passed,
        passingPercentage: this.snapshot.passingPercentage,
        counts: {
            correct: res.correctCount,
            incorrect: res.incorrectCount,
            unanswered: res.unansweredCount,
            total,
        },
        startedAt: this.startedAt.toISOString(),
        submittedAt: this.submittedAt?.toISOString(),
        showAnswersAfterSubmit,
    };
};
exports.AttemptModel = mongoose_1.default.model("Attempt", AttemptSchema);
