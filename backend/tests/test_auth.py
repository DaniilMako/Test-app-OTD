from fastapi.testclient import TestClient
import pytest

def test_login_success(client):
    response = client.post(
        "/api/auth/login",
        data={"username": "admin@example.com", "password": "admin"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"

def test_login_invalid_credentials(client):
    response = client.post(
        "/api/auth/login",
        data={"username": "wrong@example.com", "password": "wrong"}
    )
    assert response.status_code == 401
    assert "detail" in response.json()
