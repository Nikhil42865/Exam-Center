"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.examController = exports.ExamController = void 0;
const exam_service_js_1 = require("./exam.service.js");
const response_js_1 = require("../../shared/response.js");
class ExamController {
    async getCandidateExams(req, res, next) {
        try {
            const exams = await exam_service_js_1.examService.getCandidateExams(req.user.id, {
                subjectId: req.query.subjectId,
                search: req.query.search,
            });
            (0, response_js_1.sendSuccess)(res, exams);
        }
        catch (error) {
            next(error);
        }
    }
    async getCandidateExamDetails(req, res, next) {
        try {
            const exam = await exam_service_js_1.examService.getCandidateExamDetails(req.params.id, req.user.id);
            (0, response_js_1.sendSuccess)(res, exam);
        }
        catch (error) {
            next(error);
        }
    }
    async getAdminExams(req, res, next) {
        try {
            const exams = await exam_service_js_1.examService.getAdminExams({
                status: req.query.status,
                subjectId: req.query.subjectId,
                search: req.query.search,
            });
            (0, response_js_1.sendSuccess)(res, exams);
        }
        catch (error) {
            next(error);
        }
    }
    async getAdminExamById(req, res, next) {
        try {
            const exam = await exam_service_js_1.examService.getAdminExamById(req.params.id);
            (0, response_js_1.sendSuccess)(res, exam);
        }
        catch (error) {
            next(error);
        }
    }
    async createExam(req, res, next) {
        try {
            const exam = await exam_service_js_1.examService.createExam(req.body, req.user.id);
            (0, response_js_1.sendSuccess)(res, exam, 201);
        }
        catch (error) {
            next(error);
        }
    }
    async updateExam(req, res, next) {
        try {
            const updated = await exam_service_js_1.examService.updateExam(req.params.id, req.body);
            (0, response_js_1.sendSuccess)(res, updated);
        }
        catch (error) {
            next(error);
        }
    }
    async publishExam(req, res, next) {
        try {
            const published = await exam_service_js_1.examService.publishExam(req.params.id);
            (0, response_js_1.sendSuccess)(res, published);
        }
        catch (error) {
            next(error);
        }
    }
    async unpublishExam(req, res, next) {
        try {
            const unpublished = await exam_service_js_1.examService.unpublishExam(req.params.id);
            (0, response_js_1.sendSuccess)(res, unpublished);
        }
        catch (error) {
            next(error);
        }
    }
    async archiveExam(req, res, next) {
        try {
            const archived = await exam_service_js_1.examService.archiveExam(req.params.id);
            (0, response_js_1.sendSuccess)(res, archived);
        }
        catch (error) {
            next(error);
        }
    }
    async getAdminPreview(req, res, next) {
        try {
            const preview = await exam_service_js_1.examService.getAdminPreview(req.params.id);
            (0, response_js_1.sendSuccess)(res, preview);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ExamController = ExamController;
exports.examController = new ExamController();
