from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from backend.Database_connection.db import get_db
from backend.auth.routes import get_current_user
from backend.models.bookings import Booking, BookingStatus
from backend.models.reviews import Review
from backend.models.saved_providers import SavedProvider
from backend.models.providers import Provider
from backend.auth.models import User
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timezone
import random
import re


router = APIRouter(prefix="/dashboard", tags=["dashboard"])


# Phone number normalization helper
def normalize_phone(phone: str) -> str:
    """Normalize phone number by removing all non-digit characters"""
    if not phone:
        return phone
    # Remove all non-digit characters
    normalized = re.sub(r'\D', '', phone)
    # Remove leading country code if present (91 for India)
    if normalized.startswith('91') and len(normalized) > 10:
        normalized = normalized[2:]
    return normalized


# Pydantic Schemas
class ReviewDetail(BaseModel):
    customer_name: str
    customer_phone: str
    rating: float
    comment: Optional[str]
    created_at: str
    service: str


class CustomerDetail(BaseModel):
    name: str
    phone: str
    service: str
    booking_date: str


class ProviderStats(BaseModel):
    avg_rating: float
    total_reviews: int
    customers_served: int
    active_bookings: int
    pending_requests: int
    accepted_jobs: int
    reviews: List[ReviewDetail] = []
    served_customers: List[CustomerDetail] = []


class CustomerStats(BaseModel):
    active_bookings: int
    booking_history: int
    saved_providers: int
    pending_bookings: int
    accepted_bookings: int
    completed_bookings: int
    cancelled_bookings: int


class CreateBookingRequest(BaseModel):
    provider_phone: str
    service: str
    booking_type: str  # 'immediate' or 'scheduled'
    scheduled_date: Optional[str] = None
    scheduled_time: Optional[str] = None
    description: Optional[str] = None


class VerifyCodeRequest(BaseModel):
    booking_id: int
    code: str


class CompleteBookingRequest(BaseModel):
    booking_id: int
    completion_code: str


class ProviderCardResponse(BaseModel):
    phone: str
    name: str
    service: str
    description: Optional[str]
    rating: float
    location: Optional[str]
    reviews_count: int
    is_saved: bool


class BookingResponse(BaseModel):
    id: int
    customer_phone: str
    customer_name: str
    provider_phone: str
    provider_name: str
    service: str
    description: Optional[str]
    location: Optional[str]
    status: str
    booking_type: Optional[str] = "immediate"
    scheduled_date: Optional[str] = None
    scheduled_time: Optional[str] = None
    one_time_code: Optional[str] = None
    acceptance_code: Optional[str] = None
    completion_code: Optional[str] = None
    created_at: datetime


# ==================== CUSTOMER DASHBOARD ENDPOINTS ====================

