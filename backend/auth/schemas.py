from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class UserSignup(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=6, max_length=50)
    user_type: str = Field(..., pattern="^(customer|provider)$")  # Changed regex to pattern
    location: Optional[str] = None
    service: Optional[str] = None

class UserLogin(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    password: str = Field(..., min_length=6, max_length=50)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_type: str
    name: str

class UserInfo(BaseModel):
    id: int
    phone_number: str
    name: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True
