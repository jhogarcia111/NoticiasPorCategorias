@echo off
echo ========================================
echo   Generador de archivo .env
echo   Publicador de Noticias LinkedIn
echo ========================================
echo.

REM Verificar si el archivo .env ya existe
if exist .env (
    echo El archivo .env ya existe.
    set /p overwrite="¿Deseas sobrescribirlo? (s/n): "
    if /i not "%overwrite%"=="s" (
        echo Operacion cancelada.
        pause
        exit /b
    )
)

echo.
echo Generando archivo .env...
echo.

REM Crear el archivo .env
(
echo # Supabase Configuration
echo VITE_SUPABASE_URL=https://ctwyiygyefrbpmgnlkgg.supabase.co
echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0d3lpeWd5ZWZyYnBtZ25sa2dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczODYyMjAsImV4cCI6MjA3Mjk2MjIyMH0.P1w0j_F7W8FtJ5-PTZkyKI-0x5-4Tq9Bl-FmsKbLtAM
echo.
echo # LinkedIn API Configuration
echo VITE_LINKEDIN_CLIENT_ID=
echo VITE_LINKEDIN_CLIENT_SECRET=
echo VITE_LINKEDIN_REDIRECT_URI=https://publicadordenoticias.excelparaejecutivos.net/auth/linkedin/callback
echo.
echo # News API Configuration
echo VITE_NEWSAPI_KEY=
echo.
echo # AI Services Configuration
echo VITE_OPENAI_API_KEY=
echo VITE_STABILITY_API_KEY=
echo.
echo # App Configuration
echo VITE_APP_URL=https://publicadordenoticias.excelparaejecutivos.net
) > .env

echo ¡Archivo .env generado exitosamente!
echo.
echo ========================================
echo   Credenciales configuradas:
echo   - Supabase URL: https://ctwyiygyefrbpmgnlkgg.supabase.co
echo   - Supabase Anon Key: [CONFIGURADO]
echo   - LinkedIn: [PENDIENTE]
echo   - NewsAPI: [PENDIENTE]
echo   - OpenAI: [PENDIENTE]
echo ========================================
echo.
echo Próximos pasos:
echo 1. Configurar LinkedIn Developer Portal
echo 2. Obtener API key de NewsAPI
echo 3. Obtener API key de OpenAI
echo 4. Ejecutar: npm install
echo 5. Ejecutar: npm run dev
echo.
pause
