"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminExamRoutes = exports.candidateExamRoutes = void 0;
const express_1 = require("express");
const exam_controller_js_1 = require("./exam.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const roleGuard_js_1 = require("../../middleware/roleGuard.js");
const validate_js_1 = require("../../middleware/validate.js");
const contracts_1 = require("@examcenter/contracts");
// Candidate routes: /api/v1/exams
const candidateRouter = (0, express_1.Router)();
candidateRouter.use(auth_js_1.requireAuth);
candidateRouter.get("/", (req, res, next) => exam_controller_js_1.examController.getCandidateExams(req, res, next));
candidateRouter.get("/:id", (req, res, next) => exam_controller_js_1.examController.getCandidateExamDetails(req, res, next));
exports.candidateExamRoutes = candidateRouter;
// Admin routes: /api/v1/admin/exams
const adminRouter = (0, express_1.Router)();
adminRouter.use(auth_js_1.requireAuth, (0, roleGuard_js_1.requireRole)("admin"));
adminRouter.get("/", (req, res, next) => exam_controller_js_1.examController.getAdminExams(req, res, next));
adminRouter.post("/", (0, validate_js_1.validateBody)(contracts_1.createExamSchema), (req, res, next) => exam_controller_js_1.examController.createExam(req, res, next));
adminRouter.get("/:id", (req, res, next) => exam_controller_js_1.examController.getAdminExamById(req, res, next));
adminRouter.patch("/:id", (0, validate_js_1.validateBody)(contracts_1.updateExamSchema), (req, res, next) => exam_controller_js_1.examController.updateExam(req, res, next));
adminRouter.post("/:id/publish", (req, res, next) => exam_controller_js_1.examController.publishExam(req, res, next));
adminRouter.post("/:id/unpublish", (req, res, next) => exam_controller_js_1.examController.unpublishExam(req, res, next));
adminRouter.post("/:id/archive", (req, res, next) => exam_controller_js_1.examController.archiveExam(req, res, next));
adminRouter.get("/:id/preview", (req, res, next) => exam_controller_js_1.examController.getAdminPreview(req, res, next));
exports.adminExamRoutes = adminRouter;
