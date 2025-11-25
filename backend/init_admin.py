# backend/init_admin.py
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, insert
from models.models import users, roles
from utils.security import hash_password
from config import DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME

DATABASE_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def init_admin():
    async with AsyncSessionLocal() as session:
        admin_email = "admin@example.com"
        admin_password = "admin"
        
        # Проверяем, существует ли уже админ
        result = await session.execute(
            select(users).where(users.c.login == admin_email)
        )
        existing_admin = result.first()
        
        if existing_admin:
            print(f"ℹ️  Пользователь {admin_email} уже существует, пропускаем создание")
            return
        
        # Получаем роль admin
        role_result = await session.execute(
            select(roles).where(roles.c.name == "admin")
        )
        admin_role = role_result.first()
        
        if not admin_role:
            print("❌ Роль 'admin' не найдена. Сначала запустите init_roles.py")
            return
        
        # Хешируем пароль
        hashed_password = hash_password(admin_password)
        
        # Создаём админа
        stmt = insert(users).values(
            login=admin_email,
            password=hashed_password,
            role_id=admin_role.id
        )
        await session.execute(stmt)
        await session.commit()
        
        print(f"✅ Админ создан:")
        print(f"   Email: {admin_email}")
        print(f"   Пароль: {admin_password}")
        print(f"   Роль: admin")

if __name__ == "__main__":
    asyncio.run(init_admin())

