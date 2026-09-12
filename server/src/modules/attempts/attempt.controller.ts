import { Request, Response, NextFunction } from "express";
import { attemptService } from "./attempt.service.js";
import { sendSuccess } from "../../shared/response.js";

export class AttemptController {
  async startAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const attempt = await attemptService.startOrResumeAttempt(req.params.examId, req.user!.id);
      sendSuccess(res, attempt, 201);
    } catch (error) {
      next(error);
    }
  }

  async getActiveAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const attempt = await attemptService.getActiveAttempt(req.params.attemptId, req.user!.id);
      sendSuccess(res, attempt);
    } catch (error) {
      next(error);
    }
  }

  async saveAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await attemptService.saveAnswer(
        req.params.attemptId,
        req.params.questionId,
        req.body,
        req.user!.id
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async submitAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await attemptService.submitAttempt(req.params.attemptId, req.user!.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getResult(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const review = await attemptService.getResult(req.params.attemptId, req.user!.id);
      sendSuccess(res, review);
    } catch (error) {
      next(error);
    }
  }

  async getCandidateHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const history = await attemptService.getCandidateHistory(req.user!.id);
      sendSuccess(res, history);
    } catch (error) {
      next(error);
    }
  }
}

export const attemptController = new AttemptController();
