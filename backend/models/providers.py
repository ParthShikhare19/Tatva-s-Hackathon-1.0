from sqlalchemy import Column, Integer, String, Numeric, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from ..Database_connection.db import Base

class Provider(Base):
    __tablename__ = "providers"
    
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True, index=True)
    bio = Column(String, nullable=True)
    location_name = Column(String(255), nullable=True)
    # geom = Column(Geometry('POINT', srid=4326), nullable=True)  # Commented out for now
    average_rating = Column(Numeric(2, 1), default=0.0)
    jobs_completed = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)
    
    # Relationships
    job_codes = relationship("JobCode", back_populates="provider", cascade="all, delete-orphan")