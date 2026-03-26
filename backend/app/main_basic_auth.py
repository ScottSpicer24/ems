from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import secrets

app = FastAPI()

# Step 1: Security setup
security = HTTPBasic()

# Step 2: Hardcoded users
users_db = {
    "admin": {"username": "admin", "password": "admin123", "role": "admin"},
    "user": {"username": "user", "password": "user123", "role": "user"},
}

# Fake in-memory employee DB
employees = [
    {"id": 1, "name": "Alice"},
    {"id": 2, "name": "Bob"},
]

# Step 3: Authentication function
def get_current_user(credentials: HTTPBasicCredentials = Depends(security)):
    user = users_db.get(credentials.username)

    if not user or not secrets.compare_digest(user["password"], credentials.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Basic"},
        )

    return user

# Step 4: Admin-only check
def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user

# -----------------------------
# ROUTES
# -----------------------------

# GET all employees (any authenticated user)
@app.get("/employees", dependencies=[Depends(get_current_user)])
def get_employees():
    return employees

# GET employee by ID (any authenticated user)
@app.get("/employees/{id}", dependencies=[Depends(get_current_user)])
def get_employee(id: int):
    for emp in employees:
        if emp["id"] == id:
            return emp
    raise HTTPException(status_code=404, detail="Employee not found")

# POST employee (admin only)
@app.post("/employees", dependencies=[Depends(get_admin_user)])
def create_employee(employee: dict):
    employees.append(employee)
    return employee

# PUT employee (admin only)
@app.put("/employees/{id}", dependencies=[Depends(get_admin_user)])
def update_employee(id: int, updated: dict):
    for emp in employees:
        if emp["id"] == id:
            emp.update(updated)
            return emp
    raise HTTPException(status_code=404, detail="Employee not found")

# DELETE employee (admin only)
@app.delete("/employees/{id}", dependencies=[Depends(get_admin_user)])
def delete_employee(id: int):
    for emp in employees:
        if emp["id"] == id:
            employees.remove(emp)
            return {"message": "Deleted"}
    raise HTTPException(status_code=404, detail="Employee not found")