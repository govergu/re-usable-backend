import dotenv from "dotenv";
import { z } from "zod";

// load raw env configs
dotenv.config();

// zod validation
const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug"])
    .default("info"),
  DATABASE_URL: z.url({
    message: "DATABASE_URL must be a valid connection string string",
  }),

  JWT_ACCESS_SECRET: z.string().min(8, {
    message: "JWT_ACCESS_SECRET must be at least 8 characters long",
  }),
  JWT_ACCESS_EXPIRES: z.string().default("15m"),

  JWT_REFRESH_SECRET: z.string().min(8, {
    message: "JWT_REFRESH_SECRET must be at least 8 characters long",
  }),
  JWT_REFRESH_EXPIRES: z.string().default("7d"),

  COOKIE_EXPIRES_DAYS: z.coerce.number().min(1).default(7),

  EMAIL_USER: z.email({ message: "EMAIL_USER must be a valid email address" }),
  EMAIL_PASS: z.string().min(1, { message: "EMAIL_PASS cannot be empty" }),
  EMAIL_FROM: z.string({ message: "EMAIL_FROM must be a valid email address" }),

  FRONTEND_URL: z.url({ message: "FRONTEND_URL must be a valid URL string" }),
});

// safe parsing the env configs
const parsedEnv = envSchema.safeParse(process.env);

// error handling the validation process
if (!parsedEnv.success) {
  console.error("Invalid environment configurations:");
  console.error(JSON.stringify(parsedEnv.error.format(), null, 2));
  process.exit(1); // Stop the server execution immediately
}

// export validated env configs
export const ENV = parsedEnv.data;

// typescript easiness
export type EnvType = z.infer<typeof envSchema>;
