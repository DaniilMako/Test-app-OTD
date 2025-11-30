from dotenv import load_dotenv
import os

load_dotenv()

DB_HOST = os.environ.get("DB_HOST")
DB_PORT = os.environ.get("DB_PORT")
DB_NAME = os.environ.get("DB_NAME")
DB_USER = os.environ.get("DB_USER")
DB_PASS = os.environ.get("DB_PASS")

# CORS настройки
# Разрешенные источники (origins) для CORS
# Можно указать несколько через запятую или "*" для всех
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")