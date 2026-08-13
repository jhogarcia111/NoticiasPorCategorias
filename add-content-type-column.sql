-- Adds content_type column to scheduled_posts table for the "what to publish today" picker.
-- Values: linkedin-post (default), social, blog, video
ALTER TABLE scheduled_posts ADD COLUMN IF NOT EXISTS content_type text DEFAULT 'linkedin-post';