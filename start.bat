@echo off
cd /d "%~dp0"
if not exist "node_modules\electron" (
  echo Installing dependencies, this only happens once...
  call npm install
  if errorlevel 1 (
    echo.
    echo npm install failed. Make sure Node.js is installed.
    pause
    exit /b 1
  )
)
call npm start
