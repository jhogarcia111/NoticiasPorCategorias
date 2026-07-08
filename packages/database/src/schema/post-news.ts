import { pgTable, timestamp, serial, integer } from "drizzle-orm/pg-core"
import { scheduledPosts } from "./scheduled-posts"
import { news } from "./news"

export const postNews = pgTable("post_news", {
  id: serial("id").primaryKey(),
  postId: serial("post_id").references(() => scheduledPosts.id, { onDelete: "cascade" }),
  newsId: serial("news_id").references(() => news.id, { onDelete: "cascade" }),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})
