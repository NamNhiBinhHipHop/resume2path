// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",            // <- use dialect, not driver
  dbCredentials: {
    url: process.env.POSTGRES_URL!, // or DATABASE_URL if that’s what you use
  },
});