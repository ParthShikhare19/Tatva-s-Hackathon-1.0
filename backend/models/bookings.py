from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from sqlalchemy.sql import func
from backend.Database_connection.db import Base
import enum


class BookingStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    customer_phone = Column(String(15), nullable=False, index=True)
    provider_phone = Column(String(15), nullable=False, index=True)
    service = Column(String(100), nullable=False)
    description = Column(Text)
    location = Column(String(255))
    status = Column(Enum(BookingStatus), default=BookingStatus.PENDING, nullable=False, index=True)
    booking_type = Column(String(20), default="scheduled", nullable=False)  # 'immediate' or 'scheduled'
    scheduled_date = Column(String(20), nullable=True)  # Date for scheduled bookings
    scheduled_time = Column(String(20), nullable=True)  # Time for scheduled bookings
    one_time_code = Column(String(6), nullable=True)  # 6-digit code for booking verification (deprecated)
    acceptance_code = Column(String(6), nullable=True)  # 6-digit code when provider accepts
    completion_code = Column(String(6), nullable=True)  # 6-digit code for review verification
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    # customer = relationship("User", foreign_keys=[customer_phone], back_populates="customer_bookings")
    # provider = relationship("User", foreign_keys=[provider_phone], back_populates="provider_bookings")
