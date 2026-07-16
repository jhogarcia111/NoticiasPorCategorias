import { pgTable, text, timestamp, serial, integer, jsonb } from "drizzle-orm/pg-core"
import { news } from "./news"

export const newsAiResults = pgTable("news_ai_results", {
  id: serial("id").primaryKey(),
  newsId: integer("news_id").references(() => news.id, { onDelete: "cascade" }).notNull(),
  templateId: text("template_id").default("default"),
  templateName: text("template_name"),
  language: text("language").default("es"),
  summary: text("summary"),
  linkedinPost: text("linkedin_post"),
  hashtags: text("hashtags").array(),
  imagePrompt: text("image_prompt"),
  fullResponse: text("full_response"),
  headlines: text("headlines"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})
