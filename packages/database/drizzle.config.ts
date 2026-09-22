import { defineConfig } from "drizzle-kit"
import fs from "node:fs"
import path from "node:path"

if (!process.env.DATABASE_URL) {
  const rootEnv = path.resolve(process.cwd(), "../../.env")
  const webEnv = path.resolve(process.cwd(), "../../apps/web/.env")
  const localEnv = path.resolve(process.cwd(), ".env")
  if (fs.existsSync(localEnv)) {
    process.loadEnvFile(localEnv)
  } else if (fs.existsSync(rootEnv)) {
    process.loadEnvFile(rootEnv)
  } else if (fs.existsSync(webEnv)) {
    process.loadEnvFile(webEnv)
  }
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  tablesFilter: [
    "personal_story_meta",
  ],
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
})
