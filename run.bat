@echo off
setlocal enabledelayedexpansion
title AutoHunter AI - Global Freelance and Automation Hunter

cd /d "%~dp0"

:: -------------------------------------------------------------------------
:: 1. Check if Python is already installed and working
:: -------------------------------------------------------------------------
set "PY_CMD="

python -c "import sys; sys.exit(0 if sys.version_info >= (3, 8) else 1)" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    set "PY_CMD=python"
    goto :check_deps
)

py -3 -c "import sys; sys.exit(0 if sys.version_info >= (3, 8) else 1)" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    set "PY_CMD=py -3"
    goto :check_deps
)

if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
    set "PY_CMD=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
    goto :check_deps
)
if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" (
    set "PY_CMD=%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
    goto :check_deps
)
if exist "%LOCALAPPDATA%\Programs\Python\Python310\python.exe" (
    set "PY_CMD=%LOCALAPPDATA%\Programs\Python\Python310\python.exe"
    goto :check_deps
)
if exist "%ProgramFiles%\Python312\python.exe" (
    set "PY_CMD=%ProgramFiles%\Python312\python.exe"
    goto :check_deps
)
if exist "%ProgramFiles%\Python311\python.exe" (
    set "PY_CMD=%ProgramFiles%\Python311\python.exe"
    goto :check_deps
)
if exist "C:\Python312\python.exe" (
    set "PY_CMD=C:\Python312\python.exe"
    goto :check_deps
)
if exist "C:\Python311\python.exe" (
    set "PY_CMD=C:\Python311\python.exe"
    goto :check_deps
)

:: If not found, download and install Python
goto :install_python

:: -------------------------------------------------------------------------
:: 2. Download and install official Python silently
:: -------------------------------------------------------------------------
:install_python
cls
echo ====================================================================
echo        AUTOHUNTER AI - AUTOMATED SETUP ASSISTANT
echo ====================================================================
echo.
echo [!] Python was not detected on your computer.
echo [*] AutoHunter AI is automatically downloading and installing
echo     official 64-bit Python for you right now.
echo.
echo [*] No administrator permissions needed.
echo [*] Downloading Python 3.11 from python.org...
echo.

set "INSTALLER_PATH=%TEMP%\autohunter_python_installer.exe"

where curl >nul 2>&1
if %ERRORLEVEL% equ 0 (
    curl -L "https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe" -o "%INSTALLER_PATH%"
) else (
    powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object System.Net.WebClient).DownloadFile('https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe', '%INSTALLER_PATH%')"
)

if not exist "%INSTALLER_PATH%" (
    echo.
    echo [ERROR] Failed to download Python installer automatically.
    echo Please download and install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)

echo.
echo [*] Installing Python silently in background...
echo [*] This will take approximately 30-60 seconds...
start /wait "" "%INSTALLER_PATH%" /quiet InstallAllUsers=0 PrependPath=1 Include_test=0 SimpleInstall=1

del /f /q "%INSTALLER_PATH%" >nul 2>&1

set "PATH=%LOCALAPPDATA%\Programs\Python\Python311;%LOCALAPPDATA%\Programs\Python\Python311\Scripts;%PATH%"

if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" (
    set "PY_CMD=%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
    echo [OK] Python successfully installed!
    goto :check_deps
)

python -c "import sys; sys.exit(0)" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    set "PY_CMD=python"
    echo [OK] Python successfully installed!
    goto :check_deps
)

echo.
echo [OK] Python setup completed.
echo Please double-click run.bat again to start AutoHunter AI.
pause
exit /b 0

:: -------------------------------------------------------------------------
:: 3. Verify packages and launch
:: -------------------------------------------------------------------------
:check_deps
echo [*] Python runtime: %PY_CMD%

%PY_CMD% -c "import fastapi, uvicorn, httpx, bs4, pydantic" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [*] Installing required packages...
    %PY_CMD% -m pip install -r "%~dp0requirements.txt" --disable-pip-version-check
    echo [OK] Packages installed successfully.
)

cls
%PY_CMD% "%~dp0run.py"
if %ERRORLEVEL% neq 0 (
    echo.
    echo [!] Server exited.
    pause
)
