#!/bin/bash
# Скрипт запуска всего приложения (бэкенд + фронтенд)
# Использование: ./start-all.sh [API_URL] [BACKEND_PORT] [FRONTEND_PORT]
# Пример: ./start-all.sh http://your-server-ip:8000 8000 3000

# Параметры
API_URL=${1:-"http://localhost:8000"}
BACKEND_PORT=${2:-8000}
FRONTEND_PORT=${3:-3000}

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🚀 Запуск приложения..."
echo "📡 API URL: $API_URL"
echo "🔧 Backend порт: $BACKEND_PORT"
echo "🔧 Frontend порт: $FRONTEND_PORT"
echo ""

# Функция для остановки процессов при выходе
cleanup() {
    echo ""
    echo "🛑 Остановка процессов..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Запуск бэкенда в фоне
echo "🔧 Запуск бэкенда..."
cd "$PROJECT_DIR/backend" || exit 1
if [ -d "venv" ]; then
    source venv/bin/activate
    uvicorn main:app --host 0.0.0.0 --port "$BACKEND_PORT" &
    BACKEND_PID=$!
    echo "✅ Backend запущен (PID: $BACKEND_PID)"
else
    echo "❌ Виртуальное окружение не найдено"
    exit 1
fi

# Небольшая задержка перед запуском фронтенда
sleep 2

# Запуск фронтенда
echo "🔧 Запуск фронтенда..."
cd "$PROJECT_DIR/frontend" || exit 1
REACT_APP_API_URL=$API_URL PORT=$FRONTEND_PORT npm start &
FRONTEND_PID=$!
echo "✅ Frontend запущен (PID: $FRONTEND_PID)"
echo ""
echo "✅ Приложение запущено!"
echo "📡 Backend: http://0.0.0.0:$BACKEND_PORT"
echo "📡 Frontend: http://0.0.0.0:$FRONTEND_PORT"
echo ""
echo "Нажмите Ctrl+C для остановки"

# Ожидание завершения
wait
