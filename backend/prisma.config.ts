// Prisma configuration
// In production with Neon, DIRECT_URL connects directly to Postgres for migrations,
// while DATABASE_URL connects via the pooled connection at runtime.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});


