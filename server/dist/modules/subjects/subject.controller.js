"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subjectController = exports.SubjectController = void 0;
const subject_service_js_1 = require("./subject.service.js");
const response_js_1 = require("../../shared/response.js");
class SubjectController {
    async getCandidateSubjects(_req, res, next) {
        try {
            const subjects = await subject_service_js_1.subjectService.getActiveForCandidates();
            (0, response_js_1.sendSuccess)(res, subjects);
        }
        catch (error) {
            next(error);
        }
    }
    async getAdminSubjects(_req, res, next) {
        try {
            const subjects = await subject_service_js_1.subjectService.getAllForAdmin();
            (0, response_js_1.sendSuccess)(res, subjects);
        }
        catch (error) {
            next(error);
        }
    }
    async createSubject(req, res, next) {
        try {
            const created = await subject_service_js_1.subjectService.createSubject(req.body, req.user.id);
            (0, response_js_1.sendSuccess)(res, created, 201);
        }
        catch (error) {
            next(error);
        }
    }
    async updateSubject(req, res, next) {
        try {
            const updated = await subject_service_js_1.subjectService.updateSubject(req.params.id, req.body);
            (0, response_js_1.sendSuccess)(res, updated);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteSubject(req, res, next) {
        try {
            const result = await subject_service_js_1.subjectService.deleteOrDeactivate(req.params.id);
            (0, response_js_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SubjectController = SubjectController;
exports.subjectController = new SubjectController();
