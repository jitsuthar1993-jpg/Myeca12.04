@echo off
echo ========================================
echo   Updating SmartTaxCalculator on GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo Adding all changes...
git add .

echo.
set /p COMMIT_MSG="Enter commit message (or press Enter for default): "
if "%COMMIT_MSG%"=="" set COMMIT_MSG=Update files - performance improvements and bug fixes

echo.
echo Committing changes...
git commit -m "%COMMIT_MSG%"

echo.
echo Pushing to GitHub...
git push origin main

echo.
if errorlevel 1 (
    echo Push failed. Trying with force...
    git push -u origin main --force
)

echo.
echo ========================================
echo   Done! Check: https://github.com/jitsuthar1993-jpg/SmartTaxCalculator
echo ========================================
echo.

pause
