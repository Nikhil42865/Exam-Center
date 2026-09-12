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
exports.ExamModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ExamSchema = new mongoose_1.Schema({
    subjectId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 150,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    description: {
        type: String,
        maxlength: 2000,
    },
    instructions: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 5000,
    },
    durationMinutes: {
        type: Number,
        required: true,
        min: 1,
        max: 300,
    },
    passingPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    attemptLimit: {
        type: Number,
        required: true,
        min: 1,
        max: 20,
        default: 1,
    },
    availableFrom: {
        type: Date,
    },
    availableUntil: {
        type: Date,
    },
    shuffleQuestions: {
        type: Boolean,
        default: false,
    },
    shuffleOptions: {
        type: Boolean,
        default: false,
    },
    showScoreAfterSubmit: {
        type: Boolean,
        default: true,
    },
    showAnswersAfterSubmit: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ["draft", "published", "archived"],
        default: "draft",
        required: true,
        index: true,
    },
    version: {
        type: Number,
        default: 1,
        required: true,
    },
    questionCount: {
        type: Number,
        default: 0,
    },
    totalMarks: {
        type: Number,
        default: 0,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    publishedAt: {
        type: Date,
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
// Indexes
ExamSchema.index({ subjectId: 1, status: 1, availableFrom: 1, availableUntil: 1 });
ExamSchema.methods.toDto = function (subjectName) {
    return {
        id: this._id.toString(),
        subjectId: this.subjectId.toString(),
        subjectName,
        title: this.title,
        slug: this.slug,
        description: this.description,
        instructions: this.instructions,
        durationMinutes: this.durationMinutes,
        passingPercentage: this.passingPercentage,
        attemptLimit: this.attemptLimit,
        availableFrom: this.availableFrom?.toISOString(),
        availableUntil: this.availableUntil?.toISOString(),
        shuffleQuestions: this.shuffleQuestions,
        shuffleOptions: this.shuffleOptions,
        showScoreAfterSubmit: this.showScoreAfterSubmit,
        showAnswersAfterSubmit: this.showAnswersAfterSubmit,
        status: this.status,
        version: this.version,
        questionCount: this.questionCount || 0,
        totalMarks: this.totalMarks || 0,
        createdBy: this.createdBy.toString(),
        publishedAt: this.publishedAt?.toISOString(),
        createdAt: this.createdAt.toISOString(),
        updatedAt: this.updatedAt.toISOString(),
    };
};
ExamSchema.methods.toCandidateDto = function (extra) {
    return {
        id: this._id.toString(),
        subjectId: this.subjectId.toString(),
        subjectName: extra.subjectName,
        title: this.title,
        slug: this.slug,
        description: this.description,
        instructions: this.instructions,
        durationMinutes: this.durationMinutes,
        passingPercentage: this.passingPercentage,
        attemptLimit: this.attemptLimit,
        attemptsUsed: extra.attemptsUsed,
        isEligible: extra.isEligible,
        ineligibilityReason: extra.ineligibilityReason,
        activeAttemptId: extra.activeAttemptId,
        availableFrom: this.availableFrom?.toISOString(),
        availableUntil: this.availableUntil?.toISOString(),
        showScoreAfterSubmit: this.showScoreAfterSubmit,
        showAnswersAfterSubmit: this.showAnswersAfterSubmit,
        status: this.status,
        questionCount: this.questionCount || 0,
        totalMarks: this.totalMarks || 0,
    };
};
exports.ExamModel = mongoose_1.default.model("Exam", ExamSchema);
