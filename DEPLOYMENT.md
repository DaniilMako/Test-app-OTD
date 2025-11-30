# 🚀 Инструкция по развертыванию на Cloud.ru VM

Это руководство поможет вам развернуть приложение на виртуальной машине Cloud.ru с публичным IP-адресом.

## 📋 Требования

- Виртуальная машина Cloud.ru с публичным IP
- Ubuntu/Debian Linux (или другая Linux-система)
- Доступ по SSH к виртуальной машине
- PostgreSQL установлен и запущен

---

## 🔧 Шаг 1: Подготовка сервера

### 1.1 Подключение к серверу

```bash
ssh your-user@your-server-ip
```

### 1.2 Обновление системы

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.3 Установка необходимых пакетов

```bash
# Python 3 и pip
sudo apt install -y python3 python3-pip python3-venv

# Node.js и npm (для React)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL (если еще не установлен)
sudo apt install -y postgresql postgresql-contrib

# Дополнительные инструменты
sudo apt install -y git nginx
```

---

## 📦 Шаг 2: Установка приложения

### 2.1 Клонирование репозитория

```bash
cd ~
git clone <your-repo-url> Test-app-OTD
cd Test-app-OTD
```

Или загрузите файлы проекта на сервер через SCP/SFTP.

### 2.2 Настройка бэкенда

```bash
cd backend

# Создание виртуального окружения
python3 -m venv venv
source venv/bin/activate

# Установка зависимостей
pip install -r requirements.txt
```

### 2.3 Настройка базы данных

```bash
# Подключение к PostgreSQL
sudo -u postgres psql

# В консоли PostgreSQL выполните:
CREATE DATABASE otd;
CREATE USER admin WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE otd TO admin;
\q
```

### 2.4 Создание файла .env для бэкенда

```bash
cd ~/Test-app-OTD/backend
cp .env.example .env
nano .env
```

Настройте файл `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=otd
DB_USER=admin
DB_PASS=password

# ⚠️ ВАЖНО: Укажите публичный IP или домен вашего сервера
# Замените YOUR_PUBLIC_IP на реальный IP вашей VM
CORS_ORIGINS=http://YOUR_PUBLIC_IP:3000,http://localhost:3000
```

**Пример:**
```env
CORS_ORIGINS=http://123.45.67.89:3000,http://localhost:3000
```

### 2.5 Применение миграций

```bash
cd ~/Test-app-OTD/backend
source venv/bin/activate
alembic upgrade head
```

### 2.6 Инициализация данных (опционально)

```bash
# Создание администратора и ролей
python init_roles.py
python init_admin.py
```

### 2.7 Настройка фронтенда

```bash
cd ~/Test-app-OTD/frontend
npm install
```

---

## 🔥 Шаг 3: Запуск приложения

### Вариант A: Запуск через скрипты (рекомендуется)

```bash
cd ~/Test-app-OTD/scripts
chmod +x *.sh

# Запуск всего приложения
# Замените YOUR_PUBLIC_IP на реальный IP
./start-all.sh http://YOUR_PUBLIC_IP:8000
```

### Вариант B: Запуск в отдельных терминалах

**Терминал 1 - Backend:**
```bash
cd ~/Test-app-OTD/backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Терминал 2 - Frontend:**
```bash
cd ~/Test-app-OTD/frontend
# Замените YOUR_PUBLIC_IP на реальный IP
REACT_APP_API_URL=http://YOUR_PUBLIC_IP:8000 npm start
```

### Вариант C: Запуск в фоне с nohup

**Backend:**
```bash
cd ~/Test-app-OTD/backend
source venv/bin/activate
nohup uvicorn main:app --host 0.0.0.0 --port 8000 > backend.log 2>&1 &
```

**Frontend:**
```bash
cd ~/Test-app-OTD/frontend
nohup env REACT_APP_API_URL=http://YOUR_PUBLIC_IP:8000 npm start > frontend.log 2>&1 &
```

---

## 🔒 Шаг 4: Настройка файрвола

Убедитесь, что порты открыты в файрволе Cloud.ru и на самой VM:

```bash
# Если используется ufw
sudo ufw allow 8000/tcp  # Backend
sudo ufw allow 3000/tcp  # Frontend
sudo ufw reload

