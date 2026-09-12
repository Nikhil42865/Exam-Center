import { Request, Response, NextFunction } from "express";
import { reportsService } from "./reports.service.js";
import { sendSuccess } from "../../shared/response.js";

export class ReportsController {
  async getDashboardMetrics(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const metrics = await reportsService.getDashboardMetrics();
      sendSuccess(res, metrics);
    } catch (error) {
      next(error);
    }
  }

  async getAttempts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const attempts = await reportsService.getAttempts({
        examId: req.query.examId as string,
        status: req.query.status as string,
        passed: req.query.passed !== undefined ? req.query.passed === "true" : undefined,
        search: req.query.search as string,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        skip: req.query.skip ? parseInt(req.query.skip as string, 10) : undefined,
      });
      sendSuccess(res, attempts);
    } catch (error) {
      next(error);
    }
  }

  async getAttemptDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const detail = await reportsService.getAdminAttemptDetail(req.params.attemptId);
      sendSuccess(res, detail);
    } catch (error) {
      next(error);
    }
  }
}

export const reportsController = new ReportsController();
