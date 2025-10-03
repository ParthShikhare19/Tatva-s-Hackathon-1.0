from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from .models import User
from .schemas import UserSignup, UserLogin
from .security import hash_password, verify_password, create_access_token
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))
from models.providers import Provider
from models.customers import Customer

class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def register_user(self, user_data: UserSignup) -> dict:
        existing_user = self.db.query(User).filter(User.phone_number == user_data.phone).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number already registered"
            )
        
        password_hash = hash_password(user_data.password)
        
        new_user = User(
            phone_number=user_data.phone,
            password_hash=password_hash,
            name=user_data.name,
            role=user_data.user_type
        )
        
        self.db.add(new_user)
        self.db.commit()
        self.db.refresh(new_user)
        
        if user_data.user_type == "provider":
            provider = Provider(
                user_id=new_user.id,
                location_name=user_data.location,
                bio=f"Experienced {user_data.service} in {user_data.location}"
            )
            self.db.add(provider)
            self.db.commit()
        
        access_token = create_access_token({
            "user_id": new_user.id,
            "phone": new_user.phone_number,
            "role": new_user.role
        })
        
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "user_type": new_user.role,
            "name": new_user.name
        }

    def login_user(self, login_data: UserLogin) -> dict:
        user = self.db.query(User).filter(User.phone_number == login_data.phone).first()
        
        if not user or not verify_password(login_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid phone number or password"
            )
        
        access_token = create_access_token({
            "user_id": user.id,
            "phone": user.phone_number,
            "role": user.role
        })
        
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "user_type": user.role,
            "name": user.name
        }

    def get_user_by_id(self, user_id: int) -> User:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return user
