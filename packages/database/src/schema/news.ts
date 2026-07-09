import { pgTable, text, timestamp, serial, boolean, jsonb } from "drizzle-orm/pg-core"
import { categories } from "./categories"

export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  categoryId: serial("category_id").references(() => categories.id).notNull(),
  title: text("title").notNull(),
  summary: text("summary"),
  aiSummary: text("ai_summary"),
  content: text("content"),
  sourceUrl: text("source_url").notNull(),
  imageUrl: text("image_url"),
  aiImageUrl: text("ai_image_url"),
  sourceName: text("source_name"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  language: text("language").default("es"),
  isProcessed: boolean("is_processed").default(false),
  aiResults: jsonb("ai_results").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})
