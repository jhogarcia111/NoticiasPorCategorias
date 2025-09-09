-- Script rápido para arreglar la tabla linkedin_profiles
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si la tabla existe y qué columnas tiene
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'linkedin_profiles'
ORDER BY ordinal_position;

-- 2. Agregar columnas faltantes si no existen
ALTER TABLE linkedin_profiles 
ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;

ALTER TABLE linkedin_profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE linkedin_profiles 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

ALTER TABLE linkedin_profiles 
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE linkedin_profiles 
ADD COLUMN IF NOT EXISTS refresh_token TEXT;

-- 3. Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'linkedin_profiles'
ORDER BY ordinal_position;
