"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = require("./app.js");
const index_js_1 = require("./config/index.js");
const db_js_1 = require("./config/db.js");
const logger_js_1 = require("./shared/logger.js");
async function bootstrap() {
    await (0, db_js_1.connectDatabase)();
    const app = (0, app_js_1.createApp)();
    const server = app.listen(index_js_1.config.PORT, () => {
        logger_js_1.logger.info(`🚀 ExamCenter API Server running at http://localhost:${index_js_1.config.PORT}/api/v1 (env: ${index_js_1.config.NODE_ENV})`);
    });
    const gracefulShutdown = (signal) => {
        logger_js_1.logger.info(`Received ${signal}. Shutting down gracefully...`);
        server.close(() => {
            logger_js_1.logger.info("HTTP server closed.");
            process.exit(0);
        });
    };
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}
bootstrap().catch((err) => {
    logger_js_1.logger.error({ err }, "Fatal application error during bootstrap:");
    process.exit(1);
});
