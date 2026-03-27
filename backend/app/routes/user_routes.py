from fastapi import APIRouter, Depends
from app.schemas.user_schema import UserCreate, UserLogin
from app.controller.user_controller import register_user, login_user, logout_user
from app.utils.utils import get_current_user, oauth2_scheme
from app.model.user_model import add_activity

router = APIRouter()

@router.post("/register")
def register(user: UserCreate):
    return register_user(user)

@router.post("/login")
def login(user: UserLogin):
    return login_user(user)

@router.post("/logout")
def logout(current_user: dict = Depends(get_current_user), token: str = Depends(oauth2_scheme)):
    return logout_user(token, current_user["username"])

'''# Example protected route
@router.get("/profile")
def profile(current_user: dict = Depends(get_current_user)):
    add_activity(current_user["userid"], "Viewed profile")
    return current_user'''