from fastapi.testclient import TestClient
import pytest

def test_get_page_paths(client):
    # Сначала логинимся
    login = client.post(
        "/api/auth/login",
        data={"username": "admin@example.com", "password": "admin"}
    )
    assert login.status_code == 200
    token = login.json()["access_token"]

    # Делаем запрос с токеном
    response = client.get(
        "/admin/pages/paths",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    # Проверяем, что есть хотя бы один путь
    assert len(response.json()) > 0
