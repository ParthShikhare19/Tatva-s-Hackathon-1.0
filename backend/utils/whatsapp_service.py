"""
WhatsApp Notification Service using Twilio
Sends booking notifications via WhatsApp
"""
import os
from pathlib import Path
from dotenv import load_dotenv
from typing import Optional

# Load .env from backend folder
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# Twilio Configuration
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")  # Twilio Sandbox
WEBSITE_URL = os.getenv("WEBSITE_URL", "http://localhost:5175")  # Your website URL


async def send_whatsapp_message(phone: str, message: str) -> bool:
    """
    Send WhatsApp message via Twilio
    
    Args:
        phone: Phone number with country code (e.g., +918924560189)
        message: The message to send
        
    Returns:
        bool: True if sent successfully, False otherwise
    """
    try:
        from twilio.rest import Client
        
        # Format phone number for WhatsApp
        if not phone.startswith("whatsapp:"):
            # Remove any existing + and add whatsapp: prefix
            clean_phone = phone.replace("+", "").replace(" ", "").replace("-", "")
            if not clean_phone.startswith("91"):
                clean_phone = "91" + clean_phone
            whatsapp_phone = f"whatsapp:+{clean_phone}"
        else:
            whatsapp_phone = phone
        
        print(f"📱 Attempting to send WhatsApp message to {whatsapp_phone}")
        
        # Create Twilio client
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        
        # Send WhatsApp message
        twilio_message = client.messages.create(
            body=message,
            from_=TWILIO_WHATSAPP_NUMBER,
            to=whatsapp_phone
        )
        
        print(f"✅ WhatsApp message sent successfully! SID: {twilio_message.sid}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send WhatsApp message: {str(e)}")
        return False


async def notify_provider_new_booking(
    provider_phone: str,
    customer_name: str,
    service: str,
    booking_type: str,
    description: str
) -> bool:
    """
    Notify provider about a new booking request
    
    Args:
        provider_phone: Provider's phone number
        customer_name: Name of the customer
        service: Service requested
        booking_type: Type of booking (immediate/scheduled)
        description: Booking description
        
    Returns:
        bool: True if notification sent successfully
    """
    message = f"""
🔔 *New Booking Request!*

👤 Customer: {customer_name}
🔧 Service: {service}
📅 Type: {booking_type.upper()}
📝 Details: {description}

Please check your dashboard to accept or reject:
🌐 {WEBSITE_URL}/dashboard

_Reply with 'join @notify' to receive future notifications_
    """.strip()
    
    return await send_whatsapp_message(provider_phone, message)


async def notify_customer_booking_accepted(
    customer_phone: str,
    provider_name: str,
    service: str,
    acceptance_code: str
) -> bool:
    """
    Notify customer that their booking was accepted
    
    Args:
        customer_phone: Customer's phone number
        provider_name: Name of the provider
        service: Service booked
        acceptance_code: 6-digit acceptance code
        
    Returns:
        bool: True if notification sent successfully
    """
    message = f"""
✅ *Booking Accepted!*

🎉 Great news! Your booking has been accepted.

👨‍🔧 Provider: {provider_name}
🔧 Service: {service}
🔑 Acceptance Code: *{acceptance_code}*

✨ Please verify this code when the provider arrives.

Check details on your dashboard:
🌐 {WEBSITE_URL}/dashboard

_Reply with 'join @notify' to receive future notifications_
    """.strip()
    
    return await send_whatsapp_message(customer_phone, message)


async def notify_customer_booking_rejected(
    customer_phone: str,
    provider_name: str,
    service: str
) -> bool:
    """
    Notify customer that their booking was rejected
    
    Args:
        customer_phone: Customer's phone number
        provider_name: Name of the provider
        service: Service requested
        
    Returns:
        bool: True if notification sent successfully
    """
    message = f"""
❌ *Booking Not Available*

We're sorry, but your booking request was declined.

👨‍🔧 Provider: {provider_name}
🔧 Service: {service}

💡 Don't worry! You can:
• Book another provider for this service
• Try again later

Browse providers on your dashboard:
🌐 {WEBSITE_URL}/dashboard

_Reply with 'join @notify' to receive future notifications_
    """.strip()
    
    return await send_whatsapp_message(customer_phone, message)


async def notify_customer_work_completed(
    customer_phone: str,
    provider_name: str,
    service: str,
    completion_code: str
) -> bool:
    """
    Notify customer to mark work as finished and leave review
    
    Args:
        customer_phone: Customer's phone number
        provider_name: Name of the provider
        service: Service completed
        completion_code: 6-digit completion code
        
    Returns:
        bool: True if notification sent successfully
    """
    message = f"""
✨ *Work Finished?*

👨‍🔧 Provider: {provider_name}
🔧 Service: {service}

If the work is completed to your satisfaction:
1️⃣ Mark as finished on your dashboard
2️⃣ Leave a review (mandatory)
3️⃣ Use completion code: *{completion_code}*

🌐 {WEBSITE_URL}/dashboard

_Reply with 'join @notify' to receive future notifications_
    """.strip()
    
    return await send_whatsapp_message(customer_phone, message)


async def notify_provider_booking_cancelled(
    provider_phone: str,
    customer_name: str,
    service: str,
    booking_type: str
) -> bool:
    """
    Notify provider that customer cancelled the booking
    
    Args:
        provider_phone: Provider's phone number
        customer_name: Name of the customer
        service: Service that was booked
        booking_type: Type of booking (immediate/scheduled)
        
    Returns:
        bool: True if notification sent successfully
    """
    message = f"""
🚫 *Booking Cancelled by Customer*

A booking request has been cancelled.

👤 Customer: {customer_name}
🔧 Service: {service}
📅 Type: {booking_type.upper()}

The booking is no longer active.

Check your dashboard:
🌐 {WEBSITE_URL}/dashboard

_Reply with 'join @notify' to receive future notifications_
    """.strip()
    
    return await send_whatsapp_message(provider_phone, message)


async def notify_customer_job_cancelled(
    customer_phone: str,
    provider_name: str,
    service: str
) -> bool:
    """
    Notify customer that provider cancelled the job
    
    Args:
        customer_phone: Customer's phone number
        provider_name: Name of the provider
        service: Service that was booked
        
    Returns:
        bool: True if notification sent successfully
    """
    message = f"""
⚠️ *Job Cancelled by Provider*

Unfortunately, your accepted booking has been cancelled.

👨‍🔧 Provider: {provider_name}
🔧 Service: {service}

💡 You can:
• Book another provider for this service
• Contact support for assistance

Browse providers on your dashboard:
🌐 {WEBSITE_URL}/dashboard

_Reply with 'join @notify' to receive future notifications_
    """.strip()
    
    return await send_whatsapp_message(customer_phone, message)
