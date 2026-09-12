"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const index_js_1 = require("./config/index.js");
const errorHandler_js_1 = require("./middleware/errorHandler.js");
const response_js_1 = require("./shared/response.js");
const errors_js_1 = require("./shared/errors.js");
// Routes
const auth_routes_js_1 = require("./modules/auth/auth.routes.js");
const subject_routes_js_1 = require("./modules/subjects/subject.routes.js");
const exam_routes_js_1 = require("./modules/exams/exam.routes.js");
const question_routes_js_1 = require("./modules/questions/question.routes.js");
const attempt_routes_js_1 = require("./modules/attempts/attempt.routes.js");
const reports_routes_js_1 = require("./modules/reports/reports.routes.js");
function createApp() {
    const app = (0, express_1.default)();
    // Request ID middleware
    app.use((req, res, next) => {
        const reqId = req.headers["x-request-id"] || `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        res.setHeader("x-request-id", reqId);
        req.headers["x-request-id"] = reqId;
        next();
    });
    // Security Headers
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: { policy: "cross-origin" },
    }));
    // CORS Configuration
    app.use((0, cors_1.default)({
        origin: [index_js_1.config.CLIENT_ORIGIN, "http://localhost:5173", "http://127.0.0.1:5173"],
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "x-request-id"],
    }));
    // Parsers
    app.use(express_1.default.json({ limit: "1mb" }));
    app.use(express_1.default.urlencoded({ extended: true, limit: "1mb" }));
    app.use((0, cookie_parser_1.default)());
    // Health Endpoint
    app.get("/api/v1/health", (_req, res) => {
        (0, response_js_1.sendSuccess)(res, {
            status: "ok",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: index_js_1.config.NODE_ENV,
        });
    });
    // Mount API v1 Routes
    const apiRouter = express_1.default.Router();
    // Auth & Profile
    apiRouter.use("/auth", auth_routes_js_1.authRoutes);
    apiRouter.use("/users", auth_routes_js_1.userRoutesConfig);
    // Candidate
    apiRouter.use("/subjects", subject_routes_js_1.candidateSubjectRoutes);
    apiRouter.use("/exams", exam_routes_js_1.candidateExamRoutes);
    apiRouter.use("/exams/:examId/attempts", attempt_routes_js_1.startAttemptRoutes);
    apiRouter.use("/attempts", attempt_routes_js_1.attemptRoutes);
    // Admin
    apiRouter.use("/admin/subjects", subject_routes_js_1.adminSubjectRoutes);
    apiRouter.use("/admin/exams", exam_routes_js_1.adminExamRoutes);
    apiRouter.use("/admin/exams/:examId/questions", question_routes_js_1.adminExamQuestionsRoutes);
    apiRouter.use("/admin/exams", reports_routes_js_1.adminExamAttemptsRoutes);
    apiRouter.use("/admin/questions", question_routes_js_1.adminQuestionDirectRoutes);
    apiRouter.use("/admin", reports_routes_js_1.adminReportRoutes);
    app.use("/api/v1", apiRouter);
    // 404 Handler
    app.use((req, _res, next) => {
        next(errors_js_1.AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
    });
    // Centralized Error Handler
    app.use(errorHandler_js_1.errorHandler);
    return app;
}
