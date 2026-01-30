"""
User profile API routes.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional

from app.core.auth import get_current_user, get_current_user_with_profile, TokenData
from app.services.user_service import user_service


router = APIRouter(prefix="/api/users", tags=["users"])


class ProfileResponse(BaseModel):
    """User profile response."""
    id: str
    email: str
    name: Optional[str] = None
    plan: Optional[str] = None
    plan_status: Optional[str] = None
    trial_ends_at: Optional[str] = None
    role: str = "user"


class UpdatePlanRequest(BaseModel):
    """Request to update user plan."""
    plan: str  # 'starter' | 'professional' | 'business'


class CreateProfileRequest(BaseModel):
    """Request to create/update profile on signup."""
    name: Optional[str] = None


@router.get("/me", response_model=ProfileResponse)
async def get_current_profile(
    current_user: TokenData = Depends(get_current_user)
):
    """
    Get current user's profile.
    Creates profile if it doesn't exist (first login).
    """
    profile = await user_service.get_or_create_profile(
        user_id=current_user.user_id,
        email=current_user.email or "",
        name=None
    )
    
    return ProfileResponse(
        id=profile.get("id", current_user.user_id),
        email=profile.get("email", current_user.email or ""),
        name=profile.get("name"),
        plan=profile.get("plan"),
        plan_status=profile.get("plan_status"),
        trial_ends_at=profile.get("trial_ends_at"),
        role=profile.get("role", "user"),
    )


@router.post("/me/profile")
async def create_or_update_profile(
    request: CreateProfileRequest,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Create or update profile with name.
    Called after signup.
    """
    profile = await user_service.get_or_create_profile(
        user_id=current_user.user_id,
        email=current_user.email or "",
        name=request.name
    )
    
    # Update name if provided and different
    if request.name and profile.get("name") != request.name:
        profile = await user_service.update_profile(
            user_id=current_user.user_id,
            data={"name": request.name}
        )
    
    return {"success": True, "profile": profile}


@router.put("/me/plan")
async def update_plan(
    request: UpdatePlanRequest,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Update user's plan.
    
    - starter: Always active (free)
    - professional/business: Starts with 7-day trial
    """
    valid_plans = ["starter", "professional", "business"]
    if request.plan not in valid_plans:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid plan. Must be one of: {', '.join(valid_plans)}"
        )
    
    profile = await user_service.update_plan(
        user_id=current_user.user_id,
        plan=request.plan
    )
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update plan"
        )
    
    return {
        "success": True,
        "plan": profile.get("plan"),
        "plan_status": profile.get("plan_status"),
        "trial_ends_at": profile.get("trial_ends_at"),
    }
