from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(15), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    email_id = Column(String(255), nullable=True)
    role = Column(String(10), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Provider(Base):
    __tablename__ = "providers"
    
    user_id = Column(Integer, primary_key=True)
    bio = Column(Text)
    location_name = Column(String(255))
    years_of_experience = Column(Integer, nullable=True)
    average_rating = Column(Numeric(2, 1), default=0.0)
    jobs_completed = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)

class Customer(Base):
    __tablename__ = "customers"
    
    user_id = Column(Integer, primary_key=True)
    address = Column(Text)
    location_name = Column(String(255))
    preferences = Column(String(500))
    role = Column(String(10), nullable=False)  # 'customer' or 'provider'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
