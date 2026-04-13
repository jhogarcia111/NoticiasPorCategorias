-- Verificar estructura de la tabla linkedin_profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'linkedin_profiles' 
ORDER BY ordinal_position;
