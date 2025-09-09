-- Script corregido para LinkedIn y Sistema de Programación
-- Ejecutar en Supabase SQL Editor

-- 1. Primero, verificar si las tablas ya existen y sus tipos
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('linkedin_profiles', 'scheduled_posts', 'scheduling_configs')
ORDER BY table_name, ordinal_position;

-- 2. Eliminar tablas existentes si es necesario (CUIDADO: esto borrará datos)
-- DROP TABLE IF EXISTS scheduling_configs CASCADE;
-- DROP TABLE IF EXISTS scheduled_posts CASCADE;
-- DROP TABLE IF EXISTS linkedin_profiles CASCADE;

-- 3. Crear tabla de perfiles de LinkedIn (asegurándose de usar UUID)
CREATE TABLE IF NOT EXISTS linkedin_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Información del perfil de LinkedIn
  linkedin_id TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  profile_picture_url TEXT,
  
  -- Tokens de autenticación (encriptados)
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

-- 4. Crear tabla para programar publicaciones
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  linkedin_profile_id UUID REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
  news_id UUID REFERENCES news(id) ON DELETE CASCADE,
  
  -- Contenido del post
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  hashtags TEXT[],
  image_url TEXT,
  
  -- Programación
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone TEXT DEFAULT 'America/Mexico_City',
  
  -- Estado
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'failed', 'cancelled')),
  published_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Crear tabla para configuraciones de programación
CREATE TABLE IF NOT EXISTS scheduling_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  linkedin_profile_id UUID REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
  
  -- Configuración de horarios
  enabled BOOLEAN DEFAULT true,
  timezone TEXT DEFAULT 'America/Mexico_City',
  
  -- Horarios de publicación
  monday_enabled BOOLEAN DEFAULT true,
  monday_start_time TIME DEFAULT '09:00',
  monday_end_time TIME DEFAULT '17:00',
  monday_posts_count INTEGER DEFAULT 3,
  
  tuesday_enabled BOOLEAN DEFAULT true,
  tuesday_start_time TIME DEFAULT '09:00',
  tuesday_end_time TIME DEFAULT '17:00',
  tuesday_posts_count INTEGER DEFAULT 3,
  
  wednesday_enabled BOOLEAN DEFAULT true,
  wednesday_start_time TIME DEFAULT '09:00',
  wednesday_end_time TIME DEFAULT '17:00',
  wednesday_posts_count INTEGER DEFAULT 3,
  
  thursday_enabled BOOLEAN DEFAULT true,
  thursday_start_time TIME DEFAULT '09:00',
  thursday_end_time TIME DEFAULT '17:00',
  thursday_posts_count INTEGER DEFAULT 3,
  
  friday_enabled BOOLEAN DEFAULT true,
  friday_start_time TIME DEFAULT '09:00',
  friday_end_time TIME DEFAULT '17:00',
  friday_posts_count INTEGER DEFAULT 3,
  
  saturday_enabled BOOLEAN DEFAULT false,
  saturday_start_time TIME DEFAULT '10:00',
  saturday_end_time TIME DEFAULT '14:00',
  saturday_posts_count INTEGER DEFAULT 1,
  
  sunday_enabled BOOLEAN DEFAULT false,
  sunday_start_time TIME DEFAULT '10:00',
  sunday_end_time TIME DEFAULT '14:00',
  sunday_posts_count INTEGER DEFAULT 1,
  
  -- Configuración de contenido
  auto_generate_content BOOLEAN DEFAULT true,
  include_hashtags BOOLEAN DEFAULT true,
  include_summary BOOLEAN DEFAULT true,
  include_image BOOLEAN DEFAULT true,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, linkedin_profile_id)
);