@router.get("/customer/stats", response_model=CustomerStats)
async def get_customer_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics for customer"""
    if current_user.role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can access this endpoint"
        )
    
    # Active bookings (pending or accepted)
    active_bookings = db.query(Booking).filter(
        Booking.customer_phone == current_user.phone_number,
        or_(
            Booking.status == BookingStatus.PENDING,
            Booking.status == BookingStatus.ACCEPTED
        )
    ).count()
    
    # Total booking history
    booking_history = db.query(Booking).filter(
        Booking.customer_phone == current_user.phone_number
    ).count()
    
    # Saved providers count
    saved_providers = db.query(SavedProvider).filter(
        SavedProvider.customer_phone == current_user.phone_number
    ).count()
    
    # Pending bookings
    pending_bookings = db.query(Booking).filter(
        Booking.customer_phone == current_user.phone_number,
        Booking.status == BookingStatus.PENDING
    ).count()
    
    # Accepted bookings
    accepted_bookings = db.query(Booking).filter(
        Booking.customer_phone == current_user.phone_number,
        Booking.status == BookingStatus.ACCEPTED
    ).count()
    
    # Completed bookings
    completed_bookings = db.query(Booking).filter(
        Booking.customer_phone == current_user.phone_number,
        Booking.status == BookingStatus.COMPLETED
    ).count()
    
    # Cancelled bookings
    cancelled_bookings = db.query(Booking).filter(
        Booking.customer_phone == current_user.phone_number,
        or_(
            Booking.status == BookingStatus.CANCELLED,
            Booking.status == BookingStatus.REJECTED
        )
    ).count()
    
    return CustomerStats(
        active_bookings=active_bookings,
        booking_history=booking_history,
        saved_providers=saved_providers,
        pending_bookings=pending_bookings,
        accepted_bookings=accepted_bookings,
        completed_bookings=completed_bookings,
        cancelled_bookings=cancelled_bookings
    )


@router.post("/customer/create-booking")
async def create_booking(
    request: CreateBookingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new booking (immediate or scheduled)"""
    if current_user.role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can create bookings"
        )
    
    # Normalize phone numbers for consistent matching
    normalized_provider_phone = normalize_phone(request.provider_phone)
    
    print(f"\n📝 Creating booking:")
    print(f"   Customer: {current_user.name} ({current_user.phone_number})")
    print(f"   Provider phone (from request): {request.provider_phone}")
    print(f"   Provider phone (normalized): {normalized_provider_phone}")
    
    # Find provider - check all providers and match normalized phones
    all_providers = db.query(User).filter(User.role == "provider").all()
    provider = None
    
    for p in all_providers:
        if normalize_phone(p.phone_number) == normalized_provider_phone:
            provider = p
            break
    
    if not provider:
        print(f"   ❌ Provider not found with normalized phone: {normalized_provider_phone}")
        print(f"   Available providers:")
        for p in all_providers[:5]:
            print(f"      - {p.name}: {p.phone_number} (norm: {normalize_phone(p.phone_number)})")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Provider not found with phone: {request.provider_phone}"
        )
    
    print(f"   ✅ Found provider: {provider.name} (Phone in DB: {provider.phone_number})")
    
    # Get provider location from Provider model
    provider_profile = db.query(Provider).filter(
        Provider.user_id == provider.id
    ).first()
    
    location = provider_profile.location_name if provider_profile else None
    
    # Generate 6-digit one-time booking code
    one_time_code = str(random.randint(100000, 999999))
    
    # Create booking description
    if request.booking_type == "immediate":
        full_description = f"Immediate booking. {request.description or ''}".strip()
    else:
        full_description = f"Scheduled for {request.scheduled_date} at {request.scheduled_time}. {request.description or ''}".strip()
    
    # Create booking - USE PROVIDER'S ACTUAL PHONE FROM DATABASE
    new_booking = Booking(
        customer_phone=current_user.phone_number,
        provider_phone=provider.phone_number,  # Use provider's phone from DB, not request
        service=request.service,
        description=full_description,
        location=location,
        status=BookingStatus.PENDING,
        booking_type=request.booking_type,
        scheduled_date=request.scheduled_date,
        scheduled_time=request.scheduled_time,
        one_time_code=one_time_code
    )
    
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    
    # Debug logging
    print(f"✅ Booking created successfully!")
    print(f"   Booking ID: {new_booking.id}")
    print(f"   Customer Phone: {new_booking.customer_phone}")
    print(f"   Provider Phone: {new_booking.provider_phone}")
    print(f"   Service: {new_booking.service}")
    print(f"   Status: {new_booking.status}")
    print(f"   Type: {new_booking.booking_type}")
    print(f"   Code: {new_booking.one_time_code}")
    
    return {
        "success": True,
        "message": "Booking created successfully",
        "booking_id": new_booking.id,
        "one_time_code": one_time_code,
        "status": new_booking.status.value,
        "booking_type": new_booking.booking_type
    }


