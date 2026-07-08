import { pgTable, text, timestamp, serial, jsonb } from "drizzle-orm/pg-core"
import { profiles } from "./profiles"

export const audits = pgTable("audits", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => profiles.id),
  action: text("action").notNull(),
  details: jsonb("details"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})
