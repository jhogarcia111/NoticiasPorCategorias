-- Tabla para programar publicaciones
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

-- Tabla para configuraciones de programación
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

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_id ON scheduled_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_at ON scheduled_posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_linkedin_profile ON scheduled_posts(linkedin_profile_id);

CREATE INDEX IF NOT EXISTS idx_scheduling_configs_user_id ON scheduling_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduling_configs_linkedin_profile ON scheduling_configs(linkedin_profile_id);

-- RLS (Row Level Security)
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduling_configs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para scheduled_posts
CREATE POLICY "Users can view their own scheduled posts" ON scheduled_posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scheduled posts" ON scheduled_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled posts" ON scheduled_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled posts" ON scheduled_posts
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para scheduling_configs
CREATE POLICY "Users can view their own scheduling configs" ON scheduling_configs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scheduling configs" ON scheduling_configs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduling configs" ON scheduling_configs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduling configs" ON scheduling_configs
  FOR DELETE USING (auth.uid() = user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_scheduled_posts_updated_at 
  BEFORE UPDATE ON scheduled_posts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduling_configs_updated_at 
  BEFORE UPDATE ON scheduling_configs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