# Или для iptables
sudo iptables -A INPUT -p tcp --dport 8000 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
```

**⚠️ ВАЖНО:** Также настройте правила файрвола в панели Cloud.ru для вашей виртуальной машины!

---

## 🌐 Шаг 5: Проверка доступности

После запуска приложение должно быть доступно:

- **Frontend:** `http://YOUR_PUBLIC_IP:3000`
- **Backend API:** `http://YOUR_PUBLIC_IP:8000`
- **API Docs:** `http://YOUR_PUBLIC_IP:8000/docs`

Проверьте из браузера или с другого компьютера:

```bash
curl http://YOUR_PUBLIC_IP:8000/docs
```

---

## 🔄 Шаг 6: Автозапуск при перезагрузке (опционально)

### Создание systemd сервисов

**Backend сервис:**

```bash
sudo nano /etc/systemd/system/otd-backend.service
```

Содержимое:

```ini
[Unit]
Description=OTD Backend Service
After=network.target postgresql.service

[Service]
Type=simple
User=your-user
WorkingDirectory=/home/your-user/Test-app-OTD/backend
Environment="PATH=/home/your-user/Test-app-OTD/backend/venv/bin"
ExecStart=/home/your-user/Test-app-OTD/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Frontend сервис:**

```bash
sudo nano /etc/systemd/system/otd-frontend.service
```

Содержимое:

```ini
[Unit]
Description=OTD Frontend Service
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/home/your-user/Test-app-OTD/frontend
Environment="REACT_APP_API_URL=http://YOUR_PUBLIC_IP:8000"
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Активация сервисов:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable otd-backend
sudo systemctl enable otd-frontend
sudo systemctl start otd-backend
sudo systemctl start otd-frontend

# Проверка статуса
sudo systemctl status otd-backend
sudo systemctl status otd-frontend
```

---

## 🛠️ Устранение неполадок

### Проблема: CORS ошибки

**Решение:** Убедитесь, что в `backend/.env` указан правильный `CORS_ORIGINS` с вашим публичным IP.

### Проблема: Порт недоступен извне

**Решение:**
1. Проверьте файрвол на VM
2. Проверьте правила файрвола в панели Cloud.ru
3. Убедитесь, что сервер слушает на `0.0.0.0`, а не `127.0.0.1`

### Проблема: База данных недоступна

**Решение:**
1. Проверьте, что PostgreSQL запущен: `sudo systemctl status postgresql`
2. Проверьте настройки в `.env`
3. Проверьте права доступа пользователя БД

### Проблема: React не подключается к API

**Решение:**
1. Убедитесь, что `REACT_APP_API_URL` установлен правильно
2. Проверьте, что бэкенд запущен и доступен
3. Проверьте CORS настройки

---

## 📝 Полезные команды

```bash
# Просмотр логов бэкенда (если запущен через nohup)
tail -f ~/Test-app-OTD/backend/backend.log

# Просмотр логов фронтенда
tail -f ~/Test-app-OTD/frontend/frontend.log

# Остановка процессов
pkill -f "uvicorn main:app"
pkill -f "react-scripts"

# Проверка открытых портов
sudo netstat -tulpn | grep -E '8000|3000'
```

---

## ✅ Чеклист развертывания

- [ ] Установлены все необходимые пакеты
- [ ] Клонирован/загружен проект
- [ ] Настроена база данных PostgreSQL
- [ ] Создан и настроен файл `backend/.env`
- [ ] Применены миграции Alembic
- [ ] Установлены зависимости (Python и Node.js)
- [ ] Настроен CORS с публичным IP
- [ ] Открыты порты в файрволе
- [ ] Запущены бэкенд и фронтенд
- [ ] Приложение доступно извне
- [ ] (Опционально) Настроен автозапуск через systemd

---

## 🎉 Готово!

Ваше приложение должно быть доступно по адресу `http://YOUR_PUBLIC_IP:3000`

Для вопросов и поддержки обращайтесь к документации проекта.
