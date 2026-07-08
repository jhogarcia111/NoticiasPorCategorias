import { pgTable, text, timestamp, bigint, serial, boolean, integer } from "drizzle-orm/pg-core"
import { profiles } from "./profiles"

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  rssFeedUrl: text("rss_feed_url"),
  newsapiCategory: text("newsapi_category"),
  providerType: text("provider_type").default("newsapi"),
  apiKeyEncrypted: text("api_key_encrypted"),
  usageCount: integer("usage_count").default(0),
  isActive: boolean("is_active").default(true),
  createdBy: text("created_by").references(() => profiles.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})
