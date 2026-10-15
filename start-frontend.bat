@echo off
echo ================================
echo   NoteCraft AI
echo   100%% Frontend - No backend needed
echo ================================
cd notecraft-frontend
echo Installing dependencies...
call npm install
echo.
echo Starting app...
call npm run dev
pause
