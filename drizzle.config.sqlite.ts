import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./drizzle/schema.sqlite.ts",
  out: "./drizzle/migrations-sqlite",
  dialect: "sqlite",
  dbCredentials: {
    url: "./data/proposta-viagem.db",
  },
});
