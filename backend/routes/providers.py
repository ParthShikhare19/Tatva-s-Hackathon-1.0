from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from Database_connection.db import get_db
from models.providers import Provider
from models.jobs import Job
from models.reviews import Review
from pydantic import BaseModel, Field
from typing import Optional, List
from decimal import Decimal
from datetime import datetime

# Import auth dependency
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))
from auth.routes import get_current_user
from auth.models import User

router = APIRouter(prefix="/providers", tags=["Providers"])

# Schemas
class ProviderProfileCreate(BaseModel):
    bio: Optional[str] = Field(None, max_length=1000, description="Provider biography")
    location_name: Optional[str] = Field(None, max_length=255, description="Provider location")
    service_type: Optional[str] = Field(None, max_length=100, description="Service type")

class ProviderProfileUpdate(BaseModel):
    bio: Optional[str] = Field(None, max_length=1000, description="Provider biography")
    location_name: Optional[str] = Field(None, max_length=255, description="Provider location")
    service_type: Optional[str] = Field(None, max_length=100, description="Service type")

class ProviderProfileResponse(BaseModel):
    user_id: int
    bio: Optional[str]
    location_name: Optional[str]
    service_type: Optional[str]
    average_rating: Decimal
    jobs_completed: int
    total_earnings: float
    is_verified: bool
    
    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_earnings: float
    jobs_completed: int
    average_rating: float
    active_jobs: int
    pending_requests: int
    service_type: Optional[str]
    phone: str
    email: str
    is_verified: bool
    member_since: datetime
    bio: Optional[str]

class JobRequest(BaseModel):
    id: int
    title: str
    description: str
    price: float
    location: str
    customer_name: str
    customer_phone: str
    urgency: str
    created_at: datetime

class JobResponse(BaseModel):
    id: int
    title: str
    description: str
    price: float
    location: str
    customer_name: str
    customer_phone: str
    status: str
    urgency: str
    created_at: datetime
    accepted_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    rating: Optional[int] = None
    review: Optional[str] = None

# Your existing CRUD routes remain the same...
@router.post("/profile", response_model=ProviderProfileResponse, status_code=status.HTTP_201_CREATED)
def create_provider_profile(
    profile_data: ProviderProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "provider":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users with provider role can create a provider profile"
        )

    existing_provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
    if existing_provider:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provider profile already exists. Use PUT /providers/profile to update."
        )

    new_provider = Provider(
        user_id=current_user.id,
        bio=profile_data.bio,
        location_name=profile_data.location_name,
        service_type=profile_data.service_type,
        phone=current_user.phone_number,
        email=f"{current_user.name.lower().replace(' ', '.')}@example.com",
        average_rating=Decimal("0.0"),
        jobs_completed=0,
        total_earnings=0.0,
        is_verified=False
    )

    db.add(new_provider)
    db.commit()
    db.refresh(new_provider)

    return new_provider

