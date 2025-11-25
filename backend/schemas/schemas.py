# schemas/schemas.py
from pydantic import BaseModel

class Page(BaseModel):
    title: str = ""
    content: str = ""
    path: str = ""

class Kpi(BaseModel):
    page_id: int
    counter: int
    time_spent: int

# === Схемы для авторизации ===

class UserCreate(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginData(BaseModel):
    email: str
    password: str
