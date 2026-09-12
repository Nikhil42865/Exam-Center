"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminSubjectRoutes = exports.candidateSubjectRoutes = void 0;
const express_1 = require("express");
const subject_controller_js_1 = require("./subject.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const roleGuard_js_1 = require("../../middleware/roleGuard.js");
const validate_js_1 = require("../../middleware/validate.js");
const contracts_1 = require("@examcenter/contracts");
// Candidate route: /api/v1/subjects
const candidateRouter = (0, express_1.Router)();
candidateRouter.get("/", (req, res, next) => subject_controller_js_1.subjectController.getCandidateSubjects(req, res, next));
exports.candidateSubjectRoutes = candidateRouter;
// Admin routes: /api/v1/admin/subjects
const adminRouter = (0, express_1.Router)();
adminRouter.use(auth_js_1.requireAuth, (0, roleGuard_js_1.requireRole)("admin"));
adminRouter.get("/", (req, res, next) => subject_controller_js_1.subjectController.getAdminSubjects(req, res, next));
adminRouter.post("/", (0, validate_js_1.validateBody)(contracts_1.createSubjectSchema), (req, res, next) => subject_controller_js_1.subjectController.createSubject(req, res, next));
adminRouter.patch("/:id", (0, validate_js_1.validateBody)(contracts_1.updateSubjectSchema), (req, res, next) => subject_controller_js_1.subjectController.updateSubject(req, res, next));
adminRouter.delete("/:id", (req, res, next) => subject_controller_js_1.subjectController.deleteSubject(req, res, next));
exports.adminSubjectRoutes = adminRouter;
