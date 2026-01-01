@echo off
setlocal

REM LLM to Notes - Native Messaging Host Uninstaller for Windows

echo ==========================================
echo   LLM to Notes - Native Host Uninstaller
echo   Windows Edition
echo ==========================================
echo.

REM Configuration
set HOST_NAME=com.llmtonotes.host
set INSTALL_DIR=%LOCALAPPDATA%\llm-to-notes

echo Removing browser registry entries...

REM Remove Chrome registry entry
reg delete "HKCU\Software\Google\Chrome\NativeMessagingHosts\%HOST_NAME%" /f >nul 2>&1
if not errorlevel 1 echo   - Removed Google Chrome entry

REM Remove Edge registry entry
reg delete "HKCU\Software\Microsoft\Edge\NativeMessagingHosts\%HOST_NAME%" /f >nul 2>&1
if not errorlevel 1 echo   - Removed Microsoft Edge entry

REM Remove Brave registry entry
reg delete "HKCU\Software\BraveSoftware\Brave-Browser\NativeMessagingHosts\%HOST_NAME%" /f >nul 2>&1
if not errorlevel 1 echo   - Removed Brave Browser entry

REM Remove Vivaldi registry entry
reg delete "HKCU\Software\Vivaldi\NativeMessagingHosts\%HOST_NAME%" /f >nul 2>&1
if not errorlevel 1 echo   - Removed Vivaldi entry

echo.
echo Removing installed files...

if exist "%INSTALL_DIR%" (
    rmdir /s /q "%INSTALL_DIR%"
    echo   - Removed %INSTALL_DIR%
) else (
    echo   - Install directory not found (already removed?)
)

echo.
echo ==========================================
echo   Uninstall Complete!
echo ==========================================
echo.
pause

