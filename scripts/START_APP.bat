@echo off
echo ========================================
echo   Starting SmartTaxCalculator
echo ========================================
echo.

cd /d "%~dp0"

echo Checking Node.js...
node --version
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install from https://nodejs.org
    pause
    exit /b 1
)

echo.
echo Clearing ALL caches...
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"
if exist "client\.vite" rmdir /s /q "client\.vite"
if exist ".vite" rmdir /s /q ".vite"
del /q "client\src\*.js" 2>nul

echo.
echo Starting Vite Development Server...
echo.
echo Once started, open http://localhost:5173 in your browser
echo Press Ctrl+C to stop the server
echo.

set VITE_CJS_IGNORE_WARNING=true
npx vite --force --clearScreen false

pause
