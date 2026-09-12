"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminExamAttemptsRoutes = exports.adminReportRoutes = void 0;
const express_1 = require("express");
const reports_controller_js_1 = require("./reports.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const roleGuard_js_1 = require("../../middleware/roleGuard.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.requireAuth, (0, roleGuard_js_1.requireRole)("admin"));
router.get("/dashboard", (req, res, next) => reports_controller_js_1.reportsController.getDashboardMetrics(req, res, next));
router.get("/attempts", (req, res, next) => reports_controller_js_1.reportsController.getAttempts(req, res, next));
router.get("/attempts/:attemptId", (req, res, next) => reports_controller_js_1.reportsController.getAttemptDetail(req, res, next));
exports.adminReportRoutes = router;
// Exam-specific attempts endpoint: GET /api/v1/admin/exams/:id/attempts
const examAttemptsRouter = (0, express_1.Router)({ mergeParams: true });
examAttemptsRouter.use(auth_js_1.requireAuth, (0, roleGuard_js_1.requireRole)("admin"));
examAttemptsRouter.get("/:id/attempts", (req, res, next) => {
    req.query.examId = req.params.id;
    reports_controller_js_1.reportsController.getAttempts(req, res, next);
});
exports.adminExamAttemptsRoutes = examAttemptsRouter;