@router.get("/customer/providers", response_model=List[ProviderCardResponse])
async def get_providers_for_customer(
    search: Optional[str] = None,
    service: Optional[str] = None,
    location: Optional[str] = None,
    min_rating: Optional[float] = None,
    skip: int = 0,
    limit: int = 100,  # Increased default limit to show more providers
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of providers with filters for customer dashboard"""
    
    # Optimized query with all JOINs
    # Get users with their IDs, then join with providers and calculate ratings
    query = db.query(
        User.id,
        User.phone_number,
        User.name,
        Provider.location_name,
        Provider.bio,
        func.coalesce(func.avg(Review.rating), 0.0).label('avg_rating'),
        func.count(Review.rating).label('review_count')  # Count ratings, not IDs
    ).outerjoin(Provider, User.id == Provider.user_id
    ).outerjoin(Review, User.id == Review.provider_id
    ).filter(User.role == "provider"
    ).group_by(User.id, User.phone_number, User.name, Provider.location_name, Provider.bio)
    
    # Apply filters (handle NULL values from LEFT JOIN)
    if search:
        search_conditions = [User.name.ilike(f"%{search}%")]
        # Only add Provider filters if the provider profile exists
        search_conditions.append(
            and_(
                Provider.bio.isnot(None),
                Provider.bio.ilike(f"%{search}%")
            )
        )
        search_conditions.append(
            and_(
                Provider.location_name.isnot(None),
                Provider.location_name.ilike(f"%{search}%")
            )
        )
        query = query.filter(or_(*search_conditions))
    
    if service and service.lower() != "all":
        query = query.filter(
            and_(
                Provider.bio.isnot(None),
                Provider.bio.ilike(f"%{service}%")
            )
        )
    
    if location and location.lower() != "all":
        query = query.filter(
            and_(
                Provider.location_name.isnot(None),
                Provider.location_name.ilike(f"%{location}%")
            )
        )
    
    providers_data = query.offset(skip).limit(limit).all()
    
    # Get all saved providers for this customer in one query
    saved_providers_phones = {
        sp.provider_phone for sp in db.query(SavedProvider.provider_phone).filter(
            SavedProvider.customer_phone == current_user.phone_number
        ).all()
    }
    
    # Calculate rating and review count for each provider
    result = []
    for user_id, phone_number, name, location_name, bio, avg_rating, review_count in providers_data:
        # Extract service from bio (format: "Experienced {service} in {location}")
        service = "General Services"
        description = bio or "No description available"
        
        if bio and "Experienced" in bio:
            try:
                service = bio.split("Experienced")[1].split("in")[0].strip()
            except:
                pass
        
        # Rating is already calculated in the query
        avg_rating = float(avg_rating) if avg_rating else 0.0
        
        # Apply rating filter
        if min_rating and avg_rating < min_rating:
            continue
        
        # Check if saved using pre-fetched set
        is_saved = phone_number in saved_providers_phones
        
        result.append(ProviderCardResponse(
            phone=phone_number,
            name=name,
            service=service,
            description=description,
            rating=round(avg_rating, 1),
            location=location_name or "Location not specified",
            reviews_count=review_count,
            is_saved=is_saved
        ))
    
    return result


@router.get("/customer/bookings", response_model=List[BookingResponse])
async def get_customer_bookings(
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get customer's bookings with optional status filter"""
    # Normalize the current user's phone
    normalized_customer_phone = normalize_phone(current_user.phone_number)
    
    # Find all bookings where normalized phones match
    all_bookings = db.query(Booking).all()
    matching_bookings = [
        b for b in all_bookings 
        if normalize_phone(b.customer_phone) == normalized_customer_phone
    ]
    
    # Filter by status if provided
    if status_filter:
        status_upper = status_filter.upper()
        if status_upper == 'ACTIVE':
            # Active means PENDING or ACCEPTED
            matching_bookings = [
                b for b in matching_bookings 
                if b.status in [BookingStatus.PENDING, BookingStatus.ACCEPTED]
            ]
        elif status_upper == 'CANCELLED':
            # Cancelled includes both CANCELLED and REJECTED
            matching_bookings = [
                b for b in matching_bookings 
                if b.status in [BookingStatus.CANCELLED, BookingStatus.REJECTED]
            ]
        else:
            # Match exact status
            try:
                target_status = BookingStatus[status_upper]
                matching_bookings = [
                    b for b in matching_bookings 
                    if b.status == target_status
                ]
            except KeyError:
                # Invalid status, return empty list
                matching_bookings = []
    
    # Sort by created_at descending
    matching_bookings.sort(key=lambda x: x.created_at, reverse=True)
    
    # Enrich with user names
    result = []
    for booking in matching_bookings:
        provider = db.query(User).filter(User.phone_number == booking.provider_phone).first()
        customer = db.query(User).filter(User.phone_number == booking.customer_phone).first()
        
        result.append(BookingResponse(
            id=booking.id,
            customer_phone=booking.customer_phone,
            customer_name=customer.name if customer else "Unknown",
            provider_phone=booking.provider_phone,
            provider_name=provider.name if provider else "Unknown",
            service=booking.service,
            description=booking.description,
            location=booking.location,
            status=booking.status.value,
            booking_type=booking.booking_type or "immediate",
            scheduled_date=booking.scheduled_date,
            scheduled_time=booking.scheduled_time,
            one_time_code=booking.one_time_code,
            acceptance_code=booking.acceptance_code,
            completion_code=booking.completion_code,
            created_at=booking.created_at
        ))
    
    return result


# ==================== PROVIDER DASHBOARD ENDPOINTS ====================

@router.get("/provider/stats", response_model=ProviderStats)
async def get_provider_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics for provider"""
    if current_user.role != "provider":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only providers can access this endpoint"
        )
    
    # Normalize provider phone
    normalized_provider_phone = normalize_phone(current_user.phone_number)
    
    # Average rating using provider_id (not provider_phone)
    rating_stats = db.query(
        func.avg(Review.rating).label('avg_rating'),
        func.count(Review.id).label('total_reviews')
    ).filter(Review.provider_id == current_user.id).first()
    
    avg_rating = float(rating_stats.avg_rating) if rating_stats.avg_rating else 0.0
    total_reviews = rating_stats.total_reviews or 0
    
    # Get all bookings and filter by normalized phone
    all_bookings = db.query(Booking).all()
    provider_bookings = [b for b in all_bookings if normalize_phone(b.provider_phone) == normalized_provider_phone]
    
    # Customers served (completed bookings)
    completed_bookings = [b for b in provider_bookings if b.status == BookingStatus.COMPLETED]
    unique_customers = set(b.customer_phone for b in completed_bookings)
    customers_served = len(unique_customers)
    
    # Active bookings (pending or accepted)
    # Active bookings (pending or accepted)
    active_bookings = len([b for b in provider_bookings if b.status in [BookingStatus.PENDING, BookingStatus.ACCEPTED]])
    
    # Pending requests
    pending_requests = len([b for b in provider_bookings if b.status == BookingStatus.PENDING])
    
    # Accepted jobs
    accepted_jobs = len([b for b in provider_bookings if b.status == BookingStatus.ACCEPTED])
    
    # Get detailed reviews with customer info
    reviews_list = []
    reviews = db.query(Review).filter(Review.provider_id == current_user.id).order_by(Review.created_at.desc()).all()
    for review in reviews:
        customer = db.query(User).filter(User.id == review.customer_id).first()
        booking = db.query(Booking).filter(Booking.id == review.booking_id).first()
        if customer and booking:
            reviews_list.append(ReviewDetail(
                customer_name=customer.name,
                customer_phone=customer.phone_number,
                rating=review.rating,
                comment=review.comment or "No comment provided",
                created_at=review.created_at.strftime("%Y-%m-%d %H:%M:%S") if review.created_at else "",
                service=booking.service
            ))
    
    # Get served customers with details
    served_customers_list = []
    for booking in completed_bookings:
        customer = db.query(User).filter(User.phone_number == booking.customer_phone).first()
        if customer:
            served_customers_list.append(CustomerDetail(
                name=customer.name,
                phone=customer.phone_number,
                service=booking.service,
                booking_date=booking.created_at.strftime("%Y-%m-%d") if booking.created_at else ""
            ))
    
    return ProviderStats(
        avg_rating=round(avg_rating, 1),
        total_reviews=total_reviews,
        customers_served=customers_served,
        active_bookings=active_bookings,
        pending_requests=pending_requests,
        accepted_jobs=accepted_jobs,
        reviews=reviews_list,
        served_customers=served_customers_list
    )


@router.get("/provider/pending-requests", response_model=List[BookingResponse])
async def get_provider_pending_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get pending booking requests for provider"""
    if current_user.role != "provider":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only providers can access this endpoint"
        )
    
    # Debug logging
    print(f"\n📋 Fetching pending requests for provider:")
    print(f"   Provider Name: {current_user.name}")
    print(f"   Provider Phone (in DB): {current_user.phone_number}")
    
    # Normalize provider phone for matching
    normalized_provider_phone = normalize_phone(current_user.phone_number)
    print(f"   Provider Phone (normalized): {normalized_provider_phone}")
    
    # Get ALL pending bookings and filter in Python (more reliable than SQL regex)
    all_pending_bookings = db.query(Booking).filter(
        Booking.status == BookingStatus.PENDING
    ).order_by(Booking.created_at.desc()).all()
    
    # Filter bookings that match this provider
    bookings = []
    for booking in all_pending_bookings:
        normalized_booking_phone = normalize_phone(booking.provider_phone)
        if normalized_booking_phone == normalized_provider_phone:
            bookings.append(booking)
    
    print(f"   Total pending bookings in system: {len(all_pending_bookings)}")
    print(f"   Bookings matching this provider: {len(bookings)}")
    
    if len(bookings) == 0 and len(all_pending_bookings) > 0:
        print(f"   ⚠️  No matches found. Comparing phone numbers:")
        for b in all_pending_bookings[:5]:
            norm_booking_phone = normalize_phone(b.provider_phone)
            match = "✅ MATCH" if norm_booking_phone == normalized_provider_phone else "❌ NO MATCH"
            print(f"      - Booking ID {b.id}: {b.provider_phone} → {norm_booking_phone} {match}")
    
    # Enrich with customer names
    result = []
    for booking in bookings:
        customer = db.query(User).filter(User.phone_number == booking.customer_phone).first()
        provider_user = db.query(User).filter(User.phone_number == booking.provider_phone).first()
        
        result.append(BookingResponse(
            id=booking.id,
            customer_phone=booking.customer_phone,
            customer_name=customer.name if customer else "Unknown",
            provider_phone=booking.provider_phone,
            provider_name=provider_user.name if provider_user else "Unknown",
            service=booking.service,
            description=booking.description,
            location=booking.location,
            status=booking.status.value,
            booking_type=booking.booking_type,
            scheduled_date=booking.scheduled_date,
            scheduled_time=booking.scheduled_time,
            one_time_code=booking.one_time_code,
            acceptance_code=booking.acceptance_code,
            completion_code=booking.completion_code,
            created_at=booking.created_at
        ))
    
    print(f"   ✅ Returning {len(result)} booking(s)\n")
    return result


