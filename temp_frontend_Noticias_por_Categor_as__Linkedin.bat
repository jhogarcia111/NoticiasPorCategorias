@echo off 
cd /d "C:\Users\Jho\Documents\GitHub\NoticiasPorCategorias" 
echo Esperando 3 segundos para que el backend esté listo... 
timeout /t 3 /nobreak >nul 
npx http-server public -p 4017 -o 
pause 
