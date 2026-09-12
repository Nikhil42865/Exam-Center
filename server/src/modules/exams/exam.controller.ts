import { Request, Response, NextFunction } from "express";
import { examService } from "./exam.service.js";
import { sendSuccess } from "../../shared/response.js";

export class ExamController {
  async getCandidateExams(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const exams = await examService.getCandidateExams(req.user!.id, {
        subjectId: req.query.subjectId as string,
        search: req.query.search as string,
      });
      sendSuccess(res, exams);
    } catch (error) {
      next(error);
    }
  }

  async getCandidateExamDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const exam = await examService.getCandidateExamDetails(req.params.id, req.user!.id);
      sendSuccess(res, exam);
    } catch (error) {
      next(error);
    }
  }

  async getAdminExams(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const exams = await examService.getAdminExams({
        status: req.query.status as string,
        subjectId: req.query.subjectId as string,
        search: req.query.search as string,
      });
      sendSuccess(res, exams);
    } catch (error) {
      next(error);
    }
  }

  async getAdminExamById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const exam = await examService.getAdminExamById(req.params.id);
      sendSuccess(res, exam);
    } catch (error) {
      next(error);
    }
  }

  async createExam(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const exam = await examService.createExam(req.body, req.user!.id);
      sendSuccess(res, exam, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateExam(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await examService.updateExam(req.params.id, req.body);
      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  }

  async publishExam(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const published = await examService.publishExam(req.params.id);
      sendSuccess(res, published);
    } catch (error) {
      next(error);
    }
  }

  async unpublishExam(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const unpublished = await examService.unpublishExam(req.params.id);
      sendSuccess(res, unpublished);
    } catch (error) {
      next(error);
    }
  }

  async archiveExam(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const archived = await examService.archiveExam(req.params.id);
      sendSuccess(res, archived);
    } catch (error) {
      next(error);
    }
  }

  async getAdminPreview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const preview = await examService.getAdminPreview(req.params.id);
      sendSuccess(res, preview);
    } catch (error) {
      next(error);
    }
  }
}

export const examController = new ExamController();
