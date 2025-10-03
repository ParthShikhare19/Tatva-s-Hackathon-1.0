"""
Alternative OTP Service using Twilio (Free $15 credit on signup)
"""
import random
import string
from datetime import datetime, timedelta
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

# Twilio Configuration
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")  # Your Twilio number
OTP_LENGTH = int(os.getenv("OTP_LENGTH", "6"))
OTP_EXPIRY_MINUTES = int(os.getenv("OTP_EXPIRY_MINUTES", "5"))

def generate_otp(length: int = OTP_LENGTH) -> str:
    """Generate random numeric OTP"""
    return ''.join(random.choices(string.digits, k=length))

async def send_otp_via_twilio(phone: str, otp: str) -> bool:
    """
    Send OTP via Twilio SMS API
    
    Args:
        phone: Phone number with country code (e.g., +918924560189)
        otp: The OTP code to send
        
    Returns:
        bool: True if sent successfully, False otherwise
    """
    try:
        from twilio.rest import Client
        
        # Format phone number
        if not phone.startswith("+"):
            phone = "+91" + phone.replace("+", "").replace(" ", "")
        
        print(f"🔄 Attempting to send OTP via Twilio to {phone}")
        print(f"📱 Using Twilio Account: {TWILIO_ACCOUNT_SID[:10]}...")
        
        # Create Twilio client
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        
        # Send SMS
        message = client.messages.create(
            body=f"Your OTP for verification is {otp}. Valid for {OTP_EXPIRY_MINUTES} minutes. Do not share.",
            from_=TWILIO_PHONE_NUMBER,
            to=phone
        )
        
        print(f"✅ OTP sent successfully via Twilio to {phone}")
        print(f"✅ Message SID: {message.sid}")
        print(f"✅ Status: {message.status}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error sending OTP via Twilio: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return False

def get_otp_expiry() -> datetime:
    """Get OTP expiry datetime"""
    return datetime.utcnow() + timedelta(minutes=OTP_EXPIRY_MINUTES)

def is_otp_expired(expires_at: datetime) -> bool:
    """Check if OTP is expired"""
    return datetime.utcnow() > expires_at