@router.get("/provider/accepted-jobs", response_model=List[BookingResponse])
async def get_provider_accepted_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get accepted jobs for provider"""
    if current_user.role != "provider":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only providers can access this endpoint"
        )
    
    # Normalize provider phone
    normalized_provider_phone = normalize_phone(current_user.phone_number)
    
    # Get ALL accepted bookings and filter in Python
    all_accepted_bookings = db.query(Booking).filter(
        Booking.status == BookingStatus.ACCEPTED
    ).order_by(Booking.created_at.desc()).all()
    
    # Filter bookings that match this provider
    bookings = []
    for booking in all_accepted_bookings:
        if normalize_phone(booking.provider_phone) == normalized_provider_phone:
            bookings.append(booking)
    
    # Enrich with customer names
    result = []
    for booking in bookings:
        customer = db.query(User).filter(User.phone_number == booking.customer_phone).first()
        provider = db.query(User).filter(User.phone_number == booking.provider_phone).first()
        
        result.append(BookingResponse(
            id=booking.id,
            customer_phone=booking.customer_phone,
            customer_name=customer.name if customer else "Unknown",
            provider_phone=booking.provider_phone,
            provider_name=provider.name if provider else "Unknown",
            service=booking.service,
            description=booking.description,
            location=booking.location,
            status=booking.status.value,
            booking_type=booking.booking_type,
            scheduled_date=booking.scheduled_date,
            scheduled_time=booking.scheduled_time,
            one_time_code=booking.one_time_code,
            acceptance_code=booking.acceptance_code,
            completion_code=booking.completion_code,
            created_at=booking.created_at
        ))
    
    return result


# ==================== BOOKING ACTIONS ====================

class AcceptBookingRequest(BaseModel):
    booking_id: int


@router.post("/provider/accept-booking")
async def accept_booking(
    request: AcceptBookingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Provider accepts a booking request"""
    if current_user.role != "provider":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only providers can accept bookings"
        )
    
    booking = db.query(Booking).filter(
        Booking.id == request.booking_id,
        Booking.provider_phone == current_user.phone_number,
        Booking.status == BookingStatus.PENDING
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found or already processed"
        )
    
    # Generate 6-digit acceptance code (shown to provider and customer)
    acceptance_code = str(random.randint(100000, 999999))
    
    booking.status = BookingStatus.ACCEPTED
    booking.acceptance_code = acceptance_code
    
    db.commit()
    
    return {
        "message": "Booking accepted successfully",
        "booking_id": booking.id,
        "acceptance_code": acceptance_code,
        "customer_phone": booking.customer_phone
    }


