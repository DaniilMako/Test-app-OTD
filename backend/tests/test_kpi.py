from fastapi.testclient import TestClient
from database import get_db
from models import PageView
import pytest

def test_record_kpi(client, db):
    # Логин
    login = client.post(
        "/api/auth/login",
        data={"username": "admin@example.com", "password": "admin"}
    )
    assert login.status_code == 200
    token = login.json()["access_token"]

    # Получаем ID страницы
    page_resp = client.get("/admin/pages/paths", headers={"Authorization": f"Bearer {token}"})
    assert page_resp.status_code == 200
    paths = page_resp.json()
    if not paths:
        pytest.skip("Нет страниц для теста")

    page_id = paths[0]["id"]

    # Отправляем KPI
    response = client.post(
        f"/admin/kpi/{page_id}/time",
        json={"time_seconds": 15.5, "user_agent": "test-agent"}
    )
    assert response.status_code == 200

    # Проверяем, что данные записались в БД
    kpi_record = db.query(PageView).filter(PageView.page_id == page_id).first()
    assert kpi_record is not None
    assert kpi_record.time_seconds == 15.5
    assert kpi_record.user_agent == "test-agent"
