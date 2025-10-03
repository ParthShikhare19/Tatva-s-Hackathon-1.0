from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from Database_connection.db import Base
from datetime import datetime

class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("providers.user_id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_code = Column(String(10), nullable=False)  # OTP verification code, not a job ID
    rating = Column(Integer, nullable=False)  # 1-5 stars
    comment = Column(Text)  # Column name is 'comment', not 'review_text'
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    provider = relationship("Provider", foreign_keys=[provider_id])
    customer = relationship("auth.models.User", foreign_keys=[customer_id])
