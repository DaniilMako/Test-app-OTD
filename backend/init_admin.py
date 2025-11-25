# backend/init_admin.py
import asyncio
import hashlib
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, insert

# Импортируем модели
from models.models import users, roles

# Импортируем настройки БД
from config import DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME

from dotenv import load_dotenv
import os

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY не найден в .env файле")

DATABASE_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

def hash_password(password: str) -> str:
    """Хэшируем пароль через SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

async def init_admin():
    async with AsyncSessionLocal() as session:
        # 1. Убедимся, что роль 'admin' существует
        result = await session.execute(select(roles).where(roles.c.name == "admin"))
        admin_role = result.first()
        if not admin_role:
            stmt = insert(roles).values(name="admin")
            await session.execute(stmt)
            await session.commit()
            # Нужно заново получить role_id
            result = await session.execute(select(roles).where(roles.c.name == "admin"))
            admin_role = result.first()

        admin_role_id = admin_role.id

        # 2. Проверим, существует ли админ
        result = await session.execute(
            select(users).where(users.c.email == "admin@example.com")
        )
        admin_user = result.first()

        if not admin_user:
            # Создаём админа
            stmt = insert(users).values(
                email="admin@example.com",
                password=hash_password("admin"),  # Пароль: admin
                role_id=admin_role_id
            )
            await session.execute(stmt)
            print("✅ Администратор создан: admin@example.com / пароль: admin")
        else:
            print("ℹ️  Администратор уже существует")

        await session.commit()

if __name__ == "__main__":
    asyncio.run(init_admin())
