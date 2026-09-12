import { Router } from "express";
import { attemptController } from "./attempt.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";
import { saveAnswerSchema } from "@examcenter/contracts";

const router = Router();
router.use(requireAuth);

// Candidate attempt history: GET /api/v1/attempts
router.get("/", (req, res, next) => attemptController.getCandidateHistory(req, res, next));

// Candidate active attempt & submit
router.get("/:attemptId", (req, res, next) => attemptController.getActiveAttempt(req, res, next));
router.put("/:attemptId/answers/:questionId", validateBody(saveAnswerSchema), (req, res, next) =>
  attemptController.saveAnswer(req, res, next)
);
router.post("/:attemptId/submit", (req, res, next) => attemptController.submitAttempt(req, res, next));
router.get("/:attemptId/result", (req, res, next) => attemptController.getResult(req, res, next));

export const attemptRoutes = router;

// Start attempt route: POST /api/v1/exams/:examId/attempts
const startAttemptRouter = Router({ mergeParams: true });
startAttemptRouter.use(requireAuth);
startAttemptRouter.post("/", (req, res, next) => attemptController.startAttempt(req, res, next));

export const startAttemptRoutes = startAttemptRouter;
