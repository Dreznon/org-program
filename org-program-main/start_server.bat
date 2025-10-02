@echo off
cd "C:\Users\sagac\Documents\Organization app\org-program-main"
call .venv\Scripts\activate.bat
uvicorn api.main:app --reload
pause