@router.post("/provider/reject-booking")
async def reject_booking(
    request: AcceptBookingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Provider rejects a booking request"""
    if current_user.role != "provider":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only providers can reject bookings"
        )
    
    booking = db.query(Booking).filter(
        Booking.id == request.booking_id,
        Booking.provider_phone == current_user.phone_number,
        Booking.status == BookingStatus.PENDING
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found or already processed"
        )
    
    booking.status = BookingStatus.REJECTED
    db.commit()
    
    return {"message": "Booking rejected successfully"}


@router.post("/provider/cancel-job")
async def cancel_accepted_job(
    request: AcceptBookingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Provider cancels an accepted job"""
    if current_user.role != "provider":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only providers can cancel jobs"
        )
    
    booking = db.query(Booking).filter(
        Booking.id == request.booking_id,
        Booking.provider_phone == current_user.phone_number,
        Booking.status == BookingStatus.ACCEPTED
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Accepted job not found"
        )
    
    booking.status = BookingStatus.CANCELLED
    db.commit()
    
    return {"message": "Job cancelled successfully"}


# ==================== SAVED PROVIDERS ====================

class SaveProviderRequest(BaseModel):
    provider_phone: str


@router.post("/customer/save-provider")
async def save_provider(
    request: SaveProviderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Customer saves a provider to favorites"""
    if current_user.role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can save providers"
        )
    
    # Check if provider exists
    provider = db.query(User).filter(
        User.phone_number == request.provider_phone,
        User.role == "provider"
    ).first()
    
    if not provider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provider not found"
        )
    
    # Check if already saved using customer_phone and provider_phone
    existing = db.query(SavedProvider).filter(
        SavedProvider.customer_phone == current_user.phone_number,
        SavedProvider.provider_phone == request.provider_phone
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provider already saved"
        )
    
    # Save provider using phone numbers
    saved = SavedProvider(
        customer_phone=current_user.phone_number,
        provider_phone=request.provider_phone
    )
    db.add(saved)
    db.commit()
    
    return {"message": "Provider saved successfully"}


@router.post("/customer/unsave-provider")
async def unsave_provider(
    request: SaveProviderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Customer removes a provider from favorites"""
    if current_user.role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can unsave providers"
        )
    
    # Find and delete using customer_phone and provider_phone
    saved = db.query(SavedProvider).filter(
        SavedProvider.customer_phone == current_user.phone_number,
        SavedProvider.provider_phone == request.provider_phone
    ).first()
    
    if not saved:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provider not in saved list"
        )
    
    db.delete(saved)
    db.commit()
    
    return {"message": "Provider removed from saved list"}


