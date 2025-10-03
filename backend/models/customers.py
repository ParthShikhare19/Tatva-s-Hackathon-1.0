from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from ..Database_connection.db import Base

class Customer(Base):
    __tablename__ = "customers"
    
    user_id = Column(Integer, primary_key=True, index=True)
    address = Column(String, nullable=True)
    location_name = Column(String(255), nullable=True)
    preferences = Column(String, nullable=True)  # Service preferences or notes
