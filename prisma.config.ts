/**
 * Prisma v7+ configuration file.
 * This is now the canonical place where Prisma CLI (migrate/generate/studio)
 * reads:
 * - where your schema file is
 * - how to connect to your database (via env vars)
 *
 * IMPORTANT:
 * - This is used by the Prisma CLI.
 * - Prisma Client (runtime) will still read DATABASE_URL from environment
 *   unless you do something special at PrismaClient constructor time.
 */

import "dotenv/config"; // Ensures .env is loaded when Prisma CLI runs
import { defineConfig, env } from "@prisma/config";

export default defineConfig({
  // Points Prisma CLI to your schema location
  schema: "prisma/schema.prisma",

  // Defines the database connection URL for CLI operations (migrate, generate, etc.)
  datasource: {
    url: env("DIRECT_URL"),
  },
});
