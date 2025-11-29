from fastapi import FastAPI, File, UploadFile
from fastapi.responses import StreamingResponse
from PIL import Image, ImageOps  # для работы с изображениями
import io  # Для работы с байтовыми потоками (буферами)
import requests  # Для HTTP-запросов к внешним API
from fastapi.middleware.cors import CORSMiddleware  # Для разрешения запросов с React

from routers.admin_router import router as admin_router
from routers.auth_router import router as auth_router
# Создаём экземпляр приложения FastAPI
app = FastAPI()

app.include_router(admin_router)
app.include_router(auth_router)

"""
# Настраиваем CORS (Cross-Origin Resource Sharing)
# Позволяет React (на http://localhost:3000) делать запросы к этому серверу
"""
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Только с этого адреса можно обращаться
    allow_credentials=True,
    allow_methods=["*"],                       # Разрешаем все методы: GET, POST и т.д.
    allow_headers=["*"],                       # Разрешаем все заголовки
)
"""
# Промежуточное ПО (middleware) для разрешения отображения в iframe
# Нужно, чтобы ReDoc и Swagger UI можно было встроить во вкладку в React
"""
@app.middleware("http")
async def add_csp_header(request, call_next):
    response = await call_next(request)
    
    # Разрешаем показывать страницу во frame/iframe (даже с другого домена)
    response.headers["X-Frame-Options"] = "ALLOWALL"
    
    # Более современный способ: разрешаем встраивание с localhost:3000
    response.headers["Content-Security-Policy"] = "frame-ancestors 'self' http://localhost:3000;"
    
    return response
"""
# === ЭНДПОИНТ 1: Получение постов ===
# Метод: GET
# Адрес: http://localhost:8000/posts
# Что делает: запрашивает посты с JSONPlaceholder и возвращает их клиенту
"""
@app.get("/posts")
async def get_posts():
    # Делаем GET-запрос к внешнему API
    response = requests.get("https://jsonplaceholder.typicode.com/posts")
    # Возвращаем JSON с постами
    return response.json()

""" === ЭНДПОИНТ 2: Инвертирование изображения ===
# Метод: POST
# Адрес: http://localhost:8000/invert-image
# Что делает: принимает изображение, инвертирует цвета (как фото-негатив), возвращает как PNG
"""
@app.post("/invert-image")
async def invert_image(file: UploadFile = File(...)):
    """
    Принимает загруженное изображение и возвращает его инвертированную версию.
    
    Шаги:
    1. Открываем изображение
    2. Конвертируем в RGB (если нужно)
    3. Инвертируем цвета
    4. Сохраняем в буфер и возвращаем как PNG
    """
    # Открываем изображение из загруженного файла
    image = Image.open(file.file)
    
    # Если изображение не в RGB (например, PNG с прозрачностью), конвертируем
    if image.mode != "RGB":
        image = image.convert("RGB")
    
    # Инвертируем цвета (делаем "негатив")
    inverted = ImageOps.invert(image)
    
    # Создаём буфер (виртуальный файл в памяти)
    buf = io.BytesIO()
    
    # Сохраняем инвертированное изображение в буфер как PNG
    inverted.save(buf, format="PNG")
    
    # Перемещаем указатель в начало буфера
    buf.seek(0)
    
    # Возвращаем изображение как поток (StreamingResponse)
    return StreamingResponse(buf, media_type="image/png")

# @app.on_event("startup")
# async def startup_event():
#     async with engine.begin() as conn:
#         # Создаём все таблицы, если ещё не созданы
#         await conn.run_sync(metadata.create_all)

#     # Добавляем роли, если их нет
#     async with engine.connect() as conn:
#         for role_name in ['user', 'admin']:
#             result = await conn.execute(
#                 "SELECT 1 FROM roles WHERE name = :name",
#                 {"name": role_name}
#             )
#             if not result.first():
#                 await conn.execute(
#                     "INSERT INTO roles (name) VALUES (:name)",
#                     {"name": role_name}
#                 )
#                 await conn.commit()
#                 print(f"✅ Добавлена роль: {role_name}")
