from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from Database_connection.db import Base

class Provider(Base):
    __tablename__ = "providers"
    
    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(15), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    service_type = Column(String(50), nullable=False)
    location = Column(String(200), nullable=False)
    whatsapp_number = Column(String(15), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    job_codes = relationship("JobCode", back_populates="provider")