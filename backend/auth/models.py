from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
import sys
from pathlib import Path
# Add parent directory to path to match how providers.py does it
sys.path.append(str(Path(__file__).parent.parent))
from Database_connection.db import Base

class User(Base):
    __tablename__ = "users"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(15), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    email_id = Column(String(255), nullable=True)
    role = Column(String(10), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
