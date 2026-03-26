import os
import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from httpx import AsyncClient
from motor.motor_asyncio import AsyncIOMotorClient

from app.main import app
from app.utils.utils import hash_password


# ==============================
# CLI OPTIONS (UNCHANGED)
# ==============================

def pytest_addoption(parser):
    parser.addoption("--empid", action="store", default="EMP-12345678")
    parser.addoption("--empname", action="store", default="Test User")
    parser.addoption("--empemail", action="store", default="test.user@example.com")
    parser.addoption("--empposition", action="store", default="Developer Intern")
    parser.addoption("--empdepartment", action="store", default="Engineering")
    parser.addoption("--empstatus", action="store", default="Active")
    parser.addoption("--empcreatedat", action="store", default="2024-06-01T12:00:00Z")


@pytest.fixture
def employee_data(request):
    return {
        "employeeId": request.config.getoption("--empid"),
        "name": request.config.getoption("--empname"),
        "email": request.config.getoption("--empemail"),
        "position": request.config.getoption("--empposition"),
        "department": request.config.getoption("--empdepartment"),
        "status": request.config.getoption("--empstatus"),
        "createdAt": request.config.getoption("--empcreatedat"),
    }


# ==============================
# SYNC CLIENT (for old tests)
# ==============================

@pytest.fixture
def client_sync():
    return TestClient(app)


# ==============================
# ASYNC DB CONFIG (NEW)
# ==============================

TEST_DB_NAME = "test_db"
MONGO_URL = os.getenv("MONGO_URI")


@pytest_asyncio.fixture(scope="session")
def event_loop():
    import asyncio
    loop = asyncio.get_event_loop()
    yield loop


@pytest_asyncio.fixture(scope="session")
async def db_client():
    client = AsyncIOMotorClient(MONGO_URL)
    yield client
    client.close()


@pytest_asyncio.fixture
async def test_db(db_client):
    db = db_client[TEST_DB_NAME]
    yield db
    await db.drop_collection("users")


# ==============================
# ASYNC CLIENT (for auth tests)
# ==============================

@pytest_asyncio.fixture
async def client(test_db):
    # attach test DB to app
    app.state._db = test_db

    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


# ==============================
# USER FACTORY (NEW)
# ==============================

@pytest_asyncio.fixture
async def create_user(test_db):
    async def _create_user(username="testuser", password="StrongPass123!", role="user"):
        user = {
            "username": username,
            "email": f"{username}@test.com",
            "password": hash_password(password),
            "role": role,
        }
        result = await test_db["users"].insert_one(user)
        user["_id"] = str(result.inserted_id)
        return user

    return _create_user