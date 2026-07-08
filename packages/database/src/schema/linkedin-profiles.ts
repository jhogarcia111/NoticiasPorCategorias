import { pgTable, text, timestamp, serial, boolean } from "drizzle-orm/pg-core"
import { profiles } from "./profiles"

export const linkedinProfiles = pgTable("linkedin_profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => profiles.id).notNull(),
  profileName: text("profile_name"),
  linkedinId: text("linkedin_id").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  profilePictureUrl: text("profile_picture_url"),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
  profileType: text("profile_type").default("personal"),
  isActive: boolean("is_active").default(true),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})
