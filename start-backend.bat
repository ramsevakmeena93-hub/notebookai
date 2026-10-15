@echo off
echo ================================
echo  NoteCraft AI - Backend
echo ================================
cd notecraft-backend
echo Creating virtual environment...
python -m venv venv
call venv\Scripts\activate.bat
echo Installing dependencies...
pip install -r requirements.txt
echo.
echo NOTE: Copy .env.example to .env and update DATABASE_URL
echo       Default: postgresql://postgres:password@localhost:5432/notecraft
echo.
echo Starting FastAPI server...
uvicorn app.main:app --reload --port 8000
pause
