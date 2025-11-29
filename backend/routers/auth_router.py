# routers/auth_router.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert

from database import get_async_session
from models.models import users, roles
from schemas.schemas import UserCreate, LoginData, Token
from utils.security import hash_password, verify_password
from utils.jwt import create_access_token
from dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=Token)
async def register(user: UserCreate, session: AsyncSession = Depends(get_async_session)):
    # Проверяем, существует ли email
    result = await session.execute(select(users).where(users.c.email == user.email))
    if result.first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Получаем роль "user"
    result = await session.execute(select(roles).where(roles.c.name == "user"))
    role = result.first()
    if not role:
        raise HTTPException(status_code=500, detail="Role 'user' not found")

    # Хешируем пароль
    hashed_password = hash_password(user.password)

    # Вставляем пользователя
    stmt = insert(users).values(
        email=user.email,
        password=hashed_password,
        role_id=role.id
    ).returning(users.c.id)

    result = await session.execute(stmt)
    await session.commit()

    # Создаём токен
    # access_token = create_access_token(data={"sub": user.email, "role": role.name})
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
async def login(data: LoginData, session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(users).where(users.c.email == data.email))
    user = result.first()
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    role_result = await session.execute(select(roles).where(roles.c.id == user.role_id))
    role = role_result.first()
    if not role:
        raise HTTPException(status_code=500, detail="User role not found in database")

    # access_token = create_access_token(data={"sub": user.email, "role": role.name})
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me")
async def get_current_user_profile(
    email: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    # Получаем роль из БД
    result = await session.execute(
        select(roles.c.name).join(users).where(users.c.email == email)
    )
    role = result.scalar_one_or_none()
    if not role:
        raise HTTPException(status_code=403, detail="Role not found")

    return {
        "email": email,
        "role": role
    }
