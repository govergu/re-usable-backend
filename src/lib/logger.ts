import pino from "pino";
import { ENV } from "@config/env.js"; // Assuming you have your environment variables typed here

const isDevelopment = ENV.NODE_ENV === "development";

export const logger = pino({
  level: ENV.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
  // Production requires raw JSON for CloudWatch/Datadog. Development gets pretty text formatting.
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
          ignore: "pid,hostname",
        },
      }
    : undefined,
});
