#!/bin/sh
set -e

DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"

echo "Waiting for Postgres at ${DB_HOST}:${DB_PORT}..."
until nc -z "${DB_HOST}" "${DB_PORT}"; do
  sleep 1
done

echo "Applying database migrations..."
alembic upgrade head

echo "Initializing roles..."
python init_roles.py

echo "Initializing admin..."
python init_admin.py

exec uvicorn main:app --reload
# exec uvicorn main:app --host 0.0.0.0 --port 8000
