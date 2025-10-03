from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
from Database_connection.db import Base

class JobCode(Base):
    __tablename__ = "job_codes"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(6), unique=True, nullable=False, index=True)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    status = Column(String(10), default="UNUSED", nullable=False)  # UNUSED, USED
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    used_at = Column(DateTime, nullable=True)
    
    # Relationship
    provider = relationship("Provider", back_populates="job_codes")