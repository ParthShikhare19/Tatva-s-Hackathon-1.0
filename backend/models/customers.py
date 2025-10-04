from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))
from Database_connection.db import Base

class Customer(Base):
    __tablename__ = "customers"
    
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True, index=True)
    address = Column(String, nullable=True)
    location_name = Column(String(255), nullable=True)
    preferences = Column(String, nullable=True)  # Service preferences or notes
