-- Adds source_type column to news table for the content source providers module.
-- Values: NEWS (default, current module), SCIENTIFIC, PATENT, CUSTOM_URL
ALTER TABLE news ADD COLUMN IF NOT EXISTS source_type text DEFAULT 'NEWS';