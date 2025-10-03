import random
import string
import httpx
from datetime import datetime, timedelta
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration
MSG91_AUTH_KEY = os.getenv("MSG91_AUTH_KEY")
MSG91_SENDER_ID = os.getenv("MSG91_SENDER_ID", "MSGIND")
MSG91_DLT_TEMPLATE_ID = os.getenv("MSG91_DLT_TEMPLATE_ID")
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
OTP_PROVIDER = os.getenv("OTP_PROVIDER", "MSG91")  # MSG91 or TWILIO
OTP_LENGTH = int(os.getenv("OTP_LENGTH", "6"))
OTP_EXPIRY_MINUTES = int(os.getenv("OTP_EXPIRY_MINUTES", "5"))
MAX_OTP_ATTEMPTS = int(os.getenv("MAX_OTP_ATTEMPTS", "3"))

def generate_otp(length: int = OTP_LENGTH) -> str:
    """Generate random numeric OTP"""
    return ''.join(random.choices(string.digits, k=length))

async def send_otp_via_twilio(phone: str, otp: str) -> bool:
    """
    Send OTP via Twilio SMS API
    
    Args:
        phone: Phone number (e.g., 8291935109)
        otp: The OTP code to send
        
    Returns:
        bool: True if sent successfully, False otherwise
    """
    try:
        from twilio.rest import Client
        
        # Format phone number with country code
        phone = phone.replace("+", "").replace(" ", "")
        if not phone.startswith("91"):
            phone = "+91" + phone
        else:
            phone = "+" + phone
        
        print(f"🔄 Attempting to send OTP via Twilio to {phone}")
        print(f"📱 Using Twilio Account: {TWILIO_ACCOUNT_SID[:10] if TWILIO_ACCOUNT_SID else 'Not Set'}...")
        
        if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN or not TWILIO_PHONE_NUMBER:
            print(f"❌ Twilio credentials not configured")
            print(f"⚠️  Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER in .env")
            return False
        
        # Create Twilio client
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        
        # Send SMS
        message = client.messages.create(
            body=f"Your verification code is {otp}. Valid for {OTP_EXPIRY_MINUTES} minutes. Do not share with anyone.",
            from_=TWILIO_PHONE_NUMBER,
            to=phone
        )
        
        print(f"✅ OTP sent successfully via Twilio to {phone}")
        print(f"✅ Message SID: {message.sid}")
        print(f"✅ Status: {message.status}")
        print(f"📱 Check your phone for the OTP!")
        
        return True
        
    except Exception as e:
        print(f"❌ Error sending OTP via Twilio: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return False


async def send_otp(phone: str, otp: str) -> bool:
    """
    Send OTP using configured provider (MSG91 or Twilio)
    
    Args:
        phone: Phone number
        otp: The OTP code to send
        
    Returns:
        bool: True if sent successfully
    """
    print(f"📤 OTP Provider: {OTP_PROVIDER}")
    
    if OTP_PROVIDER == "TWILIO":
        return await send_otp_via_twilio(phone, otp)
    else:
        return await send_otp_via_msg91(phone, otp)


async def send_otp_via_msg91(phone: str, otp: str) -> bool:
    """
    Send OTP via MSG91 with DLT Template support
    
    Args:
        phone: Phone number with country code (e.g., 918924560189)
        otp: The OTP code to send
        
    Returns:
        bool: True if sent successfully, False otherwise
    """
    try:
        # Remove + if present and ensure country code
        phone = phone.replace("+", "").replace(" ", "")
        if not phone.startswith("91"):
            phone = "91" + phone
        
        print(f"🔄 Attempting to send OTP to {phone}")
        print(f"📱 Using MSG91 Auth Key: {MSG91_AUTH_KEY[:10]}...")
        
        # If DLT Template ID is configured, use SMS API with DLT
        if MSG91_DLT_TEMPLATE_ID and MSG91_DLT_TEMPLATE_ID != "your_template_id_here":
            print(f"📋 Using DLT Template ID: {MSG91_DLT_TEMPLATE_ID}")
            
            # Use SMS API with DLT template
            url = "https://api.msg91.com/api/sendhttp.php"
            
            # Message must match the DLT template exactly
            message = f"Your verification code is {otp}. Do not share with anyone."
            
            params = {
                "authkey": MSG91_AUTH_KEY,
                "mobiles": phone,
                "message": message,
                "sender": MSG91_SENDER_ID,
                "route": "4",  # Transactional route
                "country": "91",
                "DLT_TE_ID": MSG91_DLT_TEMPLATE_ID
            }
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url, params=params)
                print(f"📊 MSG91 Response Status: {response.status_code}")
                print(f"📊 MSG91 Response: {response.text}")
                
                if response.status_code == 200:
                    response_text = response.text.strip()
                    # Check if response contains error
                    if "error" not in response_text.lower() and "invalid" not in response_text.lower():
                        print(f"✅ OTP sent successfully to {phone}")
                        print(f"✅ Message ID: {response_text}")
                        print(f"📱 Check your phone for the OTP!")
                        return True
                    else:
                        print(f"❌ Failed: {response_text}")
                        return False
        
        # If no DLT template, use OTP API (may fail without DLT in India)
        else:
            print(f"⚠️  No DLT Template configured")
            print(f"⚠️  Trying MSG91 OTP API (may require DLT approval)")
            
            url = "https://control.msg91.com/api/v5/otp"
            phone_without_code = phone[2:] if phone.startswith("91") else phone
            
            payload = {
                "mobile": phone_without_code,
                "otp": otp,
                "otp_expiry": OTP_EXPIRY_MINUTES
            }
            
            headers = {
                "authkey": MSG91_AUTH_KEY,
                "content-type": "application/json"
            }
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, json=payload, headers=headers)
                print(f"📊 MSG91 OTP API Response Status: {response.status_code}")
                print(f"📊 MSG91 OTP API Response: {response.text}")
                
                if response.status_code == 200:
                    try:
                        response_data = response.json()
                        if response_data.get("type") == "success":
                            print(f"✅ OTP sent successfully to {phone}")
                            print(f"📱 Check your phone for the OTP!")
                            return True
                    except:
                        pass
        
        # If failed, show instructions
        print(f"❌ Failed to send OTP")
        print(f"")
        print(f"⚠️  TO FIX DLT ERROR:")
        print(f"⚠️  1. Go to: https://control.msg91.com/")
        print(f"⚠️  2. Settings → DLT Templates → Add Template")
        print(f"⚠️  3. Template: 'Your verification code is ##OTP##. Do not share with anyone.'")
        print(f"⚠️  4. Variable: ##OTP## (Type: Alphanumeric)")
        print(f"⚠️  5. Wait for approval (1-24 hours)")
        print(f"⚠️  6. Once approved, add template ID to .env:")
        print(f"⚠️     MSG91_DLT_TEMPLATE_ID=your_template_id_here")
        print(f"")
        return False
            
    except Exception as e:
        print(f"❌ Error sending OTP: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return False

def get_otp_expiry() -> datetime:
    """Get OTP expiry datetime (timezone aware)"""
    from datetime import timezone
    return datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES)

def is_otp_expired(expires_at: datetime) -> bool:
    """Check if OTP is expired (handles both timezone-aware and naive datetimes)"""
    from datetime import timezone
    
    # Get current time in UTC
    now = datetime.now(timezone.utc)
    
    # If expires_at is naive, make it aware
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    return now > expires_at
