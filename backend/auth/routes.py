from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from Database_connection.db import get_db
from .schemas import UserSignup, UserLogin, Token, UserInfo
from .service import AuthService
from .security import decode_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security), 
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    auth_service = AuthService(db)
    return auth_service.get_user_by_id(payload["user_id"])

@router.post("/signup", response_model=Token)
def signup(user_data: UserSignup, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    return auth_service.register_user(user_data)

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    return auth_service.login_user(login_data)

@router.get("/me", response_model=UserInfo)
def get_current_user_info(current_user = Depends(get_current_user)):
    return current_user

@router.get("/test")
def test_connection():
    return {"message": "Auth system connected to Neon database successfully!"}
