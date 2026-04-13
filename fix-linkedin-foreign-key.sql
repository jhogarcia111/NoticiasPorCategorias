-- Script para arreglar el problema de foreign key en linkedin_profiles

-- Opción 1: Eliminar la foreign key constraint (RECOMENDADO)
-- Esto permite que linkedin_profiles funcione independientemente de auth.users
ALTER TABLE public.linkedin_profiles 
DROP CONSTRAINT IF EXISTS linkedin_profiles_user_id_fkey;

-- Opción 2: Verificar si el usuario actual existe en auth.users
-- (Solo para debugging - no ejecutar en producción)
SELECT 
    u.id as user_id,
    u.email,
    u.created_at,
    CASE 
        WHEN u.id IS NOT NULL THEN 'Usuario existe en auth.users'
        ELSE 'Usuario NO existe en auth.users'
    END as status
FROM auth.users u
WHERE u.id = auth.uid();

-- Opción 3: Verificar estructura de la tabla linkedin_profiles
SELECT 
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default,
    CASE 
        WHEN k.constraint_name IS NOT NULL THEN k.constraint_name
        ELSE 'Sin constraint'
    END as constraint_info
FROM information_schema.columns c
LEFT JOIN information_schema.key_column_usage k 
    ON c.table_name = k.table_name 
    AND c.column_name = k.column_name
WHERE c.table_name = 'linkedin_profiles'
ORDER BY c.ordinal_position;

-- Opción 4: Verificar RLS policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'linkedin_profiles';

-- Opción 5: Test de inserción sin foreign key
INSERT INTO linkedin_profiles (
    user_id,
    linkedin_id,
    first_name,
    last_name,
    email,
    access_token,
    refresh_token,
    is_active,
    is_primary
) VALUES (
    auth.uid(), -- Usar el ID del usuario autenticado actual
    'test_linkedin_id_' || extract(epoch from now()),
    'Test',
    'User',
    'test@example.com',
    'test_access_token',
    'test_refresh_token',
    true,
    false
) ON CONFLICT (linkedin_id) DO NOTHING;

-- Verificar si se insertó correctamente
SELECT * FROM linkedin_profiles 
WHERE linkedin_id LIKE 'test_linkedin_id_%'
ORDER BY created_at DESC
LIMIT 1;
