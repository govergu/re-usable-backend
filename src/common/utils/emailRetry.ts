import { logger } from "@lib/logger.js";

interface RetryOptions {
  retries?: number;
  delay?: number; // Initial delay in ms
  factor?: number; // Multiplier for exponential backoff
}

export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> => {
  const { retries = 3, delay = 1000, factor = 2 } = options;
  let currentDelay = delay;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === retries) {
        throw error; // Max retries reached, bubble up the error
      }

      logger.warn(
        `Attempt ${attempt} failed. Retrying in ${currentDelay}ms...`,
      );
      //   console.warn(
      //     `Attempt ${attempt} failed. Retrying in ${currentDelay}ms...`,
      //   );
      await new Promise((resolve) => setTimeout(resolve, currentDelay));
      currentDelay *= factor; // Increase waiting time exponentially
    }
  }

  throw new Error("Retry loop ended unexpectedly");
};
