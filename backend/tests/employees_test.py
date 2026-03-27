import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.utils.utils import get_current_user

'''
This allows for more reusability of the test.
Reusing the same client instance for all test cases.
 |-> This allows for passed in parameters instead of hardcoding payloads.
 |-> This allows for additition or removal of the employee from the database after each test case.
'''

@pytest.fixture
def client():
    app.dependency_overrides[get_current_user] = lambda: {"username": "admin", "role": "admin"}
    yield TestClient(app)
    app.dependency_overrides.clear()

# Test case for GET all employees /employees endpoint
def test_get_employees(client):
    response = client.get("/employees")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

# Test case for POST /employees/employee endpoint
def test_create_employee(client, employee_data):
    response = client.post("/employees/employee", json=employee_data)
    assert response.status_code == 200

    # cleanup the employee from the database
    client.delete(f"/employees/{employee_data['employeeId']}")

# Test case for PUT /employees/{employee_id} endpoint
def test_update_employee(client, employee_data):
    employee_id = employee_data["employeeId"]

    create_response = client.post("/employees/employee", json=employee_data)
    assert create_response.status_code == 200

    updated_payload = {**employee_data, "name": f"{employee_data['name']} Updated"}
    response = client.put(f"/employees/{employee_id}", json=updated_payload)
    assert response.status_code == 200

    # cleanup the employee from the database
    client.delete(f"/employees/{employee_id}")

# Test case for DELETE /employees/{employee_id} endpoint
def test_delete_employee(client, employee_data):
    employee_id = employee_data["employeeId"]

    create_response = client.post("/employees/employee", json=employee_data)
    assert create_response.status_code == 200

    response = client.delete(f"/employees/{employee_id}")
    assert response.status_code == 200


# Test case for GET /employees/{employee_id} endpoint
def test_get_employee_by_id(client, employee_data):
    employee_id = employee_data["employeeId"]

    create_response = client.post("/employees/employee", json=employee_data)
    assert create_response.status_code == 200

    response = client.get(f"/employees/{employee_id}")
    assert response.status_code == 200
    assert response.json()["employeeId"] == employee_data["employeeId"]
    assert response.json()["name"] == employee_data["name"]
    assert response.json()["email"] == employee_data["email"]
    assert response.json()["position"] == employee_data["position"]
    assert response.json()["department"] == employee_data["department"]

    # cleanup the employee from the database
    client.delete(f"/employees/{employee_id}")


# Test case for GET /employees/department/{department} endpoint
def test_get_employees_in_department(client, employee_data):
    employee_id = employee_data["employeeId"]

    create_response = client.post("/employees/employee", json=employee_data)
    assert create_response.status_code == 200

    response = client.get(f"/employees/department/{employee_data['department']}")
    assert response.status_code == 200

    # cleanup the employee from the database
    client.delete(f"/employees/{employee_id}")

# Test case for GET /health endpoint
def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200