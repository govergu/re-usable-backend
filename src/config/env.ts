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
