@echo off
echo ================================
echo  NoteCraft AI - Frontend
echo ================================
cd notecraft-frontend
echo Installing dependencies...
call npm install
echo Starting development server...
call npm run dev
pause
