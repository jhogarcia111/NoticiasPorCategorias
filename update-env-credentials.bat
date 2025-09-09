@echo off
echo ========================================
echo   Actualizador de Credenciales
echo   Publicador de Noticias LinkedIn
echo ========================================
echo.

if not exist .env (
    echo ERROR: Archivo .env no encontrado. Ejecuta primero generate-env.bat
    pause
    exit /b 1
)

echo ¿Qué credenciales deseas actualizar?
echo.
echo 1. LinkedIn API
echo 2. NewsAPI
echo 3. DeepSeek AI
echo 4. Stability AI
echo 5. Todas las APIs
echo 6. Cancelar
echo.
set /p choice="Selecciona una opción (1-6): "

if "%choice%"=="1" goto linkedin
if "%choice%"=="2" goto newsapi
if "%choice%"=="3" goto deepseek
if "%choice%"=="4" goto stability
if "%choice%"=="5" goto all_apis
if "%choice%"=="6" goto cancel
goto invalid

:linkedin
echo.
echo Configurando LinkedIn API...
set /p linkedin_client_id="LinkedIn Client ID: "
set /p linkedin_client_secret="LinkedIn Client Secret: "
goto update_file

:newsapi
echo.
echo Configurando NewsAPI...
set /p newsapi_key="NewsAPI Key: "
goto update_file

:deepseek
echo.
echo Configurando DeepSeek AI...
set /p deepseek_key="DeepSeek API Key: "
goto update_file

:stability
echo.
echo Configurando Stability AI...
set /p stability_key="Stability AI API Key: "
goto update_file

:all_apis
echo.
echo Configurando todas las APIs...
set /p linkedin_client_id="LinkedIn Client ID: "
set /p linkedin_client_secret="LinkedIn Client Secret: "
set /p newsapi_key="NewsAPI Key: "
set /p deepseek_key="DeepSeek API Key: "
set /p stability_key="Stability AI API Key: "
goto update_file

:update_file
echo.
echo Actualizando archivo .env...

REM Crear archivo temporal
(
echo # Supabase Configuration
echo VITE_SUPABASE_URL=https://ctwyiygyefrbpmgnlkgg.supabase.co
echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0d3lpeWd5ZWZyYnBtZ25sa2dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczODYyMjAsImV4cCI6MjA3Mjk2MjIyMH0.P1w0j_F7W8FtJ5-PTZkyKI-0x5-4Tq9Bl-FmsKbLtAM
echo.
echo # LinkedIn API Configuration
echo VITE_LINKEDIN_CLIENT_ID=%linkedin_client_id%
echo VITE_LINKEDIN_CLIENT_SECRET=%linkedin_client_secret%
echo VITE_LINKEDIN_REDIRECT_URI=https://publicadordenoticias.excelparaejecutivos.net/auth/linkedin/callback
echo.
echo # News API Configuration
echo VITE_NEWSAPI_KEY=%newsapi_key%
echo.
echo # AI Services Configuration
echo VITE_DEEPSEEK_API_KEY=%deepseek_key%
echo VITE_STABILITY_API_KEY=%stability_key%
echo.
echo # App Configuration
echo VITE_APP_URL=https://publicadordenoticias.excelparaejecutivos.net
) > .env.tmp

REM Reemplazar archivo original
move .env.tmp .env

echo ¡Archivo .env actualizado exitosamente!
goto end

:invalid
echo Opción inválida. Intenta de nuevo.
pause
goto :eof

:cancel
echo Operación cancelada.
goto end

:end
echo.
echo ========================================
echo   Credenciales actualizadas
echo ========================================
echo.
echo Para aplicar los cambios, reinicia el servidor de desarrollo:
echo npm run dev
echo.
pause
