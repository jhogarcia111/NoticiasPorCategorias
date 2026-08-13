import { pgTable, text, timestamp, serial, integer, doublePrecision, jsonb, uniqueIndex } from "drizzle-orm/pg-core"
import { profiles } from "./profiles"
import { linkedinProfiles } from "./linkedin-profiles"
import { scheduledPosts } from "./scheduled-posts"

export const profileBaselines = pgTable("profile_baselines", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  linkedinProfileId: serial("linkedin_profile_id").references(() => linkedinProfiles.id, { onDelete: "cascade" }).notNull(),
  initialFollowersCount: integer("initial_followers_count").default(0),
  initialConnectionsCount: integer("initial_connections_count").default(0),
  initialProfileViews: integer("initial_profile_views").default(0),
  reachBaseline: integer("reach_baseline").default(0),
  source: text("source").default("manual").notNull(),
  snapshotDate: timestamp("snapshot_date", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("profile_baselines_profile_unique").on(table.linkedinProfileId),
])

export const postMetricsHistory = pgTable("post_metrics_history", {
  id: serial("id").primaryKey(),
  scheduledPostId: serial("scheduled_post_id").references(() => scheduledPosts.id, { onDelete: "cascade" }).notNull(),
  userId: text("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  linkedinProfileId: serial("linkedin_profile_id").references(() => linkedinProfiles.id, { onDelete: "cascade" }),
  linkedinPostId: text("linkedin_post_id"),
  snapshotDay: integer("snapshot_day").default(0),
  metricsDate: timestamp("metrics_date", { withTimezone: true }).defaultNow().notNull(),
  impressionCount: integer("impression_count").default(0),
  likeCount: integer("like_count").default(0),
  commentCount: integer("comment_count").default(0),
  shareCount: integer("share_count").default(0),
  engagementRate: doublePrecision("engagement_rate").default(0),
  source: text("source").default("unavailable").notNull(),
  rawPayload: jsonb("raw_payload"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("post_metrics_snapshot_unique").on(table.scheduledPostId, table.snapshotDay),
])

export const overallAnalytics = pgTable("overall_analytics", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  linkedinProfileId: serial("linkedin_profile_id").references(() => linkedinProfiles.id, { onDelete: "cascade" }).notNull(),
  weekStart: timestamp("week_start", { withTimezone: true }).notNull(),
  followersCount: integer("followers_count").default(0),
  connectionsCount: integer("connections_count").default(0),
  totalImpressions: integer("total_impressions").default(0),
  totalReactions: integer("total_reactions").default(0),
  totalComments: integer("total_comments").default(0),
  totalShares: integer("total_shares").default(0),
  totalPosts: integer("total_posts").default(0),
  netFollowerGain: integer("net_follower_gain").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("overall_analytics_week_unique").on(table.userId, table.linkedinProfileId, table.weekStart),
])