# ==================== CODE VERIFICATION & BOOKING COMPLETION ====================

@router.post("/customer/verify-acceptance-code")
async def verify_acceptance_code(
    request: VerifyCodeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Customer verifies the acceptance code from provider"""
    if current_user.role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can verify codes"
        )
    
    booking = db.query(Booking).filter(
        Booking.id == request.booking_id,
        Booking.customer_phone == current_user.phone_number
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    if booking.status != BookingStatus.ACCEPTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking is not in accepted status"
        )
    
    if booking.acceptance_code != request.code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid acceptance code"
        )
    
    return {
        "success": True,
        "message": "Code verified successfully",
        "provider_name": booking.provider_phone  # You can enhance this with actual provider name
    }


@router.post("/customer/complete-booking")
async def complete_booking(
    request: AcceptBookingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Customer requests to complete booking - generates completion code for mandatory review"""
    if current_user.role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can complete bookings"
        )
    
    booking = db.query(Booking).filter(
        Booking.id == request.booking_id,
        Booking.customer_phone == current_user.phone_number,
        Booking.status == BookingStatus.ACCEPTED
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found or not in accepted status"
        )
    
    # Generate completion code for mandatory review
    completion_code = str(random.randint(100000, 999999))
    
    # Store completion code but keep status as ACCEPTED
    # Status will change to COMPLETED only after review is submitted
    booking.completion_code = completion_code
    
    db.commit()
    
    return {
        "success": True,
        "message": "Work marked as finished. Please submit a review to complete the booking.",
        "booking_id": booking.id,
        "completion_code": completion_code,
        "note": "Review is mandatory to complete this booking"
    }


