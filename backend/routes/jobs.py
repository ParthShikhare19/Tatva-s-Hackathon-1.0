from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from Database_connection.db import get_db
from models.jobs import Job
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Import auth dependency
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))
from auth.routes import get_current_user
from auth.models import User

router = APIRouter(prefix="/jobs", tags=["Jobs"])

class JobCreate(BaseModel):
    title: str
    description: str
    price: float
    location: str
    urgency: Optional[str] = "medium"

@router.post("/create")
def create_job(
    job_data: JobCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "customer":
        raise HTTPException(status_code=403, detail="Only customers can create jobs")
    
    job = Job(
        title=job_data.title,
        description=job_data.description,
        price=job_data.price,
        location=job_data.location,
        customer_id=current_user.id,
        urgency=job_data.urgency
    )
    
    db.add(job)
    db.commit()
    db.refresh(job)
    
    return {"message": "Job created successfully", "job_id": job.id}
