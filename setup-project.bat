@echo off
echo ========================================
echo   Setup Completo del Proyecto
echo   Publicador de Noticias LinkedIn
echo ========================================
echo.

echo Paso 1: Generando archivo .env...
call generate-env.bat

echo.
echo Paso 2: Instalando dependencias...
npm install

if %errorlevel% neq 0 (
    echo ERROR: Fallo al instalar dependencias
    pause
    exit /b 1
)

echo.
echo Paso 3: Verificando configuración...
if not exist .env (
    echo ERROR: Archivo .env no encontrado
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ¡Setup completado exitosamente!
echo ========================================
echo.
echo Próximos pasos:
echo 1. Ejecutar el esquema SQL en Supabase
echo 2. Configurar APIs externas (LinkedIn, NewsAPI, OpenAI)
echo 3. Ejecutar: npm run dev
echo.
echo ¿Deseas ejecutar el servidor de desarrollo ahora?
set /p run_dev="(s/n): "
if /i "%run_dev%"=="s" (
    echo.
    echo Iniciando servidor de desarrollo...
    npm run dev
) else (
    echo.
    echo Para iniciar el servidor más tarde, ejecuta: npm run dev
    pause
)