class CreateReviewRequest(BaseModel):
    booking_id: int
    completion_code: str
    rating: float
    comment: Optional[str] = None


@router.post("/customer/create-review")
async def create_review(
    request: CreateReviewRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Customer creates a mandatory review - booking completion requires review"""
    if current_user.role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can create reviews"
        )
    
    # Verify booking and completion code
    booking = db.query(Booking).filter(
        Booking.id == request.booking_id,
        Booking.customer_phone == current_user.phone_number,
        Booking.status == BookingStatus.ACCEPTED  # Changed from COMPLETED
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found or not in accepted status"
        )
    
    if not booking.completion_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please mark the work as finished first"
        )
    
    if booking.completion_code != request.completion_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid completion code"
        )
    
    # Validate rating
    if request.rating < 1.0 or request.rating > 5.0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be between 1.0 and 5.0"
        )
    
    # Get provider and customer IDs
    provider = db.query(User).filter(User.phone_number == booking.provider_phone).first()
    customer = db.query(User).filter(User.phone_number == booking.customer_phone).first()
    
    if not provider or not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provider or customer not found"
        )
    
    # Check if review already exists for this booking
    existing_review = db.query(Review).filter(
        Review.provider_id == provider.id,
        Review.customer_id == customer.id,
        Review.booking_id == booking.id
    ).first()
    
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Review already submitted for this booking"
        )
    
    # Create review
    review = Review(
        provider_id=provider.id,
        customer_id=customer.id,
        booking_id=booking.id,
        rating=request.rating,
        comment=request.comment
    )
    
    db.add(review)
    
    # NOW mark booking as completed (review is mandatory)
    booking.status = BookingStatus.COMPLETED
    
    db.commit()
    
    return {
        "success": True,
        "message": "Review submitted successfully and booking marked as completed",
        "review_id": review.id,
        "booking_status": "completed"
    }
