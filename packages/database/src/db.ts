import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

let _db: ReturnType<typeof drizzle> | null = null

function getDb() {
  if (!_db) {
    const url = process.env.DATABASE_URL
    if (!url) {
      throw new Error("DATABASE_URL environment variable is not set")
    }
    const sql = neon(url)
    _db = drizzle(sql, { schema })
  }
  return _db
}

export { getDb }
export type DB = ReturnType<typeof drizzle>
