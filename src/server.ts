import { ENV } from "@config/env.js";
import app from "./app.js";
import { connectDB } from "@infrastructure/db.js";
import { logger } from "@lib/logger.js";
import { setupGracefulShutdown } from "@config/shutdown.js";

const startServer = async () => {
  await connectDB();

  const server = app.listen(ENV.PORT, () => {
    logger.info(`Server is running at port: ${ENV.PORT}`);
  });

  setupGracefulShutdown(server);
};

startServer();
