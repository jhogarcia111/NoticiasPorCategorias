-- Script para deshabilitar temporalmente RLS y permitir acceso
-- Ejecutar en el SQL Editor de Supabase

-- Deshabilitar RLS temporalmente en la tabla profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS está deshabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

-- Crear una política muy permisiva temporalmente
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política temporal que permite todo (SOLO PARA DESARROLLO)
CREATE POLICY "temp_allow_all" ON profiles
  FOR ALL USING (true) WITH CHECK (true);

-- Verificar las políticas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';
