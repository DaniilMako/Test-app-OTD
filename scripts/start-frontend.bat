@echo off
REM Скрипт запуска фронтенда на Windows
REM Использование: start-frontend.bat [API_URL]
REM Пример: start-frontend.bat http://your-server-ip:8000

cd /d "%~dp0..\frontend"

REM Получение API URL из аргумента или переменной окружения
if "%~1"=="" (
    if defined REACT_APP_API_URL (
        set API_URL=%REACT_APP_API_URL%
    ) else (
        set API_URL=http://localhost:8000
    )
) else (
    set API_URL=%~1
)

echo 🔧 Используется API URL: %API_URL%
echo 🚀 Запуск React приложения...

REM Установка переменной окружения и запуск
set REACT_APP_API_URL=%API_URL%
call npm start
