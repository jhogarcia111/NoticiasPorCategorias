import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core"

export const roleEnum = pgEnum("role", ["admin", "user"])

export const profiles = pgTable("profiles", {
  id: text("id").primaryKey(),
  username: text("username"),
  avatarUrl: text("avatar_url"),
  role: roleEnum("role").default("user"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})
