from fastapi.exceptions import HTTPException
from app.model.Employee_model import (
    get_all_employees, 
    post_employee, 
    update_employee, 
    delete_employee, 
    get_employee,
    get_employees_in_department,
)
from app.schemas.Employee_schema import Employee, EmployeeCreate

# GET request for all employees
def fetch_all_employees():
    employees = get_all_employees() # returns a list 
    return [Employee(**emp) for emp in employees] # Convert each employee dict to an EmployeeResponse object

# POST request to create a new employee
def create_new_employee(employee_data: EmployeeCreate):
    # Check if duplicate employee exist
    existing_employees = get_all_employees()
    if any(emp['employeeId'] == employee_data.employeeId for emp in existing_employees):
        raise HTTPException(status_code=409, detail="Employee with this ID already exists.")

    # Insert the employee data as dict into the database
    post_employee(employee_data.model_dump())
    return {"message": "Employee created successfully", "employee": employee_data}

def update_existing_employee(employee_id: str, employee_data: EmployeeCreate):
    # Check if the employee exists
    existing_employees = get_all_employees()
    if not any(emp['employeeId'] == employee_id for emp in existing_employees):
        raise HTTPException(status_code=404, detail="Employee with this ID was not found.")

    # Update the employee data
    update_employee(employee_id, employee_data.model_dump())
    return {"message": "Employee updated successfully", "employee": employee_data}

# Delete an existing employee
def delete_existing_employee(employee_id: str):
    # Check if the employee exists
    existing_employees = get_all_employees()
    if not any(emp['employeeId'] == employee_id for emp in existing_employees):
        raise HTTPException(status_code=404, detail="Employee with this ID was not found.")

    delete_employee(employee_id)
    return {"message": "Employee deleted successfully"}

def fetch_employee(employee_id: str):
    employee = get_employee(employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee with this ID was not found.")
    return Employee(**employee)

def fetch_employees_in_department(department: str):
    employees = get_employees_in_department(department)
    return [Employee(**emp) for emp in employees]


