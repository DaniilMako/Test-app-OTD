FROM python:3.11-slim

WORKDIR /app

# Установка netcat — важно для ожидания БД
RUN apt-get update && \
    apt-get install -y netcat && \
    apt-get clean

# Копируем зависимости
COPY requirements.txt .
RUN pip install -r requirements.txt

# Копируем всё
COPY . .

CMD ["sh", "docker-entrypoint.sh"]
