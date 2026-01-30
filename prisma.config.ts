// Prisma configuration for 24FIT
import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

// Load from .env.local for local development
const dotenv = require("dotenv");
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

export default defineConfig({
  schema: path.join(__dirname, "prisma/schema.prisma"),
  migrations: {
    path: path.join(__dirname, "prisma/migrations"),
  },
  datasource: {
    url: process.env.DATABASE_URL || "",
  },
});
