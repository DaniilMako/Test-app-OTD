# backend/dependencies.py
from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_async_session
from models.models import users, roles
from utils.jwt import decode_access_token


def get_current_user(token: str = Header(..., alias="Authorization")):
    if not token.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    token = token.split(" ")[1]

    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    # Возвращаем email — роль будет проверяться в БД
    return email


async def admin_only(
    email: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    # Теперь проверяем роль в БД
    result = await session.execute(
        select(roles.c.name).join(users).where(users.c.email == email)
    )
    user_role = result.scalar_one_or_none()

    if not user_role:
        raise HTTPException(status_code=403, detail="User role not found")

    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    return email
