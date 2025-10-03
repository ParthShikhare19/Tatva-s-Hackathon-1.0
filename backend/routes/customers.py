from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..Database_connection.db import get_db
from ..models.customers import Customer
from pydantic import BaseModel, Field
from typing import Optional

# Import auth dependency
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))
from auth.routes import get_current_user
from auth.models import User

router = APIRouter(prefix="/customers", tags=["Customers"])

# Schemas
class CustomerProfileCreate(BaseModel):
    address: Optional[str] = Field(None, max_length=500, description="Customer address")
    location_name: Optional[str] = Field(None, max_length=255, description="Customer location")
    preferences: Optional[str] = Field(None, max_length=500, description="Service preferences")

class CustomerProfileUpdate(BaseModel):
    address: Optional[str] = Field(None, max_length=500, description="Customer address")
    location_name: Optional[str] = Field(None, max_length=255, description="Customer location")
    preferences: Optional[str] = Field(None, max_length=500, description="Service preferences")

class CustomerProfileResponse(BaseModel):
    user_id: int
    address: Optional[str]
    location_name: Optional[str]
    preferences: Optional[str]

    class Config:
        from_attributes = True

# Routes
@router.post("/profile", response_model=CustomerProfileResponse, status_code=status.HTTP_201_CREATED)
def create_customer_profile(
    profile_data: CustomerProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a customer profile for the authenticated user.
    Only users with role 'customer' can create a customer profile.
    """
    # Verify user is a customer
    if current_user.role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users with customer role can create a customer profile"
        )
    
    # Check if customer profile already exists
    existing_customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
    if existing_customer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Customer profile already exists. Use PUT /customers/profile to update."
        )
    
    # Create customer profile
    new_customer = Customer(
        user_id=current_user.id,
        address=profile_data.address,
        location_name=profile_data.location_name,
        preferences=profile_data.preferences
    )
    
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    
    return new_customer

@router.put("/profile", response_model=CustomerProfileResponse)
def update_customer_profile(
    profile_data: CustomerProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update the customer profile for the authenticated user.
    Only users with role 'customer' can update their customer profile.
    """
    # Verify user is a customer
    if current_user.role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users with customer role can update a customer profile"
        )
    
    # Get existing customer profile
    customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer profile not found. Use POST /customers/profile to create one."
        )
    
    # Update only provided fields
    if profile_data.address is not None:
        customer.address = profile_data.address
    if profile_data.location_name is not None:
        customer.location_name = profile_data.location_name
    if profile_data.preferences is not None:
        customer.preferences = profile_data.preferences
    
    db.commit()
    db.refresh(customer)
    
    return customer

@router.get("/profile", response_model=CustomerProfileResponse)
def get_my_customer_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the customer profile for the authenticated user.
    """
    # Verify user is a customer
    if current_user.role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users with customer role can access customer profiles"
        )
    
    customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer profile not found"
        )
    
    return customer

@router.get("/profile/{customer_id}", response_model=CustomerProfileResponse)
def get_customer_profile_by_id(
    customer_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a customer profile by customer ID (user_id).
    Public endpoint - no authentication required.
    """
    customer = db.query(Customer).filter(Customer.user_id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer profile not found"
        )
    
    return customer

@router.delete("/profile", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete the customer profile for the authenticated user.
    """
    # Verify user is a customer
    if current_user.role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users with customer role can delete a customer profile"
        )
    
    customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer profile not found"
        )
    
    db.delete(customer)
    db.commit()
    
    return None
