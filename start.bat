@echo off
title ISSRMS - Integrated Student Services & Resource Management System
color 0A

echo ==============================================================================
echo   Saint Joseph School of Mactan - ISSRMS
echo   Integrated Student Services & Resource Management System
echo ==============================================================================
echo.

:: 1. Check & Start MySQL Database Server
echo [1/3] Checking MySQL Database Server (Port 3306)...
netstat -ano | findstr :3306 | findstr LISTENING >nul
if %errorlevel% neq 0 (
    echo       MySQL is not running. Launching local MySQL engine...
    start "ISSRMS - MySQL Server" /min cmd /c "cd /d C:\xampp && mysql\bin\mysqld.exe --defaults-file=mysql\bin\my.ini --console"
    timeout /t 3 /nobreak >nul
    netstat -ano | findstr :3306 | findstr LISTENING >nul
    if %errorlevel% equ 0 (
        echo       [OK] MySQL Server is now running on port 3306.
    ) else (
        echo       [WARN] MySQL did not respond on port 3306. Please ensure XAMPP is installed.
    )
) else (
    echo       [OK] MySQL Server is already active on port 3306.
)
echo.

:: 2. Check & Start Backend API (Port 5000)
echo [2/3] Starting ISSRMS Central API Server (Port 5000)...
netstat -ano | findstr :5000 | findstr LISTENING >nul
if %errorlevel% neq 0 (
    start "ISSRMS - Central API (Port 5000)" cmd /k "cd /d %~dp0apps\api && title ISSRMS Backend API && echo Starting Express API Server... && node src/server.js"
    timeout /t 2 /nobreak >nul
    echo       [OK] API Server initiated on port 5000.
) else (
    echo       [OK] API Server is already running on port 5000.
)
echo.

:: 3. Check & Start Frontend Web Client (Port 5173)
echo [3/3] Starting ISSRMS Web Client (Port 5173)...
netstat -ano | findstr :5173 | findstr LISTENING >nul
if %errorlevel% neq 0 (
    start "ISSRMS - Web Client (Port 5173)" cmd /k "cd /d %~dp0apps\web && title ISSRMS Web Client && echo Starting Vite Dev Server... && npm run dev"
    timeout /t 3 /nobreak >nul
    echo       [OK] Web client initiated on port 5173.
) else (
    echo       [OK] Web client is already active on port 5173.
)
echo.

echo ==============================================================================
echo   All ISSRMS services are active!
echo   Launching web application in default browser: http://localhost:5173
echo ==============================================================================
echo.
timeout /t 2 /nobreak >nul
start http://localhost:5173

exit
