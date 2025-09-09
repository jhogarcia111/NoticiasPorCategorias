-- Script para configurar las categorías por defecto
-- Ejecutar en el SQL Editor de Supabase

-- Verificar si las categorías ya existen
SELECT * FROM categories;

-- Si no existen, insertarlas
INSERT INTO categories (name, description, newsapi_category, provider_type, is_active) 
VALUES
('Tecnología', 'Noticias sobre tecnología, startups e innovación', 'technology', 'newsapi', true),
('Negocios', 'Noticias empresariales y financieras', 'business', 'newsapi', true),
('Finanzas', 'Mercados financieros y economía', 'business', 'newsapi', true),
('Salud', 'Noticias sobre salud y medicina', 'health', 'newsapi', true),
('Ciencia', 'Avances científicos y investigación', 'science', 'newsapi', true)
ON CONFLICT (name) DO NOTHING;

-- Verificar que se insertaron correctamente
SELECT * FROM categories ORDER BY id;
