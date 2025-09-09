@echo off
echo ========================================
echo   Guía de Configuración de Supabase
echo   Publicador de Noticias LinkedIn
echo ========================================
echo.

echo Esta guía te ayudará a configurar Supabase paso a paso.
echo.
echo PASO 1: Ejecutar el esquema de base de datos
echo ========================================
echo.
echo 1. Ve a tu dashboard de Supabase:
echo    https://supabase.com/dashboard
echo.
echo 2. Selecciona tu proyecto: ctwyiygyefrbpmgnlkgg
echo.
echo 3. Ve al SQL Editor (icono de </> en el menú lateral)
echo.
echo 4. Haz clic en "New Query"
echo.
echo 5. Abre el archivo "supabase-schema.sql" en tu editor
echo.
echo 6. Copia TODO el contenido del archivo
echo.
echo 7. Pégalo en el SQL Editor de Supabase
echo.
echo 8. Haz clic en "Run" para ejecutar el script
echo.
echo 9. Verifica que no hay errores en la consola
echo.
pause

echo.
echo PASO 2: Configurar autenticación
echo ========================================
echo.
echo 1. Ve a Authentication ^> Settings
echo.
echo 2. En "Site URL" escribe: http://localhost:3000
echo.
echo 3. En "Redirect URLs" agrega:
echo    - http://localhost:3000/auth/callback
echo    - https://publicadordenoticias.excelparaejecutivos.net/auth/callback
echo.
echo 4. Haz clic en "Save"
echo.
pause

echo.
echo PASO 3: Verificar Storage
echo ========================================
echo.
echo 1. Ve a Storage en el menú lateral
echo.
echo 2. Verifica que existen estos buckets:
echo    - ai-images (público)
echo    - news-images (público)
echo.
echo 3. Si no existen, el script SQL los creó automáticamente
echo.
pause

echo.
echo PASO 4: Crear usuario administrador
echo ========================================
echo.
echo 1. Ve a Authentication ^> Users
echo.
echo 2. Haz clic en "Add user"
echo.
echo 3. Crea un usuario con tu email
echo.
echo 4. Después de crear el usuario, ve al SQL Editor
echo.
echo 5. Ejecuta este comando (reemplaza 'tu-email@ejemplo.com'):
echo.
echo    UPDATE profiles 
echo    SET role = 'admin' 
echo    WHERE id = (
echo      SELECT id FROM auth.users 
echo      WHERE email = 'tu-email@ejemplo.com'
echo    );
echo.
pause

echo.
echo ========================================
echo   ¡Configuración de Supabase completada!
echo ========================================
echo.
echo Próximos pasos:
echo 1. Ejecutar: npm install
echo 2. Ejecutar: npm run dev
echo 3. Probar el login/registro
echo 4. Configurar APIs externas
echo.
echo ¿Deseas continuar con la instalación de dependencias?
set /p continue="(s/n): "
if /i "%continue%"=="s" (
    echo.
    echo Instalando dependencias...
    npm install
    if %errorlevel% equ 0 (
        echo.
        echo ¡Dependencias instaladas exitosamente!
        echo.
        echo ¿Deseas iniciar el servidor de desarrollo?
        set /p run_dev="(s/n): "
        if /i "%run_dev%"=="s" (
            npm run dev
        )
    ) else (
        echo ERROR: Fallo al instalar dependencias
    )
)
echo.
pause
