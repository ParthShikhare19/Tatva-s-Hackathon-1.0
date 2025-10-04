from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..Database_connection.db import get_db
from ..models.providers import Provider
from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal

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
    years_of_experience: Optional[int] = Field(None, description="Years of experience")

class ProviderProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100, description="User's name")
    email_id: Optional[str] = Field(None, max_length=255, description="User's email")
    bio: Optional[str] = Field(None, max_length=1000, description="Provider biography")
    location_name: Optional[str] = Field(None, max_length=255, description="Provider location")
    years_of_experience: Optional[int] = Field(None, description="Years of experience")

class ProviderProfileResponse(BaseModel):
    user_id: int
    name: str  # User's name
    phone_number: str  # User's phone number
    email_id: Optional[str]  # User's email
    bio: Optional[str]
    location_name: Optional[str]
    years_of_experience: Optional[int]  # Years of experience
    average_rating: Decimal
    jobs_completed: int
    is_verified: bool

    class Config:
        from_attributes = True

# Routes
@router.post("/profile", response_model=ProviderProfileResponse, status_code=status.HTTP_201_CREATED)
def create_provider_profile(
    profile_data: ProviderProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a provider profile for the authenticated user.
    Only users with role 'provider' can create a provider profile.
    """
    # Verify user is a provider
    if current_user.role != "provider":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users with provider role can create a provider profile"
        )
    
    # Check if provider profile already exists
    existing_provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
    if existing_provider:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provider profile already exists. Use PUT /providers/profile to update."
        )
    
    # Create provider profile
    new_provider = Provider(
        user_id=current_user.id,
        bio=profile_data.bio,
        location_name=profile_data.location_name,
        years_of_experience=profile_data.years_of_experience,
        average_rating=Decimal("0.0"),
        jobs_completed=0,
        is_verified=False
    )
    
    db.add(new_provider)
    db.commit()
    db.refresh(new_provider)
    
    return ProviderProfileResponse(
        user_id=new_provider.user_id,
        name=current_user.name,
        phone_number=current_user.phone_number,
        email_id=current_user.email_id,
        bio=new_provider.bio,
        location_name=new_provider.location_name,
        years_of_experience=new_provider.years_of_experience,
        average_rating=new_provider.average_rating,
        jobs_completed=new_provider.jobs_completed,
        is_verified=new_provider.is_verified
    )

@router.put("/profile", response_model=ProviderProfileResponse)
def update_provider_profile(
    profile_data: ProviderProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update the provider profile for the authenticated user.
    Only users with role 'provider' can update their provider profile.
    """
    # Verify user is a provider
    if current_user.role != "provider":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users with provider role can update a provider profile"
        )
    
    # Get existing provider profile
    provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
    if not provider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provider profile not found. Use POST /providers/profile to create one."
        )
    
    # Query user from current session (important to avoid session errors)
    user = db.query(User).filter(User.id == current_user.id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update user name if provided
    if profile_data.name is not None:
        user.name = profile_data.name
    
    # Update user email if provided
    if profile_data.email_id is not None:
        user.email_id = profile_data.email_id
    
    # Update provider fields if provided
    if profile_data.bio is not None:
        provider.bio = profile_data.bio
    if profile_data.location_name is not None:
        provider.location_name = profile_data.location_name
    if profile_data.years_of_experience is not None:
        provider.years_of_experience = profile_data.years_of_experience
    
    db.commit()
    db.refresh(provider)
    db.refresh(user)
    
    # Return combined user and provider data
    return ProviderProfileResponse(
        user_id=provider.user_id,
        name=user.name,
        phone_number=user.phone_number,
        email_id=user.email_id,
        bio=provider.bio,
        location_name=provider.location_name,
        years_of_experience=provider.years_of_experience,
        average_rating=provider.average_rating,
        jobs_completed=provider.jobs_completed,
        is_verified=provider.is_verified
    )

@router.get("/profile", response_model=ProviderProfileResponse)
def get_my_provider_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the provider profile for the authenticated user.
    """
    # Verify user is a provider
    if current_user.role != "provider":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users with provider role can access provider profiles"
        )
    
    provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
    if not provider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provider profile not found"
        )
    
    # Combine user and provider data
    return ProviderProfileResponse(
        user_id=provider.user_id,
        name=current_user.name,
        phone_number=current_user.phone_number,
        email_id=current_user.email_id,
        bio=provider.bio,
        location_name=provider.location_name,
        years_of_experience=provider.years_of_experience,
        average_rating=provider.average_rating,
        jobs_completed=provider.jobs_completed,
        is_verified=provider.is_verified
    )

@router.get("/profile/{provider_id}", response_model=ProviderProfileResponse)
def get_provider_profile_by_id(
    provider_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a provider profile by provider ID (user_id).
    Public endpoint - no authentication required.
    """
    provider = db.query(Provider).filter(Provider.user_id == provider_id).first()
    if not provider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provider profile not found"
        )
    
    # Get user data
    user = db.query(User).filter(User.id == provider.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Return combined user and provider data
    return ProviderProfileResponse(
        user_id=provider.user_id,
        name=user.name,
        phone_number=user.phone_number,
        email_id=user.email_id,
        bio=provider.bio,
        location_name=provider.location_name,
        years_of_experience=provider.years_of_experience,
        average_rating=provider.average_rating,
        jobs_completed=provider.jobs_completed,
        is_verified=provider.is_verified
    )

@router.delete("/profile", status_code=status.HTTP_204_NO_CONTENT)
def delete_provider_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete the provider profile for the authenticated user.
    """
    # Verify user is a provider
    if current_user.role != "provider":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users with provider role can delete a provider profile"
        )
    
    provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
    if not provider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provider profile not found"
        )
    
    db.delete(provider)
    db.commit()
    
    return None
