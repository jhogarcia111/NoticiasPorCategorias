-- Script completo para corregir las políticas RLS de la tabla news
-- Ejecutar en el SQL Editor de Supabase

-- 1. Deshabilitar RLS temporalmente
ALTER TABLE news DISABLE ROW LEVEL SECURITY;

-- 2. Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Anyone can view processed news" ON news;
DROP POLICY IF EXISTS "System can insert news" ON news;
DROP POLICY IF EXISTS "System can update news" ON news;

-- 3. Habilitar RLS nuevamente
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas permisivas para desarrollo
CREATE POLICY "Allow all operations on news" ON news
  FOR ALL USING (true) WITH CHECK (true);

-- 5. Verificar que las categorías existen
SELECT * FROM categories;

-- 6. Si no existen categorías, insertarlas
INSERT INTO categories (name, description, newsapi_category, provider_type, is_active) 
VALUES
('Tecnología', 'Noticias sobre tecnología, startups e innovación', 'technology', 'newsapi', true),
('Negocios', 'Noticias empresariales y financieras', 'business', 'newsapi', true),
('Finanzas', 'Mercados financieros y economía', 'business', 'newsapi', true),
('Salud', 'Noticias sobre salud y medicina', 'health', 'newsapi', true),
('Ciencia', 'Avances científicos y investigación', 'science', 'newsapi', true)
ON CONFLICT (name) DO NOTHING;

-- 7. Verificar políticas creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'news';

-- 8. Verificar categorías
SELECT * FROM categories ORDER BY id;
