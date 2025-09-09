-- Script para probar la inserción de noticias
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar que las políticas existen
SELECT 'Current policies:' as info;
SELECT policyname, cmd, permissive, roles, qual 
FROM pg_policies 
WHERE tablename = 'news';

-- 2. Verificar RLS status
SELECT 'RLS status:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'news';

-- 3. Probar inserción directa (esto debería funcionar)
INSERT INTO news (
  category_id, 
  title, 
  summary, 
  content, 
  source_url, 
  source_name, 
  published_at, 
  is_processed
) VALUES (
  1, 
  'Test News Article', 
  'This is a test summary', 
  'This is test content', 
  'https://example.com/test', 
  'Test Source', 
  NOW(), 
  false
) RETURNING id, title;

-- 4. Verificar que se insertó
SELECT 'Inserted news:' as info;
SELECT id, title, source_url, created_at 
FROM news 
WHERE title = 'Test News Article';

-- 5. Limpiar el test
DELETE FROM news WHERE title = 'Test News Article';

-- 6. Verificar categorías disponibles
SELECT 'Available categories:' as info;
SELECT id, name, newsapi_category 
FROM categories 
WHERE is_active = true;
