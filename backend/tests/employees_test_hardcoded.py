import pytest
from datetime import datetime, UTC
from uuid import uuid4
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Test cases for GET /employees endpoint
def test_get_employees():
    response = client.get("/employees")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


# Test case for POST /employees endpoint 
def test_create_employee():
    employee_id = f"EMP-{uuid4().hex[:8]}"
    payload = {
        "employeeId": employee_id, 
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "position": "Software Engineer",
        "department": "Engineering",
        "status": "Active",
        "createdAt": datetime.now(UTC).isoformat()
    }
    response = client.post("/employees/employee", json=payload)
    assert response.status_code == 200 # condition 1


# Test case for updating an employee
def test_update_employee():
    payload = {
        "employeeId": "EMP002",
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "position": "Software Engineer",
        "department": "Engineering",
        "status": "Active",
        "createdAt": datetime.now(UTC).isoformat() # This is what will change.
    }
    response = client.put("/employees/EMP002", json=payload)
    assert response.status_code == 200 # condition 1


# Test case for deleting an employee
def test_delete_employee():
    response = client.delete("/employees/EMP002")
    assert response.status_code == 200 # condition 1
    
    payload = {
        "employeeId": "EMP002",
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "position": "Software Engineer",
        "department": "Engineering",
        "status": "Active",
        "createdAt": datetime.now(UTC).isoformat() # This is what will change.
    }
    response = client.post("/employees/employee", json=payload)

# Test GET an employee by ID
def test_get_employee_by_id():
    response = client.get("/employees/EMP001")
    assert response.status_code == 200 # condition 1
    assert response.json()['employeeId'] == "EMP001" # condition 2
    assert response.json()['name'] == "John Doe" # condition 3
    assert response.json()['email'] == "john.doe@example.com" # condition 4
    assert response.json()['position'] == "Software Engineer" # condition 5
    assert response.json()['department'] == "Engineering" # condition 6

# Test GET all employees in a department
def test_get_employees_in_department():
    response = client.get("/employees/department/Engineering")
    assert response.status_code == 200 # condition 1