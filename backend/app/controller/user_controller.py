from app.model.user_model import create_user, get_user_by_username, add_activity
from app.utils.utils import hash_password, verify_password, create_access_token
from fastapi import HTTPException

# Register new user
def register_user(user):
    existing_user = get_user_by_username(user.username)

    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_password = hash_password(user.password)

    user_dict = {
        "username": user.username,
        "email": user.email,
        "password": hashed_password,
        "role": user.role,
        "activitylog": []
    }

    user_id = create_user(user_dict)

    # activity log is keyed by username in the database layer
    add_activity(user.username, "User registered")

    return {"message": "User created successfully"}

# Login user
def login_user(user):
    db_user = get_user_by_username(user.username)

    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "username": db_user["username"],
        "role": db_user["role"]
    })

    add_activity(db_user["username"], "User logged in")

    # Include role in response so the frontend can store it without decoding JWT.
    return {"access_token": token, "token_type": "bearer", "role": db_user["role"]}