@echo off
setlocal

REM Move to the repo root where this .bat lives
cd /d "%~dp0"

REM ---------- Start FastAPI in a new terminal ----------
set API_TITLE=API (FastAPI)
set ACTIVATE_PATH=

REM Try common virtualenv locations first
if exist ".venv\Scripts\activate.bat" set ACTIVATE_PATH=.venv\Scripts\activate.bat
if exist "venv\Scripts\activate.bat"  set ACTIVATE_PATH=venv\Scripts\activate.bat

if defined ACTIVATE_PATH (
  start "%API_TITLE%" cmd /k call "%ACTIVATE_PATH%" ^& uvicorn api.main:app --reload
) else (
  REM Fall back to system Python
  start "%API_TITLE%" cmd /k python -m uvicorn api.main:app --reload
)

REM ---------- Start Vite in a new terminal ----------
set WEB_TITLE=WEB (Vite)
set WEB_DIR=%~dp0web

if not exist "%WEB_DIR%" (
  echo [ERROR] Could not find "%WEB_DIR%".
  echo Make sure your new web app is at org-program-main\web
  goto :eof
)

REM Ensure .env.local exists so the web app knows the API URL
if not exist "%WEB_DIR%\.env.local" (
  echo VITE_API_BASE=http://127.0.0.1:8000> "%WEB_DIR%\.env.local"
)

REM Launch Vite on 5174 and open the browser
start "" "http://localhost:5174/"
start "%WEB_TITLE%" cmd /k cd /d "%WEB_DIR%" ^& npm run dev -- --port 5174 --host

endlocal
