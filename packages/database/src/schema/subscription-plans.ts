import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core"

export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  priceInCents: integer("price_in_cents").notNull(),
  currency: text("currency").notNull().default("COP"),
  interval: text("interval").notNull().default("month"),
  trialDays: integer("trial_days").default(0),
  features: text("features").array(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})
