from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from ..Database_connection.db import get_db
from ..models.otp import OTPVerification
from ..utils.otp_service import (
    generate_otp, 
    send_otp as send_otp_message,  # Renamed to avoid conflict with route function
    get_otp_expiry,
    is_otp_expired,
    MAX_OTP_ATTEMPTS
)
from datetime import datetime, timedelta
import logging

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["OTP"])

# Schemas
class SendOTPRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15, description="Phone number")

class VerifyOTPRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    otp: str = Field(..., min_length=6, max_length=6)

class OTPResponse(BaseModel):
    message: str
    expires_in_minutes: int = None

# Routes
@router.post("/send-otp", response_model=OTPResponse)
async def send_otp(request: SendOTPRequest, db: Session = Depends(get_db)):
    """
    Send OTP to phone number
    
    - Generates 6-digit OTP
    - Saves to database with expiry
    - Sends via MSG91 SMS
    """
    from datetime import timezone
    
    phone = request.phone.strip()
    
    # Rate limiting: Check if OTP was sent recently (within 1 minute)
    recent_otp = db.query(OTPVerification).filter(
        OTPVerification.phone == phone,
        OTPVerification.created_at > datetime.now(timezone.utc) - timedelta(minutes=1)
    ).first()
    
    if recent_otp:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Please wait 1 minute before requesting another OTP"
        )
    
    # Generate OTP
    otp_code = generate_otp()
    expires_at = get_otp_expiry()
    
    logger.info(f"Generated OTP for phone: {phone}, expires at: {expires_at}")
    
    # Save to database
    otp_record = OTPVerification(
        phone=phone,
        otp=otp_code,
        expires_at=expires_at,
        is_used=False,
        attempts=0
    )
    db.add(otp_record)
    db.commit()
    
    logger.info(f"Saved OTP to database for phone: {phone}")
    
    # Send OTP via configured provider (MSG91 or Twilio)
    try:
        sent = await send_otp_message(phone, otp_code)
    except Exception as e:
        logger.error(f"Failed to send OTP to {phone}: {str(e)}")
        db.delete(otp_record)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send OTP. Please try again."
        )
    
    if not sent:
        db.delete(otp_record)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send OTP. Please try again."
        )
    
    logger.info(f"OTP sent successfully to {phone}")
    return OTPResponse(
        message=f"OTP sent successfully to {phone}",
        expires_in_minutes=5
    )

@router.post("/verify-otp")
async def verify_otp(request: VerifyOTPRequest, db: Session = Depends(get_db)):
    """
    Verify OTP
    
    - Checks if OTP is valid
    - Checks expiry
    - Checks attempts
    - Marks as used
    """
    phone = request.phone.strip()
    otp = request.otp.strip()
    
    logger.info(f"Verifying OTP for phone: {phone}")
    
    # Find latest unused OTP for this phone
    otp_record = db.query(OTPVerification).filter(
        OTPVerification.phone == phone,
        OTPVerification.otp == otp,
        OTPVerification.is_used == False
    ).order_by(OTPVerification.created_at.desc()).first()
    
    if not otp_record:
        logger.warning(f"Invalid OTP attempt for phone: {phone}")
        
        # Log if OTP exists for different phone
        otp_for_other_phone = db.query(OTPVerification).filter(
            OTPVerification.otp == otp,
            OTPVerification.is_used == False
        ).order_by(OTPVerification.created_at.desc()).first()
        
        if otp_for_other_phone:
            logger.warning(f"OTP {otp} exists for different phone: {otp_for_other_phone.phone}, attempted with: {phone}")
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP"
        )
    
    logger.debug(f"Found OTP record: ID={otp_record.id}, created_at={otp_record.created_at}, expires_at={otp_record.expires_at}")
    
    # Check expiry
    from datetime import datetime, timezone
    if is_otp_expired(otp_record.expires_at):
        logger.warning(f"OTP expired for phone: {phone}, expires_at: {otp_record.expires_at}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired. Please request a new one."
        )
    
    # Check attempts
    if otp_record.attempts >= MAX_OTP_ATTEMPTS:
        logger.warning(f"Max OTP attempts exceeded for phone: {phone}, attempts: {otp_record.attempts}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum verification attempts exceeded. Please request a new OTP."
        )
    
    # Increment attempts
    otp_record.attempts += 1
    
    # If OTP doesn't match, save attempt and return error
    if otp_record.otp != otp:
        db.commit()
        remaining = MAX_OTP_ATTEMPTS - otp_record.attempts
        logger.warning(f"OTP mismatch for phone: {phone}, remaining attempts: {remaining}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid OTP. {remaining} attempts remaining."
        )
    
    # Mark as used
    otp_record.is_used = True
    db.commit()
    
    logger.info(f"OTP verified successfully for phone: {phone}")
    
    return {
        "message": "OTP verified successfully",
        "phone": phone,
        "verified": True
    }

@router.post("/resend-otp", response_model=OTPResponse)
async def resend_otp(request: SendOTPRequest, db: Session = Depends(get_db)):
    """
    Resend OTP (same as send-otp but with different message)
    """
    return await send_otp(request, db)
