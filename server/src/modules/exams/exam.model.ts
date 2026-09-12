import mongoose, { Schema, Document } from "mongoose";
import { ExamStatus, ExamDto, CandidateExamDto } from "@examcenter/contracts";

export interface IExam extends Document {
  subjectId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description?: string;
  instructions: string;
  durationMinutes: number;
  passingPercentage: number;
  attemptLimit: number;
  availableFrom?: Date;
  availableUntil?: Date;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showScoreAfterSubmit: boolean;
  showAnswersAfterSubmit: boolean;
  status: ExamStatus;
  version: number;
  questionCount: number;
  totalMarks: number;
  createdBy: mongoose.Types.ObjectId;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  toDto(subjectName?: string): ExamDto;
  toCandidateDto(extra: {
    subjectName?: string;
    attemptsUsed: number;
    isEligible: boolean;
    ineligibilityReason?: string;
    activeAttemptId?: string;
  }): CandidateExamDto;
}

const ExamSchema = new Schema<IExam>(
  {
    subjectId: {
      type: Schema.Types.ObjectId,
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
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete (ret as any)._id;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// Indexes
ExamSchema.index({ subjectId: 1, status: 1, availableFrom: 1, availableUntil: 1 });

ExamSchema.methods.toDto = function (subjectName?: string): ExamDto {
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

ExamSchema.methods.toCandidateDto = function (extra: {
  subjectName?: string;
  attemptsUsed: number;
  isEligible: boolean;
  ineligibilityReason?: string;
  activeAttemptId?: string;
}): CandidateExamDto {
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

export const ExamModel = mongoose.model<IExam>("Exam", ExamSchema);
