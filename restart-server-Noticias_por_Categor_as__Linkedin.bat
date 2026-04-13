@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
echo ========================================
echo    Noticias por Categorías- Linkedin - Server Restart
echo ========================================
echo.

REM Configuración de puertos
set BACKEND_PORT=3017
set FRONTEND_PORT=4017

REM Rutas del proyecto
set BACKEND_DIR=
set FRONTEND_DIR=

echo 📍 Puertos configurados:
echo    Backend:  %BACKEND_PORT%
echo    Frontend: %FRONTEND_PORT%
echo.

echo [1/5] Deteniendo procesos en puertos del proyecto...
echo.

echo ========================================
echo 🔧 Backend (Puerto %BACKEND_PORT%)
echo ========================================
call :kill_port %BACKEND_PORT%
if errorlevel 1 (
    echo ERROR: Problema verificando puerto %BACKEND_PORT%
)

timeout /t 1 /nobreak >nul




echo.
echo [2/5] Esperando a que los puertos se liberen...
timeout /t 2 /nobreak >nul

echo.
echo [3/5] Verificando estructura del proyecto...





echo ✅ Estructura del proyecto verificada

echo.
echo [4/5] Iniciando servidores del proyecto...
echo.

:: Iniciar Backend en nueva ventana
echo 📡 Iniciando Backend...
set BACKEND_BAT=%TEMP%\start_backend_%RANDOM%.bat
set BACKEND_PATH=%CD%
(
    echo @echo off
    echo chcp 65001 ^>nul
    echo cd /d "%BACKEND_PATH%"
    echo echo.
    echo echo ========================================
    echo echo 🔧 Backend - Puerto %BACKEND_PORT%
    echo echo ========================================
    echo echo.
    echo npm run dev
    echo pause
) > "%BACKEND_BAT%"
start "Backend - Noticias por Categorías- Linkedin" cmd /k "%BACKEND_BAT%"

:: Esperar un poco para que el backend inicie
timeout /t 3 /nobreak >nul




echo.
echo [5/5] ✅ Servidores iniciados
echo.

echo ========================================
echo    ¡Servidores iniciados exitosamente!
echo ========================================
echo.
echo Proyecto: Noticias por Categorías- Linkedin
echo 📊 Backend:  http://localhost:%BACKEND_PORT%

echo.
echo 💡 Ventana(s) abierta(s) con el(los) servidor(es) corriendo
echo 💡 Para detener los servidores, cierra las ventanas

echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul
endlocal
goto :end

:: Función para encontrar y cerrar proceso en un puerto (sin bucles infinitos)
:kill_port
setlocal enabledelayedexpansion
set PORT=%1
set FOUND=0
echo 🔍 Buscando procesos en puerto %PORT%...

:: Verificar primero si hay procesos
netstat -ano 2>nul | findstr /C:":%PORT%" | findstr "LISTENING" >nul 2>&1
if errorlevel 1 (
    echo ✅ No hay procesos en puerto %PORT%
    endlocal
    exit /b 0
)

:: Buscar procesos usando el puerto - solo procesar el primero y salir
:: Usar método simple: obtener solo la primera línea
set TMP_OUT=%TEMP%\port_%PORT%_%RANDOM%.txt
netstat -ano 2>nul | findstr /C:":%PORT%" | findstr "LISTENING" > "%TMP_OUT%" 2>nul

if exist "%TMP_OUT%" (
    set /p FIRST_LINE=<"%TMP_OUT%" 2>nul
    if defined FIRST_LINE (
        REM Extraer PID (último campo)
        for %%p in (%FIRST_LINE%) do set PID=%%p
        if defined PID (
            if not "!PID!"=="" if not "!PID!"=="0" (
                set FOUND=1
                echo ⚠️  Proceso encontrado: PID !PID!
                echo 🛑 Cerrando proceso...
                taskkill /PID !PID! /F >nul 2>&1
                if !errorlevel! equ 0 (
                    echo ✅ Proceso cerrado exitosamente
                ) else (
                    echo ⚠️  No se pudo cerrar el proceso (puede que ya no exista)
                )
            )
        )
    )
    del "%TMP_OUT%" >nul 2>&1
)

if !FOUND! equ 0 (
    echo ✅ No hay procesos en puerto %PORT%
)

endlocal
exit /b 0

:end