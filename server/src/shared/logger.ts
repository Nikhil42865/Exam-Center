import pino from "pino";
import { config } from "../config/index.js";

export const logger = pino({
  level: config.LOG_LEVEL || "info",
  transport:
    config.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            ignore: "pid,hostname",
            translateTime: "SYS:standard",
          },
        }
      : undefined,
});
