import { Request, Response, NextFunction } from "express";
import { subjectService } from "./subject.service.js";
import { sendSuccess } from "../../shared/response.js";

export class SubjectController {
  async getCandidateSubjects(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const subjects = await subjectService.getActiveForCandidates();
      sendSuccess(res, subjects);
    } catch (error) {
      next(error);
    }
  }

  async getAdminSubjects(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const subjects = await subjectService.getAllForAdmin();
      sendSuccess(res, subjects);
    } catch (error) {
      next(error);
    }
  }

  async createSubject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const created = await subjectService.createSubject(req.body, req.user!.id);
      sendSuccess(res, created, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateSubject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await subjectService.updateSubject(req.params.id, req.body);
      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  }

  async deleteSubject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await subjectService.deleteOrDeactivate(req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const subjectController = new SubjectController();
