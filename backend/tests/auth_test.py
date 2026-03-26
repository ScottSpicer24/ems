import os
import pytest
from datetime import datetime, timedelta, timezone
from jose import jwt

SECRET_KEY = os.getenv("SECRET_KEY", "testsecret")
ALGORITHM = os.getenv("ALGORITHM", "HS256")


def create_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    to_encode.update({"exp": datetime.now(timezone.utc) + expires_delta})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@pytest.mark.asyncio
async def test_register_user_success(client):
    response = await client.post("/auth/register", json={
        "username": "newuser",
        "email": "newuser@test.com",
        "password": "StrongPass123!",
        "role": "user"
    })

    assert response.status_code == 200
    assert response.json()["message"] == "User created successfully"


@pytest.mark.asyncio
async def test_register_duplicate_username_returns_409(client, create_user):
    await create_user(username="duplicate")

    response = await client.post("/auth/register", json={
        "username": "duplicate",
        "email": "dup@test.com",
        "password": "StrongPass123!",
        "role": "user"
    })

    assert response.status_code == 409


@pytest.mark.asyncio
async def test_login_success_returns_jwt(client, create_user):
    await create_user(username="loginuser", password="StrongPass123!")

    response = await client.post("/auth/login", json={
        "username": "loginuser",
        "password": "StrongPass123!"
    })

    assert response.status_code == 200
    body = response.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password_returns_401(client, create_user):
    await create_user(username="user1", password="CorrectPass123!")

    response = await client.post("/auth/login", json={
        "username": "user1",
        "password": "WrongPass"
    })

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"


@pytest.mark.asyncio
async def test_protected_route_without_token_returns_401(client):
    response = await client.get("/profile")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_protected_route_with_valid_token_succeeds(client, create_user):
    user = await create_user(username="validuser")

    token = create_token({
        "username": user["username"],
        "role": user["role"],
        "userid": user["_id"]
    }, timedelta(minutes=30))

    response = await client.get(
        "/profile",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    assert response.json()["username"] == "validuser"


@pytest.mark.asyncio
async def test_admin_route_with_user_role_returns_403(client, create_user):
    user = await create_user(username="normaluser", role="user")

    token = create_token({
        "username": user["username"],
        "role": "user",
        "userid": user["_id"]
    }, timedelta(minutes=30))

    response = await client.get(
        "/admin",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 403