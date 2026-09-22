import { pgTable, text, timestamp, serial, integer, jsonb } from "drizzle-orm/pg-core"
import { news } from "./news"
import { profiles } from "./profiles"

export interface EventBriefSuggestedAngle {
  id: string
  title: string
  rationale: string
}

export interface EventBrief {
  narrative_core: string
  suggested_angles: EventBriefSuggestedAngle[]
}

export const personalStoryMeta = pgTable("personal_story_meta", {
  id: serial("id").primaryKey(),
  newsId: integer("news_id")
    .references(() => news.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  userId: text("user_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  audioUrl: text("audio_url"),
  audioDurationSeconds: integer("audio_duration_seconds"),
  photoUrl: text("photo_url"),
  rawTranscript: text("raw_transcript"),
  eventBrief: jsonb("event_brief").$type<EventBrief>(),
  chosenAngleId: text("chosen_angle_id"),
  status: text("status").default("pending").notNull(),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})
