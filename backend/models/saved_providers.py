from sqlalchemy import Column, Integer, String, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from sqlalchemy.sql import func
from backend.Database_connection.db import Base


class SavedProvider(Base):
    __tablename__ = "saved_providers"

    id = Column(Integer, primary_key=True, index=True)
    customer_phone = Column(String(15), nullable=False, index=True)
    provider_phone = Column(String(15), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Ensure a customer can't save the same provider twice
    __table_args__ = (
        UniqueConstraint('customer_phone', 'provider_phone', name='unique_customer_provider'),
    )

    # Relationships
    # customer = relationship("User", foreign_keys=[customer_phone])
    # provider = relationship("User", foreign_keys=[provider_phone])
