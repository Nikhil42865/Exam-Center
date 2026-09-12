import { createApp } from "./app.js";
import { config } from "./config/index.js";
import { connectDatabase } from "./config/db.js";
import { logger } from "./shared/logger.js";

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const app = createApp();

  const server = app.listen(config.PORT, () => {
    logger.info(`🚀 ExamCenter API Server running at http://localhost:${config.PORT}/api/v1 (env: ${config.NODE_ENV})`);
  });

  const gracefulShutdown = (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      logger.info("HTTP server closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}

bootstrap().catch((err) => {
  logger.error({ err }, "Fatal application error during bootstrap:");
  process.exit(1);
});
