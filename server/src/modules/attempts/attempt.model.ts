import mongoose, { Schema, Document } from "mongoose";
import { AttemptStatus, ActiveAttemptDto, ResultSummaryDto, CandidateQuestionDto } from "@examcenter/contracts";

export interface IAttemptSnapshotQuestion {
  questionId: string;
  text: string;
  options: Array<{ id: string; text: string }>;
  correctOptionId: string;
  explanation?: string;
  marks: number;
  negativeMarks: number;
  order: number;
}

export interface IAttemptSnapshot {
  title: string;
  passingPercentage: number;
  durationMinutes: number;
  questions: IAttemptSnapshotQuestion[];
}

export interface IAttemptAnswer {
  questionId: string;
  selectedOptionId?: string;
  isFlagged: boolean;
  savedAt: Date;
}

export interface IAttemptResult {
  score: number;
  maximumMarks: number;
  percentage: number;
  passed: boolean;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
}

export interface IAttempt extends Document {
  examId: mongoose.Types.ObjectId;
  examVersion: number;
  userId: mongoose.Types.ObjectId;
  sequenceNumber: number;
  status: AttemptStatus;
  startedAt: Date;
  expiresAt: Date;
  submittedAt?: Date;
  snapshot: IAttemptSnapshot;
  answers: IAttemptAnswer[];
  result?: IAttemptResult;
  createdAt: Date;
  updatedAt: Date;
  toActiveDto(): ActiveAttemptDto;
  toResultSummaryDto(showAnswersAfterSubmit: boolean): ResultSummaryDto;
}

const AttemptSnapshotQuestionSchema = new Schema<IAttemptSnapshotQuestion>(
  {
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
  },
  { _id: false }
);

const AttemptSnapshotSchema = new Schema<IAttemptSnapshot>(
  {
    title: { type: String, required: true },
    passingPercentage: { type: Number, required: true },
    durationMinutes: { type: Number, required: true },
    questions: [AttemptSnapshotQuestionSchema],
  },
  { _id: false }
);

const AttemptAnswerSchema = new Schema<IAttemptAnswer>(
  {
    questionId: { type: String, required: true },
    selectedOptionId: { type: String },
    isFlagged: { type: Boolean, default: false },
    savedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const AttemptResultSchema = new Schema<IAttemptResult>(
  {
    score: { type: Number, required: true },
    maximumMarks: { type: Number, required: true },
    percentage: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    correctCount: { type: Number, required: true },
    incorrectCount: { type: Number, required: true },
    unansweredCount: { type: Number, required: true },
  },
  { _id: false }
);

const AttemptSchema = new Schema<IAttempt>(
  {
    examId: {
      type: Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
      index: true,
    },
    examVersion: {
      type: Number,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
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
  },
  {
    timestamps: true,
  }
);

// Indexes
AttemptSchema.index({ userId: 1, examId: 1, sequenceNumber: 1 }, { unique: true });
AttemptSchema.index({ examId: 1, status: 1, submittedAt: -1 });

// Critical Security: toActiveDto strictly omits correctOptionId and explanation
AttemptSchema.methods.toActiveDto = function (): ActiveAttemptDto {
  const safeQuestions: CandidateQuestionDto[] = this.snapshot.questions.map((q: IAttemptSnapshotQuestion) => ({
    id: q.questionId,
    examId: this.examId.toString(),
    text: q.text,
    type: "single_choice" as const,
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
    answers: this.answers.map((a: IAttemptAnswer) => ({
      questionId: a.questionId,
      selectedOptionId: a.selectedOptionId,
      isFlagged: a.isFlagged,
      savedAt: a.savedAt?.toISOString(),
    })),
  };
};

AttemptSchema.methods.toResultSummaryDto = function (showAnswersAfterSubmit: boolean): ResultSummaryDto {
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

export const AttemptModel = mongoose.model<IAttempt>("Attempt", AttemptSchema);
