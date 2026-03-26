import pytest


@pytest.mark.asyncio
async def test_create_user_in_db(test_db):
    user = {
        "username": "dbuser",
        "email": "dbuser@test.com",
        "password": "hashedpassword",
        "role": "user"
    }

    result = await test_db["users"].insert_one(user)

    saved_user = await test_db["users"].find_one({"_id": result.inserted_id})

    assert saved_user is not None
    assert saved_user["username"] == "dbuser"


@pytest.mark.asyncio
async def test_user_collection_is_isolated(test_db):
    users = await test_db["users"].find().to_list(length=100)
    assert users == []