-- Agregar columnas para soporte multiidioma en la tabla news
ALTER TABLE news 
ADD COLUMN IF NOT EXISTS summary_es TEXT,
ADD COLUMN IF NOT EXISTS summary_en TEXT,
ADD COLUMN IF NOT EXISTS content_es TEXT,
ADD COLUMN IF NOT EXISTS content_en TEXT,
ADD COLUMN IF NOT EXISTS hashtags_es TEXT[],
ADD COLUMN IF NOT EXISTS hashtags_en TEXT[],
ADD COLUMN IF NOT EXISTS image_prompt_es TEXT,
ADD COLUMN IF NOT EXISTS image_prompt_en TEXT;

-- Migrar datos existentes
-- Si ya existe summary, copiarlo a summary_es
UPDATE news 
SET summary_es = summary 
WHERE summary IS NOT NULL AND summary_es IS NULL;

-- Si ya existe content, copiarlo a content_es
UPDATE news 
SET content_es = content 
WHERE content IS NOT NULL AND content_es IS NULL;

-- Nota: Las columnas hashtags e image_prompt no existen en la tabla actual
-- Se crearán nuevas con las columnas _es y _en

-- Crear índices para las nuevas columnas
CREATE INDEX IF NOT EXISTS idx_news_summary_es ON news USING gin(to_tsvector('spanish', summary_es));
CREATE INDEX IF NOT EXISTS idx_news_summary_en ON news USING gin(to_tsvector('english', summary_en));
CREATE INDEX IF NOT EXISTS idx_news_content_es ON news USING gin(to_tsvector('spanish', content_es));
CREATE INDEX IF NOT EXISTS idx_news_content_en ON news USING gin(to_tsvector('english', content_en));

-- Función para obtener el contenido en el idioma especificado
CREATE OR REPLACE FUNCTION get_news_content(news_item news, lang text DEFAULT 'es')
RETURNS jsonb AS $$
BEGIN
  RETURN jsonb_build_object(
    'summary', CASE 
      WHEN lang = 'en' AND news_item.summary_en IS NOT NULL THEN news_item.summary_en
      ELSE news_item.summary_es
    END,
    'content', CASE 
      WHEN lang = 'en' AND news_item.content_en IS NOT NULL THEN news_item.content_en
      ELSE news_item.content_es
    END,
    'hashtags', CASE 
      WHEN lang = 'en' AND news_item.hashtags_en IS NOT NULL THEN news_item.hashtags_en
      ELSE news_item.hashtags_es
    END,
    'image_prompt', CASE 
      WHEN lang = 'en' AND news_item.image_prompt_en IS NOT NULL THEN news_item.image_prompt_en
      ELSE news_item.image_prompt_es
    END
  );
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar contenido en un idioma específico
CREATE OR REPLACE FUNCTION update_news_language_content(
  news_id uuid,
  lang text,
  summary_text text DEFAULT NULL,
  content_text text DEFAULT NULL,
  hashtags_array text[] DEFAULT NULL,
  image_prompt_text text DEFAULT NULL
)
RETURNS boolean AS $$
BEGIN
  IF lang = 'en' THEN
    UPDATE news SET
      summary_en = COALESCE(summary_text, summary_en),
      content_en = COALESCE(content_text, content_en),
      hashtags_en = COALESCE(hashtags_array, hashtags_en),
      image_prompt_en = COALESCE(image_prompt_text, image_prompt_en),
      updated_at = NOW()
    WHERE id = news_id;
  ELSE
    UPDATE news SET
      summary_es = COALESCE(summary_text, summary_es),
      content_es = COALESCE(content_text, content_es),
      hashtags_es = COALESCE(hashtags_array, hashtags_es),
      image_prompt_es = COALESCE(image_prompt_text, image_prompt_es),
      updated_at = NOW()
    WHERE id = news_id;
  END IF;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Vista para facilitar consultas con idioma
CREATE OR REPLACE VIEW news_with_language AS
SELECT 
  n.*,
  get_news_content(n, 'es') as content_es_json,
  get_news_content(n, 'en') as content_en_json
FROM news n;

-- Comentarios para documentar las nuevas columnas
COMMENT ON COLUMN news.summary_es IS 'Resumen de la noticia en español';
COMMENT ON COLUMN news.summary_en IS 'Resumen de la noticia en inglés';
COMMENT ON COLUMN news.content_es IS 'Contenido para LinkedIn en español';
COMMENT ON COLUMN news.content_en IS 'Contenido para LinkedIn en inglés';
COMMENT ON COLUMN news.hashtags_es IS 'Hashtags en español';
COMMENT ON COLUMN news.hashtags_en IS 'Hashtags en inglés';
COMMENT ON COLUMN news.image_prompt_es IS 'Prompt para imagen en español';
COMMENT ON COLUMN news.image_prompt_en IS 'Prompt para imagen en inglés';
