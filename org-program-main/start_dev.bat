@echo off
setlocal

rem ====== CHANGE THIS IF YOUR PATH CHANGES ======
set "REPO=C:\Users\sagac\Documents\Organization app\org-program-main"
rem ===============================================

if not exist "%REPO%" (
  echo [ERROR] Repo path not found: "%REPO%"
  pause
  exit /b 1
)

if not exist "%REPO%\frontend" (
  echo [ERROR] Frontend dir not found: "%REPO%\frontend"
  dir "%REPO%"
  pause
  exit /b 1
)

rem -- Create .env.development if missing --
if not exist "%REPO%\frontend\.env.development" (
  echo VITE_API_BASE=http://127.0.0.1:8000>"%REPO%\frontend\.env.development"
)

rem ---- Backend (FastAPI) in a new cmd window ----
start "" /D "%REPO%" cmd /k python -m uvicorn api.main:app --reload --host 127.0.0.1 --port 8000

rem ---- Frontend (Vite) in a new cmd window ----
rem Use npm.cmd explicitly to dodge PowerShell policy / PATH variance
start "" /D "%REPO%\frontend" cmd /k "%ProgramFiles%\nodejs\npm.cmd" run dev

endlocal

