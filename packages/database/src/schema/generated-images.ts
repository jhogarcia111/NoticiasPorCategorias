import { pgTable, text, timestamp, serial, integer } from "drizzle-orm/pg-core"
import { profiles } from "./profiles"

export const generatedImages = pgTable("generated_images", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  promptUsed: text("prompt_used"),
  newsTitle: text("news_title"),
  newsId: integer("news_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})
