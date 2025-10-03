from sqlalchemy import Column, Integer, String, Text, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from sqlalchemy.sql import func
from backend.Database_connection.db import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, nullable=False, index=True)  # FK to users.id
    customer_id = Column(Integer, nullable=False, index=True)  # FK to users.id
    job_code = Column(String(20), nullable=True, index=True)  # Changed from booking_id
    rating = Column(Float, nullable=False)  # 1.0 to 5.0 (stored as numeric in DB)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    # provider = relationship("User", foreign_keys=[provider_phone])
    # customer = relationship("User", foreign_keys=[customer_phone])
    # booking = relationship("Booking", back_populates="review")
