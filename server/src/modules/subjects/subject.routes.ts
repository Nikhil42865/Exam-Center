import { Router } from "express";
import { subjectController } from "./subject.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/roleGuard.js";
import { validateBody } from "../../middleware/validate.js";
import { createSubjectSchema, updateSubjectSchema } from "@examcenter/contracts";

// Candidate route: /api/v1/subjects
const candidateRouter = Router();
candidateRouter.get("/", (req, res, next) => subjectController.getCandidateSubjects(req, res, next));

export const candidateSubjectRoutes = candidateRouter;

// Admin routes: /api/v1/admin/subjects
const adminRouter = Router();
adminRouter.use(requireAuth, requireRole("admin"));

adminRouter.get("/", (req, res, next) => subjectController.getAdminSubjects(req, res, next));
adminRouter.post("/", validateBody(createSubjectSchema), (req, res, next) => subjectController.createSubject(req, res, next));
adminRouter.patch("/:id", validateBody(updateSubjectSchema), (req, res, next) => subjectController.updateSubject(req, res, next));
adminRouter.delete("/:id", (req, res, next) => subjectController.deleteSubject(req, res, next));

export const adminSubjectRoutes = adminRouter;
