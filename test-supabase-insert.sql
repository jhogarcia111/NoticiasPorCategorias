-- Test 1: Verificar estructura de la tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'linkedin_profiles' 
ORDER BY ordinal_position;

-- Test 2: Verificar RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'linkedin_profiles';

-- Test 3: Verificar si existe el usuario de prueba
SELECT id, email FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000000';

-- Test 4: Crear usuario de prueba si no existe
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'test@example.com',
    '$2a$10$dummy.hash.for.testing',
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Test 5: Insertar datos de prueba directamente
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
    '00000000-0000-0000-0000-000000000000', -- UUID de prueba
    'test_linkedin_id_123',
    'Test',
    'User',
    'test@example.com',
    'test_access_token',
    'test_refresh_token',
    true,
    false
);

-- Test 4: Verificar si se insertó
SELECT * FROM linkedin_profiles WHERE linkedin_id = 'test_linkedin_id_123';

-- Test 5: Limpiar datos de prueba
DELETE FROM linkedin_profiles WHERE linkedin_id = 'test_linkedin_id_123';
