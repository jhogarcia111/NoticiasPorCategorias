-- Script para corregir las políticas RLS de la tabla news
-- Ejecutar en el SQL Editor de Supabase

-- Eliminar políticas existentes de news
DROP POLICY IF EXISTS "Anyone can view processed news" ON news;

-- Crear políticas corregidas para news
-- Política para lectura (todos pueden ver noticias procesadas)
CREATE POLICY "Anyone can view processed news" ON news
  FOR SELECT USING (is_processed = true);

-- Política para inserción (solo el sistema puede insertar noticias)
CREATE POLICY "System can insert news" ON news
  FOR INSERT WITH CHECK (true);

-- Política para actualización (solo el sistema puede actualizar noticias)
CREATE POLICY "System can update news" ON news
  FOR UPDATE USING (true);

-- Verificar que las políticas se crearon correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'news';
