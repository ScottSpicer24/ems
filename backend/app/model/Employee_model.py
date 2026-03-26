# Query the database for employee information
from app.config.database import employee_collection

# Get all enmployees from the database
def get_all_employees():
    return list(employee_collection.find({}, {"_id": 0})) # Exclude the MongoDB _id field from the results

# POST request to create a new employee
def post_employee(employee_data: dict):
    return employee_collection.insert_one(employee_data) # Insert the employee data into the database

# Update an existing employee
def update_employee(employee_id: str, employee_data: dict):
    #                                      filter to find employee,     The update on what to set it too
    return employee_collection.update_one({"employeeId": employee_id}, {"$set": employee_data}) # Update the employee data in the database

# Delete an existing employee
def delete_employee(employee_id: str):
    return employee_collection.delete_one({"employeeId": employee_id}) # Delete the employee data from the database

# Get an employee by ID
def get_employee(employee_id: str):
    #                                    filter to find employee,    exclude the _id field
    return employee_collection.find_one({"employeeId": employee_id}, {"_id": 0}) # Get the employee data from the database

# Get all employees in a department
def get_employees_in_department(department: str):
    #                                    filter to find employees in department,    exclude the _id field
    return list(employee_collection.find({"department": department}, {"_id": 0})) # Get the employee data from the database