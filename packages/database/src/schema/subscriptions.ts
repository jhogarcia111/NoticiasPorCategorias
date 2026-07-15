import { pgTable, serial, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core"
import { profiles } from "./profiles"
import { subscriptionPlans } from "./subscription-plans"

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "canceled",
  "past_due",
  "incomplete",
  "trialing",
  "pending",
  "expired",
])

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  planId: integer("plan_id")
    .notNull()
    .references(() => subscriptionPlans.id),
  status: subscriptionStatusEnum("status").notNull().default("pending"),
  wompiPaymentSourceId: text("wompi_payment_source_id"),
  wompiCustomerId: text("wompi_customer_id"),
  currentPeriodStart: timestamp("current_period_start", { withTimezone: true }).defaultNow().notNull(),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),
  canceledAt: timestamp("canceled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})
