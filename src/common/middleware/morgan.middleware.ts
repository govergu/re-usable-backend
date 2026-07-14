import morgan from "morgan";
import { StreamOptions } from "morgan";
import { logger } from "@lib/logger.js";
import { ENV } from "@config/env.js";

// 1. Choose format based on environment
const morganFormat = ENV.NODE_ENV === "production" ? "combined" : "dev";

// 2. Direct the stream output straight into your Pino logger instance
const stream: StreamOptions = {
  write: (message: string) => logger.info(message.trim()),
};

// 3. Export the fully configured middleware
export const morganMiddleware = morgan(morganFormat, { stream });
