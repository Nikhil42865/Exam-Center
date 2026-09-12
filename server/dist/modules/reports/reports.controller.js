"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsController = exports.ReportsController = void 0;
const reports_service_js_1 = require("./reports.service.js");
const response_js_1 = require("../../shared/response.js");
class ReportsController {
    async getDashboardMetrics(_req, res, next) {
        try {
            const metrics = await reports_service_js_1.reportsService.getDashboardMetrics();
            (0, response_js_1.sendSuccess)(res, metrics);
        }
        catch (error) {
            next(error);
        }
    }
    async getAttempts(req, res, next) {
        try {
            const attempts = await reports_service_js_1.reportsService.getAttempts({
                examId: req.query.examId,
                status: req.query.status,
                passed: req.query.passed !== undefined ? req.query.passed === "true" : undefined,
                search: req.query.search,
                limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
                skip: req.query.skip ? parseInt(req.query.skip, 10) : undefined,
            });
            (0, response_js_1.sendSuccess)(res, attempts);
        }
        catch (error) {
            next(error);
        }
    }
    async getAttemptDetail(req, res, next) {
        try {
            const detail = await reports_service_js_1.reportsService.getAdminAttemptDetail(req.params.attemptId);
            (0, response_js_1.sendSuccess)(res, detail);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ReportsController = ReportsController;
exports.reportsController = new ReportsController();
