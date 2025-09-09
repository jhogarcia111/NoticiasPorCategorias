-- Script urgente para arreglar la tabla linkedin_profiles
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si la tabla existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'linkedin_profiles';

-- 2. Si la tabla no existe, crearla completa
CREATE TABLE IF NOT EXISTS linkedin_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Información del perfil de LinkedIn
  linkedin_id TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  profile_picture_url TEXT,
  
  -- Tokens de autenticación
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Configuración del perfil
  is_active BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Agregar columnas faltantes si la tabla ya existe
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

-- 4. Habilitar RLS
ALTER TABLE linkedin_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view their own LinkedIn profiles" ON linkedin_profiles;
DROP POLICY IF EXISTS "Users can insert their own LinkedIn profiles" ON linkedin_profiles;
DROP POLICY IF EXISTS "Users can update their own LinkedIn profiles" ON linkedin_profiles;
DROP POLICY IF EXISTS "Users can delete their own LinkedIn profiles" ON linkedin_profiles;

-- 6. Crear políticas RLS
CREATE POLICY "Users can view their own LinkedIn profiles" ON linkedin_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own LinkedIn profiles" ON linkedin_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own LinkedIn profiles" ON linkedin_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own LinkedIn profiles" ON linkedin_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- 7. Verificar que todo está correcto
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'linkedin_profiles'
ORDER BY ordinal_position;
