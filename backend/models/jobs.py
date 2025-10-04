from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from Database_connection.db import Base
from datetime import datetime

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    location = Column(String(200), nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"))
    provider_id = Column(Integer, ForeignKey("providers.user_id"), nullable=True)
    status = Column(String(20), default="pending")  # pending, accepted, in_progress, completed, cancelled
    urgency = Column(String(10), default="medium")  # low, medium, high
    created_at = Column(DateTime, default=datetime.utcnow)
    accepted_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    service_code = Column(String(10), nullable=True)
    
    # Relationships - using string references with module path for lazy loading
    customer = relationship("auth.models.User", foreign_keys=[customer_id])
    provider = relationship("Provider", foreign_keys=[provider_id])
    # Note: Review relationship removed - reviews use job_code not job_id
