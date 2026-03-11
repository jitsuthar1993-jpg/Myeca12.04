@echo off
echo ========================================
echo   Upload SmartTaxCalculator to GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo Checking Git installation...
git --version
if errorlevel 1 (
    echo ERROR: Git is not installed!
    echo Please install from https://git-scm.com/download/win
    pause
    exit /b 1
)

echo.
echo Step 1: Initializing Git repository...
git init

echo.
echo Step 2: Adding all files...
git add .

echo.
echo Step 3: Creating commit...
git commit -m "SmartTaxCalculator - Tax Filing Platform"

echo.
echo ========================================
echo   NOW DO THESE STEPS MANUALLY:
echo ========================================
echo.
echo 1. Go to: https://github.com/new
echo 2. Repository name: SmartTaxCalculator
echo 3. Click "Create repository" (don't add README)
echo 4. Copy your repository URL (looks like: https://github.com/USERNAME/SmartTaxCalculator.git)
echo.
echo ========================================

set /p REPO_URL="Paste your GitHub repository URL here: "

if "%REPO_URL%"=="" (
    echo No URL provided. Exiting.
    pause
    exit /b 1
)

echo.
echo Step 4: Connecting to GitHub...
git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo.
echo Step 5: Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
if errorlevel 1 (
    echo ========================================
    echo   AUTHENTICATION NEEDED
    echo ========================================
    echo.
    echo If push failed, you need a Personal Access Token:
    echo 1. Go to: https://github.com/settings/tokens
    echo 2. Click "Generate new token (classic)"
    echo 3. Give it a name, select "repo" scope
    echo 4. Copy the token
    echo 5. Run this script again and use the token as password
    echo.
) else (
    echo ========================================
    echo   SUCCESS! Your code is now on GitHub!
    echo ========================================
    echo.
    echo View it at: %REPO_URL%
    echo.
)

pause
