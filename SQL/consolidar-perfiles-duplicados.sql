-- CONSOLIDAR PERFILES DUPLICADOS
-- Reemplaza 'jhomigaca17' con tu username
-- Encuentra todos los perfiles con el mismo username

-- 1. Identificar perfiles duplicados
SELECT id, username, role, created_at 
FROM profiles 
WHERE username = 'jhomigaca17'
ORDER BY created_at;

-- 2. Elegir el perfil MÁS ANTIGUO como canónico (el primero creado)
-- Reemplaza MAIN_ID con el id del perfil que quieres conservar
-- Reemplaza DUP_ID_1, DUP_ID_2 con los ids de duplicados a fusionar

BEGIN;

-- 3. Reasignar generated_images
UPDATE generated_images SET user_id = 'MAIN_ID' WHERE user_id IN ('DUP_ID_1','DUP_ID_2');

-- 4. Reasignar linkedin_profiles
UPDATE linkedin_profiles SET user_id = 'MAIN_ID' WHERE user_id IN ('DUP_ID_1','DUP_ID_2');

-- 5. Reasignar scheduling_configs
UPDATE scheduling_configs SET user_id = 'MAIN_ID' WHERE user_id IN ('DUP_ID_1','DUP_ID_2');

-- 6. Reasignar subscriptions
UPDATE subscriptions SET user_id = 'MAIN_ID' WHERE user_id IN ('DUP_ID_1','DUP_ID_2');

-- 7. Reasignar news (scheduled_posts)
UPDATE scheduled_posts SET user_id = 'MAIN_ID' WHERE user_id IN ('DUP_ID_1','DUP_ID_2');

-- 8. Reasignar categories
UPDATE categories SET created_by = 'MAIN_ID' WHERE created_by IN ('DUP_ID_1','DUP_ID_2');

-- 9. Reasignar audits
UPDATE audits SET user_id = 'MAIN_ID' WHERE user_id IN ('DUP_ID_1','DUP_ID_2');

-- 10. Eliminar perfiles duplicados
DELETE FROM profiles WHERE id IN ('DUP_ID_1','DUP_ID_2');

COMMIT;