from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class ActivityLog(BaseModel):
    action: str
    timestamp: datetime

class User(BaseModel):
    username: str
    email: EmailStr
    role: str

class UserCreate(User):
    # Registration payload includes credentials plus basic profile fields.
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    userid: str
    activitylog: Optional[List[ActivityLog]] = []