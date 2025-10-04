import random
import string
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from models.job_codes import JobCode

def generate_unique_code(db: Session, length: int = 6) -> str:
    """
    Generate a unique 6-digit alphanumeric code.
    Ensures no collision with existing unused codes.
    """
    while True:
        # Generate random 6-digit alphanumeric code (uppercase)
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))
        
        # Check if code already exists and is unused
        existing_code = db.query(JobCode).filter(
            JobCode.code == code,
            JobCode.status == "UNUSED",
            JobCode.expires_at > datetime.now(timezone.utc)
        ).first()
        
        if not existing_code:
            return code

def create_job_code(db: Session, provider_id: int) -> JobCode:
    """
    Create a new job completion code for a provider.
    Code expires in 7 days from creation.
    """
    code = generate_unique_code(db)
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    job_code = JobCode(
        code=code,
        provider_id=provider_id,
        status="UNUSED",
        expires_at=expires_at
    )
    
    db.add(job_code)
    db.commit()
    db.refresh(job_code)
    
    return job_code

def validate_and_use_code(db: Session, code: str) -> JobCode:
    """
    Validate a completion code and mark it as used.
    Returns the JobCode if valid, None if invalid/expired/used.
    """
    job_code = db.query(JobCode).filter(
        JobCode.code == code,
        JobCode.status == "UNUSED",
        JobCode.expires_at > datetime.now(timezone.utc)
    ).first()
    
    if job_code:
        job_code.status = "USED"
        job_code.used_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(job_code)
    
    return job_code