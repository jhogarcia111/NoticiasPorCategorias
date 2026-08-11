import { neon } from "@neondatabase/serverless"

const url = process.env.DATABASE_URL
if (!url) {
  console.error("DATABASE_URL no configurada")
  process.exit(1)
}

const sql = neon(url)

const statements = [
  `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_done boolean DEFAULT false NOT NULL;`,
  `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS welcome_seen_at timestamp with time zone;`,
]

try {
  for (const stmt of statements) {
    await sql(stmt)
    console.log("OK:", stmt)
  }
  console.log("Columnas onboarding aplicadas en profiles.")
} catch (err) {
  console.error("Error aplicando migracion:", err.message)
  process.exit(1)
}