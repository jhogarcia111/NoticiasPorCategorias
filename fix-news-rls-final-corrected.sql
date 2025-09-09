-- Script final corregido para solucionar RLS de news
-- Ejecutar en el SQL Editor de Supabase

-- 1. Eliminar TODAS las políticas existentes de news
DROP POLICY IF EXISTS "Anyone can view processed news" ON news;
DROP POLICY IF EXISTS "System can insert news" ON news;
DROP POLICY IF EXISTS "System can update news" ON news;
DROP POLICY IF EXISTS "Allow all operations on news" ON news;
DROP POLICY IF EXISTS "temp_allow_all" ON news;
DROP POLICY IF EXISTS "news_policy" ON news;

-- 2. Deshabilitar RLS temporalmente
ALTER TABLE news DISABLE ROW LEVEL SECURITY;

-- 3. Habilitar RLS nuevamente
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- 4. Crear una política simple y permisiva
CREATE POLICY "news_policy" ON news
  FOR ALL USING (true) WITH CHECK (true);

-- 5. Verificar estructura de la tabla categories
SELECT 'Categories table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'categories' 
ORDER BY ordinal_position;

-- 6. Verificar si existen categorías
SELECT 'Existing categories:' as info;
SELECT * FROM categories;

-- 7. Insertar categorías solo si no existen (sin ON CONFLICT)
INSERT INTO categories (name, description, newsapi_category, provider_type, is_active) 
SELECT 'Tecnología', 'Noticias sobre tecnología, startups e innovación', 'technology', 'newsapi', true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Tecnología');

INSERT INTO categories (name, description, newsapi_category, provider_type, is_active) 
SELECT 'Negocios', 'Noticias empresariales y financieras', 'business', 'newsapi', true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Negocios');

INSERT INTO categories (name, description, newsapi_category, provider_type, is_active) 
SELECT 'Finanzas', 'Mercados financieros y economía', 'business', 'newsapi', true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Finanzas');

INSERT INTO categories (name, description, newsapi_category, provider_type, is_active) 
SELECT 'Salud', 'Noticias sobre salud y medicina', 'health', 'newsapi', true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Salud');

INSERT INTO categories (name, description, newsapi_category, provider_type, is_active) 
SELECT 'Ciencia', 'Avances científicos y investigación', 'science', 'newsapi', true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Ciencia');

-- 8. Verificar políticas creadas
SELECT 'Policies check:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'news';

-- 9. Verificar categorías finales
SELECT 'Final categories:' as info;
SELECT * FROM categories ORDER BY id;

-- 10. Verificar RLS status
SELECT 'RLS status:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'news';

-- 11. Verificar permisos del usuario actual
SELECT 'User permissions:' as info;
SELECT current_user, session_user;
SELECT has_table_privilege(current_user, 'news', 'INSERT') as can_insert;
SELECT has_table_privilege(current_user, 'news', 'SELECT') as can_select;
