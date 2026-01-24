from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from datetime import datetime, timedelta
from pydantic import BaseModel

from app.core.auth import get_current_user, TokenData
from app.core.supabase import get_supabase

router = APIRouter()


class AnalyticsOverview(BaseModel):
    """Analytics overview response."""
    total_impressions: int = 0
    engagement_rate: float = 0.0
    total_comments: int = 0
    total_shares: int = 0
    growth_rate: float = 0.0


class PlatformMetrics(BaseModel):
    """Platform-specific metrics."""
    platform: str
    impressions: int = 0
    likes: int = 0
    comments: int = 0
    shares: int = 0
    engagement_rate: float = 0.0


@router.get("/overview", response_model=AnalyticsOverview)
async def get_analytics_overview(
    days: int = 30,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Get aggregated analytics overview for the authenticated user.
    
    - **days**: Number of days to look back (default: 30)
    """
    # Import mock data service
    from app.services.mock_data import get_mock_analytics_overview
    
    supabase = get_supabase()
    
    try:
        # Get metrics from database
        since_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        response = supabase.table("metrics").select(
            "likes, comments, shares, reach, impressions, engagement_rate"
        ).gte("collected_at", since_date).execute()
        
        # If no data, return mock data for demo
        if not response.data:
            mock = get_mock_analytics_overview(current_user.user_id)
            return AnalyticsOverview(**mock)
        
        # Aggregate metrics
        total_impressions = sum(m.get("impressions", 0) for m in response.data)
        total_comments = sum(m.get("comments", 0) for m in response.data)
        total_shares = sum(m.get("shares", 0) for m in response.data)
        total_likes = sum(m.get("likes", 0) for m in response.data)
        total_reach = sum(m.get("reach", 0) for m in response.data)
        
        # Calculate engagement rate
        engagement_rate = 0.0
        if total_reach > 0:
            engagement_rate = ((total_likes + total_comments + total_shares) / total_reach) * 100
        
        return AnalyticsOverview(
            total_impressions=total_impressions,
            engagement_rate=round(engagement_rate, 2),
            total_comments=total_comments,
            total_shares=total_shares,
            growth_rate=12.5  # TODO: Calculate from historical data
        )
        
    except Exception as e:
        # On any error, return mock data for demo
        mock = get_mock_analytics_overview(current_user.user_id)
        return AnalyticsOverview(**mock)


@router.get("/platform/{platform}", response_model=PlatformMetrics)
async def get_platform_analytics(
    platform: str,
    days: int = 30,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Get analytics for a specific platform.
    
    - **platform**: Platform name (instagram, youtube, twitter, linkedin)
    - **days**: Number of days to look back (default: 30)
    """
    from app.services.mock_data import get_mock_platform_metrics
    
    supabase = get_supabase()
    
    try:
        since_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        # Get posts for this platform
        posts_response = supabase.table("posts").select("id").eq(
            "platform", platform
        ).eq("user_id", current_user.user_id).execute()
        
        if not posts_response.data:
            # Return mock data for demo
            mock = get_mock_platform_metrics(platform)
            return PlatformMetrics(**mock)
        
        post_ids = [p["id"] for p in posts_response.data]
        
        # Get metrics for these posts
        metrics_response = supabase.table("metrics").select(
            "likes, comments, shares, reach, impressions"
        ).in_("post_id", post_ids).gte("collected_at", since_date).execute()
        
        if not metrics_response.data:
            mock = get_mock_platform_metrics(platform)
            return PlatformMetrics(**mock)
        
        # Aggregate
        total_impressions = sum(m.get("impressions", 0) for m in metrics_response.data)
        total_likes = sum(m.get("likes", 0) for m in metrics_response.data)
        total_comments = sum(m.get("comments", 0) for m in metrics_response.data)
        total_shares = sum(m.get("shares", 0) for m in metrics_response.data)
        total_reach = sum(m.get("reach", 0) for m in metrics_response.data)
        
        engagement_rate = 0.0
        if total_reach > 0:
            engagement_rate = ((total_likes + total_comments + total_shares) / total_reach) * 100
        
        return PlatformMetrics(
            platform=platform,
            impressions=total_impressions,
            likes=total_likes,
            comments=total_comments,
            shares=total_shares,
            engagement_rate=round(engagement_rate, 2)
        )
        
    except Exception as e:
        # Return mock data on error
        mock = get_mock_platform_metrics(platform)
        return PlatformMetrics(**mock)


@router.get("/compare")
async def compare_platforms(
    current_user: TokenData = Depends(get_current_user)
):
    """
    Compare metrics across all connected platforms.
    """
    platforms = ["instagram", "youtube", "twitter", "linkedin"]
    results = []
    
    for platform in platforms:
        try:
            metrics = await get_platform_analytics(platform, 30, current_user)
            results.append(metrics.model_dump())
        except:
            pass
    
    # Find best performing
    best_platform = max(results, key=lambda x: x["engagement_rate"]) if results else None
    
    return {
        "platforms": results,
        "best_platform": best_platform["platform"] if best_platform else None,
        "best_engagement_rate": best_platform["engagement_rate"] if best_platform else 0
    }
