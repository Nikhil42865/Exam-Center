import mongoose, { Schema, Document } from "mongoose";
import { AdminQuestionDto, CandidateQuestionDto, QuestionOptionDto } from "@examcenter/contracts";

export interface IQuestion extends Document {
  examId: mongoose.Types.ObjectId;
  text: string;
  type: "single_choice";
  options: QuestionOptionDto[];
  correctOptionId: string;
  explanation?: string;
  marks: number;
  negativeMarks: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  toAdminDto(): AdminQuestionDto;
  toCandidateDto(): CandidateQuestionDto;
}

const QuestionOptionSchema = new Schema<QuestionOptionDto>(
  {
    id: { type: String, required: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { _id: false }
);

const QuestionSchema = new Schema<IQuestion>(
  {
    examId: {
      type: Schema.Types.ObjectId,
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
        (val: QuestionOptionDto[]) => val.length >= 2 && val.length <= 6,
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

QuestionSchema.index({ examId: 1, order: 1 });

QuestionSchema.methods.toAdminDto = function (): AdminQuestionDto {
  return {
    id: this._id.toString(),
    examId: this.examId.toString(),
    text: this.text,
    type: this.type,
    options: this.options.map((o: QuestionOptionDto) => ({ id: o.id, text: o.text })),
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
QuestionSchema.methods.toCandidateDto = function (): CandidateQuestionDto {
  return {
    id: this._id.toString(),
    examId: this.examId.toString(),
    text: this.text,
    type: this.type,
    options: this.options.map((o: QuestionOptionDto) => ({ id: o.id, text: o.text })),
    marks: this.marks,
    negativeMarks: this.negativeMarks,
    order: this.order,
  };
};

export const QuestionModel = mongoose.model<IQuestion>("Question", QuestionSchema);
