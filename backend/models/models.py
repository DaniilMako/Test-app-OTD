# models/models.py
from sqlalchemy import MetaData, Column, Integer, String, ForeignKey, Table

metadata = MetaData()

pages = Table(
    "pages",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("title", String, default=""),
    Column("content", String, default=""),
    Column("path", String, unique=True, nullable=False),
)

kpi = Table(
    "kpi",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("page_id", Integer, ForeignKey("pages.id")),
    Column("counter", Integer, default=0),
    Column("time_spent", Integer, default=0),
)

# Таблицы для авторизации
roles = Table(
    "roles",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("name", String, unique=True, nullable=False),
)

users = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("email", String, unique=True, nullable=False),
    Column("password", String, nullable=False),  # sha256
    Column("role_id", Integer, ForeignKey("roles.id")),
)