# Dashboard Routes with Real Data
@router.get("/{provider_id}/dashboard-stats", response_model=DashboardStats)
def get_provider_dashboard_stats(
    provider_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "provider" or current_user.id != provider_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    provider = db.query(Provider).filter(Provider.user_id == provider_id).first()
    
    # If provider record doesn't exist, create it
    if not provider:
        provider = Provider(
            user_id=provider_id,
            bio="Welcome! Update your profile to get started.",
            location_name="Not set",
            average_rating=0.0,
            jobs_completed=0,
            is_verified=False
        )
        db.add(provider)
        db.commit()
        db.refresh(provider)
    
    # Real data queries
    active_jobs_count = db.query(Job).filter(
        Job.provider_id == provider.user_id,
        Job.status.in_(["accepted", "in_progress"])
    ).count()
    
    pending_requests_count = db.query(Job).filter(
        Job.status == "pending",
        Job.provider_id.is_(None)
    ).count()
    
    # Calculate total earnings from completed jobs
    from sqlalchemy import func
    total_earnings = db.query(func.sum(Job.price)).filter(
        Job.provider_id == provider.user_id,
        Job.status == "completed"
    ).scalar() or 0.0
    
    return DashboardStats(
        total_earnings=float(total_earnings),
        jobs_completed=provider.jobs_completed,
        average_rating=float(provider.average_rating),
        active_jobs=active_jobs_count,
        pending_requests=pending_requests_count,
        service_type=None,  # Not in database
        phone=current_user.phone_number,
        email=f"{current_user.name.lower().replace(' ', '.')}@example.com",  # Generate from name
        is_verified=provider.is_verified,
        member_since=current_user.created_at,
        bio=provider.bio
    )

@router.get("/{provider_id}/pending-requests", response_model=List[JobRequest])
def get_pending_requests(
    provider_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "provider" or current_user.id != provider_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    provider = db.query(Provider).filter(Provider.user_id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    # Real query for pending jobs
    jobs = db.query(Job).join(User, Job.customer_id == User.id)\
        .filter(Job.status == "pending")\
        .filter(Job.provider_id.is_(None))\
        .order_by(Job.created_at.desc())\
        .all()
    
    job_requests = []
    for job in jobs:
        job_requests.append(JobRequest(
            id=job.id,
            title=job.title,
            description=job.description,
            price=job.price,
            location=job.location,
            customer_name=job.customer.name,
            customer_phone=job.customer.phone_number,
            urgency=job.urgency,
            created_at=job.created_at
        ))
    
    return job_requests

@router.get("/{provider_id}/accepted-jobs", response_model=List[JobResponse])
def get_accepted_jobs(
    provider_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "provider" or current_user.id != provider_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    provider = db.query(Provider).filter(Provider.user_id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    # Real query for accepted jobs
    jobs = db.query(Job).join(User, Job.customer_id == User.id)\
        .filter(Job.provider_id == provider.user_id)\
        .filter(Job.status.in_(["accepted", "in_progress"]))\
        .order_by(Job.accepted_at.desc())\
        .all()
    
    job_responses = []
    for job in jobs:
        job_responses.append(JobResponse(
            id=job.id,
            title=job.title,
            description=job.description,
            price=job.price,
            location=job.location,
            customer_name=job.customer.name,
            customer_phone=job.customer.phone_number,
            status=job.status,
            urgency=job.urgency,
            created_at=job.created_at,
            accepted_at=job.accepted_at,
            completed_at=job.completed_at
        ))
    
    return job_responses

@router.get("/{provider_id}/completed-jobs", response_model=List[JobResponse])
def get_completed_jobs(
    provider_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "provider" or current_user.id != provider_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    provider = db.query(Provider).filter(Provider.user_id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    # Real query for completed jobs
    # Note: Reviews are linked by provider_id and customer_id, not by job
    jobs = db.query(Job).join(User, Job.customer_id == User.id)\
        .filter(Job.provider_id == provider.user_id)\
        .filter(Job.status == "completed")\
        .order_by(Job.completed_at.desc())\
        .all()
    
    job_responses = []
    for job in jobs:
        # Reviews are matched by provider and customer, not by specific job
        # job_code in reviews is an OTP code, not a job identifier
        job_responses.append(JobResponse(
            id=job.id,
            title=job.title,
            description=job.description,
            price=job.price,
            location=job.location,
            customer_name=job.customer.name,
            customer_phone=job.customer.phone_number,
            status=job.status,
            urgency=job.urgency,
            created_at=job.created_at,
            accepted_at=job.accepted_at,
            completed_at=job.completed_at,
            rating=None,  # Reviews not directly linked to jobs
            review=None   # Reviews not directly linked to jobs
        ))
    
    return job_responses

# Job Action Endpoints with Real Database Operations
@router.post("/jobs/{job_id}/accept")
def accept_job_request(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "provider":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only providers can accept jobs")
    
    provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider profile not found")
    
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.status != "pending":
        raise HTTPException(status_code=400, detail="Job is not available")
    
    # Accept the job
    job.provider_id = provider.user_id
    job.status = "accepted"
    job.accepted_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": f"Job {job_id} accepted successfully", "job_id": job_id}

@router.post("/jobs/{job_id}/reject")
def reject_job_request(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "provider":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only providers can reject jobs")
    
    provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider profile not found")
    
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.status != "pending":
        raise HTTPException(status_code=400, detail="Job is not available to reject")
    
    # Mark as rejected (or you can delete it)
    job.status = "rejected"
    
    db.commit()
    
    return {"message": f"Job {job_id} rejected successfully", "job_id": job_id}

@router.post("/jobs/{job_id}/complete")
def complete_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "provider":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only providers can complete jobs")
    
    provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider profile not found")
    
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.provider_id == provider.user_id
    ).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or not assigned to you")
    
    if job.status not in ["accepted", "in_progress"]:
        raise HTTPException(status_code=400, detail="Job cannot be completed")
    
    # Complete the job
    job.status = "completed"
    job.completed_at = datetime.utcnow()
    
    # Update provider stats
    provider.jobs_completed += 1
    provider.total_earnings += job.price
    
    # Recalculate average rating
    avg_rating = db.query(func.avg(Review.rating)).join(Job).filter(
        Job.provider_id == provider.user_id,
        Job.status == "completed"
    ).scalar()
    
    if avg_rating:
        provider.average_rating = Decimal(str(round(float(avg_rating), 1)))
    
    db.commit()
    
    return {"message": f"Job {job_id} completed successfully", "job_id": job_id}
