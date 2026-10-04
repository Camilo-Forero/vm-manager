import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./DB/Migrations",
  dbCredentials: {
    url: "./DB/database.sqlite",
  },
});
