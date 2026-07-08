import { pgTable, text, timestamp, serial, pgEnum } from "drizzle-orm/pg-core"
import { linkedinProfiles } from "./linkedin-profiles"

export const postStatusEnum = pgEnum("post_status", ["pending", "published", "failed", "retrying", "scheduled", "cancelled"])

export const scheduledPosts = pgTable("scheduled_posts", {
  id: serial("id").primaryKey(),
  profileId: serial("profile_id").references(() => linkedinProfiles.id).notNull(),
  userId: text("user_id"),
  linkedinProfileId: serial("linkedin_profile_id").references(() => linkedinProfiles.id, { onDelete: "cascade" }),
  postContent: text("post_content"),
  title: text("title"),
  content: text("content"),
  summary: text("summary"),
  hashtags: text("hashtags").array(),
  imageUrl: text("image_url"),
  scheduledTime: timestamp("scheduled_time", { withTimezone: true }).notNull(),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  timezone: text("timezone").default("America/Mexico_City"),
  status: postStatusEnum("status").default("pending"),
  postedAt: timestamp("posted_at", { withTimezone: true }),
  linkedinPostId: text("linkedin_post_id"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})
