@echo off
echo Setting up Organization App Development Environment
echo.

echo Creating frontend environment file...
echo VITE_API_BASE=http://localhost:8000 > frontend\.env.development
echo Environment file created: frontend\.env.development
echo.

echo To start development:
echo 1. Backend: cd org-program-main ^&^& python -m uvicorn api.main:app --reload --host 127.0.0.1 --port 8000
echo 2. Frontend: cd frontend ^&^& npm run dev
echo.

echo Backend will be available at: http://localhost:8000
echo Frontend will be available at: http://localhost:5174
echo API docs will be available at: http://localhost:8000/docs
echo.

pause
