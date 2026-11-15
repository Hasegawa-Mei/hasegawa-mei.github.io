@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
cd /d "%~dp0"
set "NODE="
where node >nul 2>nul && set "NODE=node"
if not defined NODE if exist "%ProgramFiles%\nodejs\node.exe" set "NODE=%ProgramFiles%\nodejs\node.exe"
if not defined NODE (
  echo Looking for Node.js on this computer, please wait...
  for %%D in ("%USERPROFILE%\.codex" "%LOCALAPPDATA%\OpenAI" "%LOCALAPPDATA%\pnpm" "%APPDATA%\npm" "%USERPROFILE%\.local" "%LOCALAPPDATA%\Programs") do (
    if not defined NODE if exist "%%~D" (
      for /f "delims=" %%F in ('where /r "%%~D" node.exe 2^>nul') do if not defined NODE set "NODE=%%F"
    )
  )
)
if not defined NODE (
  echo.
  echo NODE NOT FOUND. Node.js is not installed on this computer.
  echo Copy this text and send it to Claude.
  pause
  exit /b 1
)
echo Using Node: !NODE!
"!NODE!" -v
echo [1/2] Building...
"!NODE!" scripts\build.mjs
if errorlevel 1 (
  echo.
  echo Build failed. Copy the text above and send it to Claude.
  pause
  exit /b 1
)
echo.
echo [2/2] Preview is running at http://127.0.0.1:8787/  ^(keep this window open; close it to stop^)
"!NODE!" scripts\preview.mjs
pause
