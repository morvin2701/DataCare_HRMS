from sqlalchemy import Column, Integer, String, DateTime, LargeBinary, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    role = Column(String, default="employee")
    department = Column(String, default="General") # Added department field
    password = Column(String, default="123456") # Added password field
    face_encoding = Column(LargeBinary, nullable=False)  # Store numpy array as bytes
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    attendances = relationship("Attendance", back_populates="user")

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    type = Column(String)  # 'IN' or 'OUT'

    user = relationship("User", back_populates="attendances")
