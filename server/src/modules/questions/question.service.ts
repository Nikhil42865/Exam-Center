import { CreateQuestionDto, UpdateQuestionDto, AdminQuestionDto } from "@examcenter/contracts";
import { QuestionModel, IQuestion } from "./question.model.js";
import { ExamModel } from "../exams/exam.model.js";
import { AppError } from "../../shared/errors.js";

export class QuestionService {
  private async updateExamStats(examId: string): Promise<void> {
    const questions = await QuestionModel.find({ examId });
    const questionCount = questions.length;
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

    await ExamModel.findByIdAndUpdate(examId, {
      questionCount,
      totalMarks: Math.round(totalMarks * 100) / 100,
    });
  }

  async getQuestionsForExam(examId: string): Promise<AdminQuestionDto[]> {
    const questions = await QuestionModel.find({ examId }).sort({ order: 1, createdAt: 1 });
    return questions.map((q) => q.toAdminDto());
  }

  async createQuestion(examId: string, data: CreateQuestionDto): Promise<AdminQuestionDto> {
    const exam = await ExamModel.findById(examId);
    if (!exam) {
      throw AppError.notFound("Exam not found");
    }

    if (exam.status !== "draft") {
      throw AppError.badRequest("Cannot add questions to a published or archived exam. Unpublish the exam first.");
    }

    // Determine next order if not provided
    const lastQuestion = await QuestionModel.findOne({ examId }).sort({ order: -1 });
    const order = data.order !== undefined ? data.order : lastQuestion ? lastQuestion.order + 1 : 0;

    const question = await QuestionModel.create({
      examId,
      text: data.text,
      type: "single_choice",
      options: data.options,
      correctOptionId: data.correctOptionId,
      explanation: data.explanation,
      marks: data.marks,
      negativeMarks: data.negativeMarks || 0,
      order,
    });

    await this.updateExamStats(examId);
    return question.toAdminDto();
  }

  async updateQuestion(id: string, data: UpdateQuestionDto): Promise<AdminQuestionDto> {
    const question = await QuestionModel.findById(id);
    if (!question) {
      throw AppError.notFound("Question not found");
    }

    const exam = await ExamModel.findById(question.examId);
    if (!exam) {
      throw AppError.notFound("Associated exam not found");
    }

    if (exam.status !== "draft") {
      throw AppError.badRequest("Cannot edit questions on a published or archived exam");
    }

    if (data.text !== undefined) question.text = data.text;
    if (data.options !== undefined) question.options = data.options;
    if (data.correctOptionId !== undefined) question.correctOptionId = data.correctOptionId;
    if (data.explanation !== undefined) question.explanation = data.explanation;
    if (data.marks !== undefined) question.marks = data.marks;
    if (data.negativeMarks !== undefined) question.negativeMarks = data.negativeMarks;
    if (data.order !== undefined) question.order = data.order;

    await question.save();
    await this.updateExamStats(question.examId.toString());
    return question.toAdminDto();
  }

  async deleteQuestion(id: string): Promise<void> {
    const question = await QuestionModel.findById(id);
    if (!question) {
      throw AppError.notFound("Question not found");
    }

    const exam = await ExamModel.findById(question.examId);
    if (exam && exam.status !== "draft") {
      throw AppError.badRequest("Cannot delete questions from a published or archived exam");
    }

    await QuestionModel.findByIdAndDelete(id);
    if (exam) {
      await this.updateExamStats(exam._id.toString());
    }
  }

  async duplicateQuestion(id: string): Promise<AdminQuestionDto> {
    const source = await QuestionModel.findById(id);
    if (!source) {
      throw AppError.notFound("Question not found");
    }

    const exam = await ExamModel.findById(source.examId);
    if (exam && exam.status !== "draft") {
      throw AppError.badRequest("Cannot duplicate questions in a published exam");
    }

    const lastQuestion = await QuestionModel.findOne({ examId: source.examId }).sort({ order: -1 });
    const newOrder = lastQuestion ? lastQuestion.order + 1 : 0;

    const copy = await QuestionModel.create({
      examId: source.examId,
      text: `${source.text} (Copy)`,
      type: source.type,
      options: source.options.map((o) => ({ id: o.id, text: o.text })),
      correctOptionId: source.correctOptionId,
      explanation: source.explanation,
      marks: source.marks,
      negativeMarks: source.negativeMarks,
      order: newOrder,
    });

    await this.updateExamStats(source.examId.toString());
    return copy.toAdminDto();
  }

  async reorderQuestions(examId: string, questionIds: string[]): Promise<AdminQuestionDto[]> {
    const exam = await ExamModel.findById(examId);
    if (!exam) {
      throw AppError.notFound("Exam not found");
    }

    if (exam.status !== "draft") {
      throw AppError.badRequest("Cannot reorder questions in a published exam");
    }

    const existingQuestions = await QuestionModel.find({ examId });
    const existingIds = new Set(existingQuestions.map((q) => q._id.toString()));

    // FR-QUESTION-05 / Section 13: Question reorder validates the complete set of question IDs in one request
    if (questionIds.length !== existingQuestions.length || !questionIds.every((id) => existingIds.has(id))) {
      throw AppError.badRequest("Invalid question IDs: must match all existing questions for this exam exactly");
    }

    const bulkOps = questionIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order: index } },
      },
    }));

    await QuestionModel.bulkWrite(bulkOps);
    return this.getQuestionsForExam(examId);
  }

  async bulkCreateQuestions(examId: string, questionsData: CreateQuestionDto[]): Promise<AdminQuestionDto[]> {
    const exam = await ExamModel.findById(examId);
    if (!exam) {
      throw AppError.notFound("Exam not found");
    }

    if (exam.status !== "draft") {
      throw AppError.badRequest("Cannot add questions to a published or archived exam. Unpublish the exam first.");
    }

    const lastQuestion = await QuestionModel.findOne({ examId }).sort({ order: -1 });
    let currentOrder = lastQuestion ? lastQuestion.order + 1 : 0;

    const docsToInsert = questionsData.map((data) => ({
      examId,
      text: data.text,
      type: "single_choice" as const,
      options: data.options,
      correctOptionId: data.correctOptionId,
      explanation: data.explanation,
      marks: data.marks,
      negativeMarks: data.negativeMarks || 0,
      order: data.order !== undefined ? data.order : currentOrder++,
    }));

    const created = await QuestionModel.insertMany(docsToInsert);
    await this.updateExamStats(examId);
    return created.map((q) => q.toAdminDto());
  }
}

export const questionService = new QuestionService();
