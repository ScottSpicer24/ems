# API routes are defined here for employee management system
from fastapi import APIRouter, Depends
from fastapi import HTTPException
from app.controller.Employee_controller import (
    fetch_all_employees,
    create_new_employee,
    update_existing_employee,
    delete_existing_employee,
    fetch_employee,
    fetch_employees_in_department,
)
from app.schemas.Employee_schema import Employee, EmployeeCreate
from app.utils.utils import admin_required, role_required

router = APIRouter()

# GET endpoint to list all employees
@router.get("/", response_model=list[Employee], dependencies=[Depends(role_required(["admin", "user"]))]) # 
def get_all_employees():
    return fetch_all_employees()

@router.post("/employee", response_model=dict, dependencies=[Depends(role_required(["admin"]))])
def create_employee(employee: EmployeeCreate):
    try:
        return create_new_employee(employee)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.put("/{employee_id}", response_model=dict, dependencies=[Depends(role_required(["admin"]))])
def update_employee(employee_id: str, employee: EmployeeCreate):
    try:
        return update_existing_employee(employee_id, employee)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

@router.delete("/{employee_id}", response_model=dict, dependencies=[Depends(role_required(["admin"]))])
def delete_employee(employee_id: str):
    try:
        return delete_existing_employee(employee_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

@router.get("/{employee_id}", response_model=Employee, dependencies=[Depends(role_required(["admin", "user"]))])
def get_employee(employee_id: str):
    try:
        return fetch_employee(employee_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

@router.get("/department/{department}", response_model=list[Employee], dependencies=[Depends(role_required(["admin", "user"]))])
def get_employees_in_department(department: str):
    try:
        return fetch_employees_in_department(department)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc