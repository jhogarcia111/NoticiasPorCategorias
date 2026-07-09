import { pgTable, text, timestamp, serial, boolean, integer } from "drizzle-orm/pg-core"
import { categories } from "./categories"

export const newsSources = pgTable("news_sources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull().default("rss"),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  language: text("language").default("es"),
  isActive: boolean("is_active").default(true),
  lastFetchedAt: timestamp("last_fetched_at"),
  fetchIntervalMinutes: integer("fetch_interval_minutes").default(60),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})
