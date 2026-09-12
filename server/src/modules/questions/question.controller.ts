import { Request, Response, NextFunction } from "express";
import { questionService } from "./question.service.js";
import { sendSuccess } from "../../shared/response.js";

export class QuestionController {
  async getQuestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const questions = await questionService.getQuestionsForExam(req.params.examId);
      sendSuccess(res, questions);
    } catch (error) {
      next(error);
    }
  }

  async createQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const question = await questionService.createQuestion(req.params.examId, req.body);
      sendSuccess(res, question, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await questionService.updateQuestion(req.params.id, req.body);
      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  }

  async deleteQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await questionService.deleteQuestion(req.params.id);
      sendSuccess(res, { message: "Question deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  async duplicateQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const duplicated = await questionService.duplicateQuestion(req.params.id);
      sendSuccess(res, duplicated, 201);
    } catch (error) {
      next(error);
    }
  }

  async reorderQuestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const questions = await questionService.reorderQuestions(req.params.examId, req.body.questionIds);
      sendSuccess(res, questions);
    } catch (error) {
      next(error);
    }
  }

  async bulkCreateQuestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const questions = await questionService.bulkCreateQuestions(req.params.examId, req.body.questions);
      sendSuccess(res, questions, 201);
    } catch (error) {
      next(error);
    }
  }
}

export const questionController = new QuestionController();
