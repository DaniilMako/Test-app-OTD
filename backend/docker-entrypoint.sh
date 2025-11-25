#!/bin/sh
set -e

DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"

echo "Waiting for Postgres at ${DB_HOST}:${DB_PORT}..."
until nc -z "${DB_HOST}" "${DB_PORT}"; do
  sleep 1
done

alembic upgrade head
python init_roles.py || true
python init_admin.py || true

exec uvicorn main:app --host 0.0.0.0 --port 8000
 