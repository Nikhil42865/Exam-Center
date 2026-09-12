"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminExamQuestionsRoutes = exports.adminQuestionDirectRoutes = void 0;
const express_1 = require("express");
const question_controller_js_1 = require("./question.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const roleGuard_js_1 = require("../../middleware/roleGuard.js");
const validate_js_1 = require("../../middleware/validate.js");
const contracts_1 = require("@examcenter/contracts");
const router = (0, express_1.Router)({ mergeParams: true });
router.use(auth_js_1.requireAuth, (0, roleGuard_js_1.requireRole)("admin"));
// /api/v1/admin/questions routes
router.patch("/:id", (0, validate_js_1.validateBody)(contracts_1.updateQuestionSchema), (req, res, next) => question_controller_js_1.questionController.updateQuestion(req, res, next));
router.delete("/:id", (req, res, next) => question_controller_js_1.questionController.deleteQuestion(req, res, next));
router.post("/:id/duplicate", (req, res, next) => question_controller_js_1.questionController.duplicateQuestion(req, res, next));
exports.adminQuestionDirectRoutes = router;
// Nested routes for /api/v1/admin/exams/:examId/questions
const nestedRouter = (0, express_1.Router)({ mergeParams: true });
nestedRouter.use(auth_js_1.requireAuth, (0, roleGuard_js_1.requireRole)("admin"));
nestedRouter.get("/", (req, res, next) => question_controller_js_1.questionController.getQuestions(req, res, next));
nestedRouter.post("/", (0, validate_js_1.validateBody)(contracts_1.createQuestionSchema), (req, res, next) => question_controller_js_1.questionController.createQuestion(req, res, next));
nestedRouter.post("/bulk", (0, validate_js_1.validateBody)(contracts_1.bulkCreateQuestionsSchema), (req, res, next) => question_controller_js_1.questionController.bulkCreateQuestions(req, res, next));
nestedRouter.put("/order", (0, validate_js_1.validateBody)(contracts_1.reorderQuestionsSchema), (req, res, next) => question_controller_js_1.questionController.reorderQuestions(req, res, next));
exports.adminExamQuestionsRoutes = nestedRouter;
