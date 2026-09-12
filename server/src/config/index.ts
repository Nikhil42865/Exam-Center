import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

// Load from server directory or project root
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().default("mongodb://127.0.0.1:27017/examcenter"),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
  JWT_ACCESS_SECRET: z.string().min(16).default("super-secret-examcenter-access-key-minimum-32-chars-length"),
  JWT_REFRESH_SECRET: z.string().min(16).default("super-secret-examcenter-refresh-key-minimum-32-chars-length"),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL: z.string().default("7d"),
  LOG_LEVEL: z.string().default("info"),
  ADMIN_INITIAL_EMAIL: z.string().email().default("admin@examcenter.internal"),
  ADMIN_INITIAL_PASSWORD: z.string().min(8).default("AdminPassword123!"),
  ADMIN_INITIAL_NAME: z.string().default("System Administrator"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.format());
  process.exit(1);
}

export const config = parsedEnv.data;
