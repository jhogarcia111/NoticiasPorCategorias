cd\
cd "C:\Users\Jho\Documents\GitHub\NoticiasPorCategorias"

@echo off
echo ========================================
echo    Noticias por Categorías- Linkedin - Server Restart
echo ========================================
echo.

echo [1/5] Identificando procesos en puertos específicos...

REM Función para obtener PID del proceso que usa un puerto específico
set "PORT_3017_PID="
set "PORT_4017_PID="

REM Buscar proceso en puerto 3017 (Backend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3017" ^| findstr "LISTENING"') do (
    set "PORT_3017_PID=%%a"
)

REM Buscar proceso en puerto 4017 (Frontend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4017" ^| findstr "LISTENING"') do (
    set "PORT_4017_PID=%%a"
)

echo.
echo [2/5] Deteniendo procesos específicos en puertos del proyecto...

REM Detener proceso en puerto 3017 si existe
if not "%PORT_3017_PID%"=="" (
    echo ⚠ Proceso encontrado en puerto 3017 (PID: %PORT_3017_PID%)
    taskkill /F /PID %PORT_3017_PID% >nul 2>&1
    if %errorlevel% == 0 (
        echo ✓ Proceso en puerto 3017 detenido exitosamente
    ) else (
        echo ⚠ No se pudo detener el proceso en puerto 3017
    )
) else (
    echo ℹ No hay proceso ejecutándose en puerto 3017
)

REM Detener proceso en puerto 4017 si existe
if not "%PORT_4017_PID%"=="" (
    echo ⚠ Proceso encontrado en puerto 4017 (PID: %PORT_4017_PID%)
    taskkill /F /PID %PORT_4017_PID% >nul 2>&1
    if %errorlevel% == 0 (
        echo ✓ Proceso en puerto 4017 detenido exitosamente
    ) else (
        echo ⚠ No se pudo detener el proceso en puerto 4017
    )
) else (
    echo ℹ No hay proceso ejecutándose en puerto 4017
)
echo.

echo [3/5] Esperando 2 segundos para liberar puertos...
timeout /t 2 /nobreak >nul
echo.

echo [4/5] Verificando que los puertos estén libres...
netstat -an | findstr ":3017" >nul
if %errorlevel% == 0 (
    echo ⚠ Puerto 3017 aún en uso, esperando...
    timeout /t 3 /nobreak >nul
) else (
    echo ✓ Puerto 3017 libre
)

netstat -an | findstr ":4017" >nul
if %errorlevel% == 0 (
    echo ⚠ Puerto 4017 aún en uso, esperando...
    timeout /t 3 /nobreak >nul
) else (
    echo ✓ Puerto 4017 libre
)
echo.

echo [5/5] Iniciando servidores del proyecto...

echo Iniciando servidores en Windows Terminal con paneles divididos...

REM Crear script temporal para backend
echo @echo off > "C:\Users\Jho\Documents\GitHub\NoticiasPorCategorias\temp_backend_Noticias_por_Categor_as__Linkedin.bat"
echo cd /d "C:\Users\Jho\Documents\GitHub\NoticiasPorCategorias" >> "C:\Users\Jho\Documents\GitHub\NoticiasPorCategorias\temp_backend_Noticias_por_Categor_as__Linkedin.bat"

echo npm run dev:mysql >> "C:\Users\Jho\Documents\GitHub\NoticiasPorCategorias\temp_backend_Noticias_por_Categor_as__Linkedin.bat"
echo pause >> "C:\Users\Jho\Documents\GitHub\NoticiasPorCategorias\temp_backend_Noticias_por_Categor_as__Linkedin.bat"

REM Crear script temporal para frontend
echo @echo off > "C:\Users\Jho\Documents\GitHub\NoticiasPorCategorias\temp_frontend_Noticias_por_Categor_as__Linkedin.bat"
echo cd /d "C:\Users\Jho\Documents\GitHub\NoticiasPorCategorias" >> "C:\Users\Jho\Documents\GitHub\NoticiasPorCategorias\temp_frontend_Noticias_por_Categor_as__Linkedin.bat"

echo echo Esperando 3 segundos para que el backend esté listo... >> "C:\Users\Jho\Documents\GitHub\NoticiasPorCategorias\temp_frontend_Noticias_por_Categor_as__Linkedin.bat"
echo timeout /t 3 /nobreak ^>nul >> "C:\Users\Jho\Documents\GitHub\NoticiasPorCategorias\temp_frontend_Noticias_por_Categor_as__Linkedin.bat"
echo npx http-server public -p 4017 -o >> "C:\Users\Jho\Documents\GitHub\NoticiasPorCategorias\temp_frontend_Noticias_por_Categor_as__Linkedin.bat"
echo pause >> "C:\Users\Jho\Documents\GitHub\NoticiasPorCategorias\temp_frontend_Noticias_por_Categor_as__Linkedin.bat"

REM Ejecutar en Windows Terminal
start wt new-tab --title "Backend - Noticias por Categorías- Linkedin" cmd /k "cd /d \"C:\Users\Jho\Documents\GitHub\NoticiasPorCategorias\" && temp_backend_Noticias_por_Categor_as__Linkedin.bat" ; split-pane --title "Frontend - Noticias por Categorías- Linkedin" cmd /k "cd /d \"C:\Users\Jho\Documents\GitHub\NoticiasPorCategorias\" && temp_frontend_Noticias_por_Categor_as__Linkedin.bat"
echo ✓ Backend iniciado en puerto 3017
echo ✓ Frontend iniciado en puerto 4017
echo.

echo ========================================
echo    ¡Servidores iniciados exitosamente!
echo ========================================
echo.
echo Proyecto: Noticias por Categorías- Linkedin
echo Backend:  http://localhost:3017
echo Frontend: http://localhost:4017
echo.
echo ========================================
echo    Información de Seguridad
echo ========================================
echo.
echo ✓ Solo se detienen procesos en puertos 3017 y 4017
echo ✓ Otros procesos de Node.js en el sistema NO se afectan
echo ✓ Identificación específica por PID antes de detener
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul