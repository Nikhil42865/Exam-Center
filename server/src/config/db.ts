import mongoose from "mongoose";
import { config } from "./index.js";
import { logger } from "../shared/logger.js";

export async function connectDatabase(): Promise<typeof mongoose> {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI, {
      autoIndex: true,
    });
    logger.info(`✅ MongoDB Connected to database: ${conn.connection.name} on ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error({ err: error }, "❌ MongoDB connection error:");
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  logger.info("MongoDB disconnected");
}
