"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attemptController = exports.AttemptController = void 0;
const attempt_service_js_1 = require("./attempt.service.js");
const response_js_1 = require("../../shared/response.js");
class AttemptController {
    async startAttempt(req, res, next) {
        try {
            const attempt = await attempt_service_js_1.attemptService.startOrResumeAttempt(req.params.examId, req.user.id);
            (0, response_js_1.sendSuccess)(res, attempt, 201);
        }
        catch (error) {
            next(error);
        }
    }
    async getActiveAttempt(req, res, next) {
        try {
            const attempt = await attempt_service_js_1.attemptService.getActiveAttempt(req.params.attemptId, req.user.id);
            (0, response_js_1.sendSuccess)(res, attempt);
        }
        catch (error) {
            next(error);
        }
    }
    async saveAnswer(req, res, next) {
        try {
            const result = await attempt_service_js_1.attemptService.saveAnswer(req.params.attemptId, req.params.questionId, req.body, req.user.id);
            (0, response_js_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async submitAttempt(req, res, next) {
        try {
            const result = await attempt_service_js_1.attemptService.submitAttempt(req.params.attemptId, req.user.id);
            (0, response_js_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getResult(req, res, next) {
        try {
            const review = await attempt_service_js_1.attemptService.getResult(req.params.attemptId, req.user.id);
            (0, response_js_1.sendSuccess)(res, review);
        }
        catch (error) {
            next(error);
        }
    }
    async getCandidateHistory(req, res, next) {
        try {
            const history = await attempt_service_js_1.attemptService.getCandidateHistory(req.user.id);
            (0, response_js_1.sendSuccess)(res, history);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AttemptController = AttemptController;
exports.attemptController = new AttemptController();
