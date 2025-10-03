from sqlalchemy import Column, Integer, String, Numeric, Boolean
from sqlalchemy.orm import relationship
from Database_connection.db import Base

class Provider(Base):
    __tablename__ = "providers"
    
    user_id = Column(Integer, primary_key=True, index=True)
    bio = Column(String, nullable=True)
    location_name = Column(String(255), nullable=True)
    geom = Column(String, nullable=True)  # Geometry/location data
    average_rating = Column(Numeric(2, 1), default=0.0)
    jobs_completed = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)
    
    # Relationships
    job_codes = relationship("JobCode", back_populates="provider")
    provider_jobs = relationship("Job", foreign_keys="Job.provider_id", back_populates="provider")
