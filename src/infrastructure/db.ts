import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg"; // 🟢 Importing from your generated folder with .js ext
import { logger } from "@lib/logger.js";
import { PrismaClient } from "@generated/prisma/client.js";
import { ENV } from "@config/env.js";

// 1. Create a native PostgreSQL connection pool
const pool = new pg.Pool({ connectionString: ENV.DATABASE_URL });

// 2. Wrap it inside the Prisma 7 Adapter
const adapter = new PrismaPg(pool);

// 3. Instantiate the global type-safe query client
export const prisma = new PrismaClient({ adapter });

// 4. Verify connectivity helper
export const connectDB = async (): Promise<void> => {
  try {
    // Run a quick native query to check if the database answers
    await pool.query("SELECT 1");
    logger.info("Database layer successfully initialized via Prisma 7.");
  } catch (error) {
    logger.fatal(
      { err: error },
      "Failed to establish physical connection to the database!",
    );
    process.exit(1);
  }
};
