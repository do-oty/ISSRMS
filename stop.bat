@echo off
title Stop ISSRMS Services
color 0C

echo ==============================================================================
echo   Stopping ISSRMS Local Services
echo ==============================================================================
echo.

:: 1. Stop Vite Web Server on port 5173
echo [1/3] Stopping Web Client (Port 5173)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING 2^>nul') do (
    taskkill /f /pid %%a >nul 2>&1
    echo       [OK] Stopped PID %%a
)

:: 2. Stop Express API Server on port 5000
echo [2/3] Stopping Central API Server (Port 5000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING 2^>nul') do (
    taskkill /f /pid %%a >nul 2>&1
    echo       [OK] Stopped PID %%a
)

:: 3. Stop MySQL Server
echo [3/3] Stopping MySQL Server (Port 3306)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3306 ^| findstr LISTENING 2^>nul') do (
    taskkill /f /pid %%a >nul 2>&1
    echo       [OK] Stopped PID %%a
)

echo.
echo ==============================================================================
echo   All ISSRMS services have been shut down cleanly.
echo ==============================================================================
echo.
pause
