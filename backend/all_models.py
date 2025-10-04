# Import all models in one place to ensure they all use the same Base
# This file ensures proper SQLAlchemy relationship configuration

import sys
from pathlib import Path

# Add backend directory to path (same as providers.py does)
sys.path.append(str(Path(__file__).parent))

from Database_connection.db import Base

# Import User model first
from auth.models import User

# Import other models  
from models.providers import Provider
from models.customers import Customer
from models.job_codes import JobCode
from models.otp import OTPVerification

# Export all models
__all__ = ['Base', 'User', 'Provider', 'Customer', 'JobCode', 'OTPVerification']
