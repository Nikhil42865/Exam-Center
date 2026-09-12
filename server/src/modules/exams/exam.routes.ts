import { Router } from "express";
import { examController } from "./exam.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/roleGuard.js";
import { validateBody } from "../../middleware/validate.js";
import { createExamSchema, updateExamSchema } from "@examcenter/contracts";

// Candidate routes: /api/v1/exams
const candidateRouter = Router();
candidateRouter.use(requireAuth);

candidateRouter.get("/", (req, res, next) => examController.getCandidateExams(req, res, next));
candidateRouter.get("/:id", (req, res, next) => examController.getCandidateExamDetails(req, res, next));

export const candidateExamRoutes = candidateRouter;

// Admin routes: /api/v1/admin/exams
const adminRouter = Router();
adminRouter.use(requireAuth, requireRole("admin"));

adminRouter.get("/", (req, res, next) => examController.getAdminExams(req, res, next));
adminRouter.post("/", validateBody(createExamSchema), (req, res, next) => examController.createExam(req, res, next));
adminRouter.get("/:id", (req, res, next) => examController.getAdminExamById(req, res, next));
adminRouter.patch("/:id", validateBody(updateExamSchema), (req, res, next) => examController.updateExam(req, res, next));
adminRouter.post("/:id/publish", (req, res, next) => examController.publishExam(req, res, next));
adminRouter.post("/:id/unpublish", (req, res, next) => examController.unpublishExam(req, res, next));
adminRouter.post("/:id/archive", (req, res, next) => examController.archiveExam(req, res, next));
adminRouter.get("/:id/preview", (req, res, next) => examController.getAdminPreview(req, res, next));

export const adminExamRoutes = adminRouter;
