@echo off
REM CLD3 Language Detector - Server Startup Script (Windows)
REM This script starts the Node.js server

echo.
echo 🚀 Starting CLD3 Language Detector Server...
echo.

REM Check if node is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo    Visit: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    echo.
)

REM Start the server
npm start
pause
