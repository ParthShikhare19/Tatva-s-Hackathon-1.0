from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from Database_connection.db import get_db
from models.job_codes import JobCode
from models.providers import Provider
from utils.code_generator import create_job_code, validate_and_use_code
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/job-codes", tags=["Job Codes"])

class JobCodeResponse(BaseModel):
    id: int
    code: str
    provider_id: int
    status: str
    expires_at: datetime
    created_at: datetime

class CodeValidationRequest(BaseModel):
    code: str

@router.post("/generate/{provider_id}", response_model=JobCodeResponse)
def generate_job_code(
    provider_id: int,
    db: Session = Depends(get_db)
):
    """
    Generate a new job completion code for a provider.
    """
    # Verify provider exists
    provider = db.query(Provider).filter(Provider.id == provider_id).first()
    if not provider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provider not found"
        )
    
    # Create job code
    job_code = create_job_code(db, provider_id)
    
    return JobCodeResponse(
        id=job_code.id,
        code=job_code.code,
        provider_id=job_code.provider_id,
        status=job_code.status,
        expires_at=job_code.expires_at,
        created_at=job_code.created_at
    )

@router.post("/validate")
def validate_job_code(
    request: CodeValidationRequest,
    db: Session = Depends(get_db)
):
    """
    Validate and use a job completion code.
    Returns success if code is valid and unused.
    """
    job_code = validate_and_use_code(db, request.code)
    
    if not job_code:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid, expired, or already used code"
        )
    
    return {
        "message": "Code validated successfully",
        "provider_id": job_code.provider_id,
        "used_at": job_code.used_at
    }

@router.get("/provider/{provider_id}")
def get_provider_codes(
    provider_id: int,
    db: Session = Depends(get_db)
):
    """
    Get all job codes for a specific provider.
    """
    codes = db.query(JobCode).filter(JobCode.provider_id == provider_id).all()
    
    return [
        JobCodeResponse(
            id=code.id,
            code=code.code,
            provider_id=code.provider_id,
            status=code.status,
            expires_at=code.expires_at,
            created_at=code.created_at
        )
        for code in codes
    ]