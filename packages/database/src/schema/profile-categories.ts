import { pgTable, timestamp, serial, unique } from "drizzle-orm/pg-core"
import { linkedinProfiles } from "./linkedin-profiles"
import { categories } from "./categories"

export const profileCategories = pgTable("profile_categories", {
  id: serial("id").primaryKey(),
  profileId: serial("profile_id").references(() => linkedinProfiles.id, { onDelete: "cascade" }),
  categoryId: serial("category_id").references(() => categories.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  unique().on(t.profileId, t.categoryId),
])
