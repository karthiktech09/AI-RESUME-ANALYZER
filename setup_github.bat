@echo off
cd /d "c:\Users\N KARTHIK\OneDrive\Desktop\resume analyzer"

REM Configure git
git config --global user.email "you@example.com"
git config --global user.name "Your Name"

REM Initialize repository
git init
git add .
git commit -m "Initial commit: ResumeAI - AI Resume Screening Tool"

echo.
echo =========================================
echo Git repository initialized successfully!
echo =========================================
echo.
echo Next steps:
echo 1. Create a new repository on GitHub: https://github.com/new
echo 2. Run these commands in PowerShell:
echo.
echo    git branch -M main
echo    git remote add origin https://github.com/YOUR-USERNAME/resume-analyzer.git
echo    git push -u origin main
echo.
echo Replace YOUR-USERNAME with your GitHub username
echo =========================================
pause
