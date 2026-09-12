"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionController = exports.QuestionController = void 0;
const question_service_js_1 = require("./question.service.js");
const response_js_1 = require("../../shared/response.js");
class QuestionController {
    async getQuestions(req, res, next) {
        try {
            const questions = await question_service_js_1.questionService.getQuestionsForExam(req.params.examId);
            (0, response_js_1.sendSuccess)(res, questions);
        }
        catch (error) {
            next(error);
        }
    }
    async createQuestion(req, res, next) {
        try {
            const question = await question_service_js_1.questionService.createQuestion(req.params.examId, req.body);
            (0, response_js_1.sendSuccess)(res, question, 201);
        }
        catch (error) {
            next(error);
        }
    }
    async updateQuestion(req, res, next) {
        try {
            const updated = await question_service_js_1.questionService.updateQuestion(req.params.id, req.body);
            (0, response_js_1.sendSuccess)(res, updated);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteQuestion(req, res, next) {
        try {
            await question_service_js_1.questionService.deleteQuestion(req.params.id);
            (0, response_js_1.sendSuccess)(res, { message: "Question deleted successfully" });
        }
        catch (error) {
            next(error);
        }
    }
    async duplicateQuestion(req, res, next) {
        try {
            const duplicated = await question_service_js_1.questionService.duplicateQuestion(req.params.id);
            (0, response_js_1.sendSuccess)(res, duplicated, 201);
        }
        catch (error) {
            next(error);
        }
    }
    async reorderQuestions(req, res, next) {
        try {
            const questions = await question_service_js_1.questionService.reorderQuestions(req.params.examId, req.body.questionIds);
            (0, response_js_1.sendSuccess)(res, questions);
        }
        catch (error) {
            next(error);
        }
    }
    async bulkCreateQuestions(req, res, next) {
        try {
            const questions = await question_service_js_1.questionService.bulkCreateQuestions(req.params.examId, req.body.questions);
            (0, response_js_1.sendSuccess)(res, questions, 201);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.QuestionController = QuestionController;
exports.questionController = new QuestionController();
