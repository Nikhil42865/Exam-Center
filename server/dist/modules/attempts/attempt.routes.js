"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAttemptRoutes = exports.attemptRoutes = void 0;
const express_1 = require("express");
const attempt_controller_js_1 = require("./attempt.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const validate_js_1 = require("../../middleware/validate.js");
const contracts_1 = require("@examcenter/contracts");
const router = (0, express_1.Router)();
router.use(auth_js_1.requireAuth);
// Candidate attempt history: GET /api/v1/attempts
router.get("/", (req, res, next) => attempt_controller_js_1.attemptController.getCandidateHistory(req, res, next));
// Candidate active attempt & submit
router.get("/:attemptId", (req, res, next) => attempt_controller_js_1.attemptController.getActiveAttempt(req, res, next));
router.put("/:attemptId/answers/:questionId", (0, validate_js_1.validateBody)(contracts_1.saveAnswerSchema), (req, res, next) => attempt_controller_js_1.attemptController.saveAnswer(req, res, next));
router.post("/:attemptId/submit", (req, res, next) => attempt_controller_js_1.attemptController.submitAttempt(req, res, next));
router.get("/:attemptId/result", (req, res, next) => attempt_controller_js_1.attemptController.getResult(req, res, next));
exports.attemptRoutes = router;
// Start attempt route: POST /api/v1/exams/:examId/attempts
const startAttemptRouter = (0, express_1.Router)({ mergeParams: true });
startAttemptRouter.use(auth_js_1.requireAuth);
startAttemptRouter.post("/", (req, res, next) => attempt_controller_js_1.attemptController.startAttempt(req, res, next));
exports.startAttemptRoutes = startAttemptRouter;
