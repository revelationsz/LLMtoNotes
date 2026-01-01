@echo off
setlocal enabledelayedexpansion

REM LLM to Notes - Native Messaging Host Installer for Windows
REM This script installs the native messaging host for the Chrome extension

echo ==========================================
echo   LLM to Notes - Native Host Installer
echo   Windows Edition
echo ==========================================
echo.

REM Configuration
set HOST_NAME=com.llmtonotes.host
set INSTALL_DIR=%LOCALAPPDATA%\llm-to-notes
set SCRIPT_DIR=%~dp0
set EXTENSION_ID=jlopaibpmommnelcgjmjjhkcbflfecjl

REM Check for Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH.
    echo Please install Python 3 from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation.
    pause
    exit /b 1
)

REM Create install directory
echo.
echo Creating install directory: %INSTALL_DIR%
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

REM Copy Python script
echo Installing native host script...
copy /Y "%SCRIPT_DIR%llm_to_notes_host.py" "%INSTALL_DIR%\" >nul
if errorlevel 1 (
    echo ERROR: Failed to copy Python script.
    pause
    exit /b 1
)

REM Create the batch launcher (Windows native messaging requires a batch wrapper)
echo Creating launcher script...
(
echo @echo off
echo python "%%~dp0llm_to_notes_host.py"
) > "%INSTALL_DIR%\llm_to_notes_host.bat"

REM Create the manifest JSON file
echo Creating manifest file...
set MANIFEST_PATH=%INSTALL_DIR%\%HOST_NAME%.json
set LAUNCHER_PATH=%INSTALL_DIR%\llm_to_notes_host.bat

REM Escape backslashes for JSON
set "LAUNCHER_PATH_ESCAPED=%LAUNCHER_PATH:\=\\%"

(
echo {
echo   "name": "%HOST_NAME%",
echo   "description": "Native messaging host for LLM to Notes extension",
echo   "path": "%LAUNCHER_PATH_ESCAPED%",
echo   "type": "stdio",
echo   "allowed_origins": ["chrome-extension://%EXTENSION_ID%/"]
echo }
) > "%MANIFEST_PATH%"

REM Install Registry entries for browsers
echo.
echo Installing browser registry entries...

REM Google Chrome
reg query "HKCU\Software\Google\Chrome" >nul 2>&1
if not errorlevel 1 (
    echo   - Google Chrome
    reg add "HKCU\Software\Google\Chrome\NativeMessagingHosts\%HOST_NAME%" /ve /t REG_SZ /d "%MANIFEST_PATH%" /f >nul
)

REM Microsoft Edge
reg query "HKCU\Software\Microsoft\Edge" >nul 2>&1
if not errorlevel 1 (
    echo   - Microsoft Edge
    reg add "HKCU\Software\Microsoft\Edge\NativeMessagingHosts\%HOST_NAME%" /ve /t REG_SZ /d "%MANIFEST_PATH%" /f >nul
)

REM Brave Browser
reg query "HKCU\Software\BraveSoftware\Brave-Browser" >nul 2>&1
if not errorlevel 1 (
    echo   - Brave Browser
    reg add "HKCU\Software\BraveSoftware\Brave-Browser\NativeMessagingHosts\%HOST_NAME%" /ve /t REG_SZ /d "%MANIFEST_PATH%" /f >nul
)

REM Vivaldi
reg query "HKCU\Software\Vivaldi" >nul 2>&1
if not errorlevel 1 (
    echo   - Vivaldi
    reg add "HKCU\Software\Vivaldi\NativeMessagingHosts\%HOST_NAME%" /ve /t REG_SZ /d "%MANIFEST_PATH%" /f >nul
)

echo.
echo ==========================================
echo   Installation Complete!
echo ==========================================
echo.
echo Native host installed to: %INSTALL_DIR%
echo Extension ID: %EXTENSION_ID%
echo.
echo Next steps:
echo   1. Reload the extension in chrome://extensions/
echo   2. Open the extension popup
echo   3. Set your Obsidian vault path (e.g., C:\Users\YourName\Documents\MyVault)
echo   4. Start saving notes from ChatGPT!
echo.
pause

