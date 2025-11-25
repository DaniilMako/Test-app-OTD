# backend/init_roles.py
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, insert
from models.models import roles

# Импортируем URL из config
from config import DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME

DATABASE_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def init_roles():
    async with AsyncSessionLocal() as session:
        for role_name in ['user', 'admin']:
            result = await session.execute(select(roles).where(roles.c.name == role_name))
            if not result.first():
                stmt = insert(roles).values(name=role_name)
                await session.execute(stmt)
                print(f"✅ Роль '{role_name}' создана")
        await session.commit()
    print("🔧 Инициализация ролей завершена")

if __name__ == "__main__":
    asyncio.run(init_roles())
