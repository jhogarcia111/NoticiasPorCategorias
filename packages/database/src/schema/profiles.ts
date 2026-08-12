import { pgTable, text, timestamp, pgEnum, boolean } from "drizzle-orm/pg-core"

export const roleEnum = pgEnum("role", ["admin", "user", "subscriber"])

export const profiles = pgTable("profiles", {
  id: text("id").primaryKey(),
  username: text("username"),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  role: roleEnum("role").default("user"),
  onboardingDone: boolean("onboarding_done").default(false).notNull(),
  welcomeSeenAt: timestamp("welcome_seen_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})
