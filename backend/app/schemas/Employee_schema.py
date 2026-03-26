# Define Employee schema for data validation and serialization
import datetime
from pydantic import BaseModel, EmailStr, Field

class Employee(BaseModel):
    employeeId: str
    name: str
    email: EmailStr
    position: str
    department: str
    status: str
    createdAt: datetime.datetime | None = None


class EmployeeResponse(BaseModel):
    id: str
    createdAt: datetime.datetime 

class EmployeeCreate(BaseModel):
    employeeId: str
    name: str
    email: EmailStr
    position: str
    department: str
    status: str
    createdAt: datetime.datetime = Field(default_factory=lambda: datetime.datetime.now(datetime.UTC))