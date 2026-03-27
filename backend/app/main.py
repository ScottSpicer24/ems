from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config.database import client
from app.routes.Employee_routes import router as employee_router
from app.routes.user_routes import router as user_router

# Import the contect manager for lifespan events startup and shutdown
asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        info = client.server_info() # Attenpt to connect to mongoDB
        print(f"Connected to MongoDB: {info}") # Init db connection
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        raise e
    
    yield
    print("Shutting down MongoDB connection")

# Insert into employee collection 
'''
Restart client to see the changes in the database. 
This is just a sample data insertion, you can remove it after verifying the connection and data insertion.

employee_collection.insert_one({
    "employeeId": "EMP001",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "position": "Software Engineer",
    "department": "Engineering",
    "salary": 80000,
    "status": "active",
    "createdAt": "2024-06-01T12:00:00Z"
})

command to run the app: uvicorn app.main:app
/docs to see the APIs in firefox
'''

app = FastAPI(title="Employee Management System API", version="1.0", lifespan=lifespan)

# Allow local frontend dev servers to call the API.
# Note: in production, tighten these origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://dq1c3mz7ccww2.cloudfront.net"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(employee_router, prefix='/employees')
app.include_router(user_router, prefix='/auth') # User authentication routes

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy"}