-- 6. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_linkedin_profiles_user_id ON linkedin_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_profiles_linkedin_id ON linkedin_profiles(linkedin_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_profiles_is_active ON linkedin_profiles(is_active);

CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_id ON scheduled_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_at ON scheduled_posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_linkedin_profile ON scheduled_posts(linkedin_profile_id);

CREATE INDEX IF NOT EXISTS idx_scheduling_configs_user_id ON scheduling_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduling_configs_linkedin_profile ON scheduling_configs(linkedin_profile_id);

-- 7. Habilitar RLS (Row Level Security)
ALTER TABLE linkedin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduling_configs ENABLE ROW LEVEL SECURITY;

-- 8. Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view their own LinkedIn profiles" ON linkedin_profiles;
DROP POLICY IF EXISTS "Users can insert their own LinkedIn profiles" ON linkedin_profiles;
DROP POLICY IF EXISTS "Users can update their own LinkedIn profiles" ON linkedin_profiles;
DROP POLICY IF EXISTS "Users can delete their own LinkedIn profiles" ON linkedin_profiles;

DROP POLICY IF EXISTS "Users can view their own scheduled posts" ON scheduled_posts;
DROP POLICY IF EXISTS "Users can insert their own scheduled posts" ON scheduled_posts;
DROP POLICY IF EXISTS "Users can update their own scheduled posts" ON scheduled_posts;
DROP POLICY IF EXISTS "Users can delete their own scheduled posts" ON scheduled_posts;

DROP POLICY IF EXISTS "Users can view their own scheduling configs" ON scheduling_configs;
DROP POLICY IF EXISTS "Users can insert their own scheduling configs" ON scheduling_configs;
DROP POLICY IF EXISTS "Users can update their own scheduling configs" ON scheduling_configs;
DROP POLICY IF EXISTS "Users can delete their own scheduling configs" ON scheduling_configs;

-- 9. Crear políticas RLS para linkedin_profiles
CREATE POLICY "Users can view their own LinkedIn profiles" ON linkedin_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own LinkedIn profiles" ON linkedin_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own LinkedIn profiles" ON linkedin_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own LinkedIn profiles" ON linkedin_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- 10. Crear políticas RLS para scheduled_posts
CREATE POLICY "Users can view their own scheduled posts" ON scheduled_posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scheduled posts" ON scheduled_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled posts" ON scheduled_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled posts" ON scheduled_posts
  FOR DELETE USING (auth.uid() = user_id);

-- 11. Crear políticas RLS para scheduling_configs
CREATE POLICY "Users can view their own scheduling configs" ON scheduling_configs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scheduling configs" ON scheduling_configs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduling configs" ON scheduling_configs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduling configs" ON scheduling_configs
  FOR DELETE USING (auth.uid() = user_id);

-- 12. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 13. Eliminar triggers existentes si existen
DROP TRIGGER IF EXISTS update_linkedin_profiles_updated_at ON linkedin_profiles;
DROP TRIGGER IF EXISTS update_scheduled_posts_updated_at ON scheduled_posts;
DROP TRIGGER IF EXISTS update_scheduling_configs_updated_at ON scheduling_configs;

-- 14. Crear triggers para updated_at
CREATE TRIGGER update_linkedin_profiles_updated_at 
  BEFORE UPDATE ON linkedin_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_posts_updated_at 
  BEFORE UPDATE ON scheduled_posts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduling_configs_updated_at 
  BEFORE UPDATE ON scheduling_configs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 15. Comentarios para documentación
COMMENT ON TABLE linkedin_profiles IS 'Perfiles de LinkedIn conectados por los usuarios';
COMMENT ON TABLE scheduled_posts IS 'Posts programados para publicación automática';
COMMENT ON TABLE scheduling_configs IS 'Configuraciones de programación por perfil de LinkedIn';

-- 16. Verificar que las tablas se crearon correctamente
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('linkedin_profiles', 'scheduled_posts', 'scheduling_configs')
ORDER BY table_name;

-- 17. Verificar tipos de columnas
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('linkedin_profiles', 'scheduled_posts', 'scheduling_configs')
  AND column_name IN ('id', 'user_id', 'linkedin_profile_id', 'news_id')
ORDER BY table_name, column_name;
