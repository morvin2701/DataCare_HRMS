from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models
import utils
import datetime
from pydantic import BaseModel
from typing import List, Optional

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="DataCare HRMS Face Recognition API")

# CORS setup - Allow all origins for cross-device access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Must be False when using allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    # Health check endpoint
    return {"status": "ok", "message": "DataCare HRMS Backend is running"}

# Pydantic models for responses
class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    department: Optional[str] = "General"
    password: Optional[str] = "123456"

    class Config:
        orm_mode = True

class AttendanceResponse(BaseModel):
    id: int
    user_id: int
    timestamp: datetime.datetime
    type: str
    user_name: str
    department: Optional[str] = "General"

    class Config:
        orm_mode = True

@app.post("/register", response_model=UserResponse)
async def register_user(
    name: str = Form(...),
    email: str = Form(...),
    role: str = Form("employee"),
    department: str = Form("General"),
    password: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Check if user already exists
    existing_user = db.query(models.User).filter(models.User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # DEBUG: Print received password
    print(f"DEBUG: Received password from frontend: '{password}'")

    # Process image
    face_encoding = utils.get_face_encoding(file.file)
    if face_encoding is None:
        raise HTTPException(status_code=400, detail="No face detected in the image")

    # Create user
    new_user = models.User(
        name=name,
        email=email,
        role=role,
        department=department,
        password=password,
        face_encoding=face_encoding
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/recognize")
async def recognize_face(
    type: str = Form(...),  # 'IN' or 'OUT'
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    users = db.query(models.User).all()
    user = utils.compare_faces_with_db(users, file.file)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not recognized")
    
    # Record attendance
    attendance = models.Attendance(
        user_id=user.id,
        type=type,
        timestamp=datetime.datetime.utcnow()
    )
    db.add(attendance)
    db.commit()
    db.refresh(attendance)
    
    return {
        "message": f"Successfully marked {type} for {user.name}",
        "user": {
            "name": user.name,
            "role": user.role,
            "department": user.department
        },
        "timestamp": attendance.timestamp
    }

@app.get("/attendance", response_model=List[AttendanceResponse])
def get_attendance(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    records = db.query(models.Attendance).order_by(models.Attendance.timestamp.desc()).offset(skip).limit(limit).all()
    
    # Enrich with user name manually or via relationship in response model if properly set up
    result = []
    for record in records:
        result.append({
            "id": record.id,
            "user_id": record.user_id,
            "timestamp": record.timestamp,
            "type": record.type,
            "user_name": record.user.name if record.user else "Unknown",
            "department": record.user.department if record.user else "General"
        })
    return result

@app.get("/users", response_model=List[UserResponse])
def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Delete associated attendance records
    db.query(models.Attendance).filter(models.Attendance.user_id == user_id).delete()
    db.delete(user)
    db.commit()
    return {"message": f"User {user.name} deleted successfully"}

@app.put("/users/{user_id}")
def update_user(
    user_id: int, 
    name: str = Form(None), 
    role: str = Form(None), 
    department: str = Form(None),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if name:
        user.name = name
    if role:
        user.role = role
    if department:
        user.department = department
    
    db.commit()
    db.refresh(user)
    return user

@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total_users = db.query(models.User).count()
    total_attendance = db.query(models.Attendance).count()
    
    # Count by role
    admin_count = db.query(models.User).filter(models.User.role == 'admin').count()
    manager_count = db.query(models.User).filter(models.User.role == 'manager').count()
    employee_count = db.query(models.User).filter(models.User.role == 'employee').count()
    
    # Count by department
    departments = db.query(models.User.department).distinct().all()
    dept_stats = {}
    for (dept,) in departments:
        if dept:
            count = db.query(models.User).filter(models.User.department == dept).count()
            dept_stats[dept] = count
    
    # Today's attendance
    today = datetime.date.today()
    today_attendance = db.query(models.Attendance).filter(
        models.Attendance.timestamp >= datetime.datetime.combine(today, datetime.time.min)
    ).count()
    
    return {
        "total_users": total_users,
        "total_attendance": total_attendance,
        "today_attendance": today_attendance,
        "users_by_role": {
            "admin": admin_count,
            "manager": manager_count,
            "employee": employee_count
        },
        "users_by_department": dept_stats
    }
