from sqlalchemy import Column, String, DateTime, Boolean, Integer
from sqlalchemy.sql import func
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))
from Database_connection.db import Base

class OTPVerification(Base):
    __tablename__ = "otp_verifications"
    
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(15), nullable=False, index=True)
    otp = Column(String(6), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_used = Column(Boolean, default=False)
    attempts = Column(Integer, default=0)
