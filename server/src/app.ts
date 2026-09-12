import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { config } from "./config/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { sendSuccess } from "./shared/response.js";
import { AppError } from "./shared/errors.js";

// Routes
import { authRoutes, userRoutesConfig } from "./modules/auth/auth.routes.js";
import { candidateSubjectRoutes, adminSubjectRoutes } from "./modules/subjects/subject.routes.js";
import { candidateExamRoutes, adminExamRoutes } from "./modules/exams/exam.routes.js";
import { adminExamQuestionsRoutes, adminQuestionDirectRoutes } from "./modules/questions/question.routes.js";
import { attemptRoutes, startAttemptRoutes } from "./modules/attempts/attempt.routes.js";
import { adminReportRoutes, adminExamAttemptsRoutes } from "./modules/reports/reports.routes.js";

export function createApp(): Express {
  const app = express();

  // Request ID middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const reqId = (req.headers["x-request-id"] as string) || `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    res.setHeader("x-request-id", reqId);
    req.headers["x-request-id"] = reqId;
    next();
  });

  // Security Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  // CORS Configuration
  app.use(
    cors({
      origin: [config.CLIENT_ORIGIN, "http://localhost:5173", "http://127.0.0.1:5173"],
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "x-request-id"],
    })
  );

  // Parsers
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(cookieParser());

  // Health Endpoint
  app.get("/api/v1/health", (_req: Request, res: Response) => {
    sendSuccess(res, {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.NODE_ENV,
    });
  });

  // Mount API v1 Routes
  const apiRouter = express.Router();

  // Auth & Profile
  apiRouter.use("/auth", authRoutes);
  apiRouter.use("/users", userRoutesConfig);

  // Candidate
  apiRouter.use("/subjects", candidateSubjectRoutes);
  apiRouter.use("/exams", candidateExamRoutes);
  apiRouter.use("/exams/:examId/attempts", startAttemptRoutes);
  apiRouter.use("/attempts", attemptRoutes);

  // Admin
  apiRouter.use("/admin/subjects", adminSubjectRoutes);
  apiRouter.use("/admin/exams", adminExamRoutes);
  apiRouter.use("/admin/exams/:examId/questions", adminExamQuestionsRoutes);
  apiRouter.use("/admin/exams", adminExamAttemptsRoutes);
  apiRouter.use("/admin/questions", adminQuestionDirectRoutes);
  apiRouter.use("/admin", adminReportRoutes);

  app.use("/api/v1", apiRouter);

  // 404 Handler
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
