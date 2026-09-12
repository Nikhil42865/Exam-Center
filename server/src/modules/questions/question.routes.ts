import { Router } from "express";
import { questionController } from "./question.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/roleGuard.js";
import { validateBody } from "../../middleware/validate.js";
import { createQuestionSchema, updateQuestionSchema, reorderQuestionsSchema, bulkCreateQuestionsSchema } from "@examcenter/contracts";

const router = Router({ mergeParams: true });
router.use(requireAuth, requireRole("admin"));

// /api/v1/admin/questions routes
router.patch("/:id", validateBody(updateQuestionSchema), (req, res, next) => questionController.updateQuestion(req, res, next));
router.delete("/:id", (req, res, next) => questionController.deleteQuestion(req, res, next));
router.post("/:id/duplicate", (req, res, next) => questionController.duplicateQuestion(req, res, next));

export const adminQuestionDirectRoutes = router;

// Nested routes for /api/v1/admin/exams/:examId/questions
const nestedRouter = Router({ mergeParams: true });
nestedRouter.use(requireAuth, requireRole("admin"));

nestedRouter.get("/", (req, res, next) => questionController.getQuestions(req, res, next));
nestedRouter.post("/", validateBody(createQuestionSchema), (req, res, next) => questionController.createQuestion(req, res, next));
nestedRouter.post("/bulk", validateBody(bulkCreateQuestionsSchema), (req, res, next) => questionController.bulkCreateQuestions(req, res, next));
nestedRouter.put("/order", validateBody(reorderQuestionsSchema), (req, res, next) => questionController.reorderQuestions(req, res, next));

export const adminExamQuestionsRoutes = nestedRouter;
