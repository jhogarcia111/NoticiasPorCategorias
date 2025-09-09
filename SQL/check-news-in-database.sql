-- Script para verificar noticias en la base de datos
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar que la tabla news existe y tiene datos
SELECT 'News table check:' as info;
SELECT COUNT(*) as total_news FROM news;

-- 2. Ver noticias recientes
SELECT 'Recent news:' as info;
SELECT 
  id, 
  title, 
  source_name, 
  is_processed, 
  created_at,
  category_id
FROM news 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Ver noticias por categoría
SELECT 'News by category:' as info;
SELECT 
  c.name as category_name,
  COUNT(n.id) as news_count
FROM categories c
LEFT JOIN news n ON c.id = n.category_id
GROUP BY c.id, c.name
ORDER BY news_count DESC;

-- 4. Ver noticias no procesadas
SELECT 'Unprocessed news:' as info;
SELECT 
  id, 
  title, 
  source_name, 
  created_at
FROM news 
WHERE is_processed = false
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Verificar políticas RLS
SELECT 'RLS policies for news:' as info;
SELECT policyname, cmd, permissive, roles, qual 
FROM pg_policies 
WHERE tablename = 'news';

-- 6. Verificar permisos del usuario actual
SELECT 'Current user permissions:' as info;
SELECT current_user, session_user;
SELECT has_table_privilege(current_user, 'news', 'SELECT') as can_select;
SELECT has_table_privilege(current_user, 'news', 'INSERT') as can_insert;
