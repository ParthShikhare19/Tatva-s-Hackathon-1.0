from sqlalchemy import Column, Integer, String, Numeric, Boolean, ForeignKey
from sqlalchemy.orm import relationship
import sys
from pathlib import Path
# Add parent directory to path to match how it's done in routes
sys.path.append(str(Path(__file__).parent.parent))
from Database_connection.db import Base

class Provider(Base):
    __tablename__ = "providers"
    
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True, index=True)
    bio = Column(String, nullable=True)
    location_name = Column(String(255), nullable=True)
    years_of_experience = Column(Integer, nullable=True)
    # geom = Column(Geometry('POINT', srid=4326), nullable=True)  # Commented out for now
    average_rating = Column(Numeric(2, 1), default=0.0)
    jobs_completed = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)
    
    # Relationships
    job_codes = relationship("JobCode", back_populates="provider", cascade="all, delete-orphan")