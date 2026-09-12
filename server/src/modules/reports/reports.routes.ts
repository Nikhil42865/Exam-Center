import { Router } from "express";
import { reportsController } from "./reports.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/roleGuard.js";

const router = Router();
router.use(requireAuth, requireRole("admin"));

router.get("/dashboard", (req, res, next) => reportsController.getDashboardMetrics(req, res, next));
router.get("/attempts", (req, res, next) => reportsController.getAttempts(req, res, next));
router.get("/attempts/:attemptId", (req, res, next) => reportsController.getAttemptDetail(req, res, next));

export const adminReportRoutes = router;

// Exam-specific attempts endpoint: GET /api/v1/admin/exams/:id/attempts
const examAttemptsRouter = Router({ mergeParams: true });
examAttemptsRouter.use(requireAuth, requireRole("admin"));
examAttemptsRouter.get("/:id/attempts", (req, res, next) => {
  req.query.examId = req.params.id;
  reportsController.getAttempts(req, res, next);
});

export const adminExamAttemptsRoutes = examAttemptsRouter;
