"""
Instagram Graph API service for fetching real Instagram statistics.
"""
import httpx
from typing import Optional
from datetime import datetime

from app.routers.oauth import get_tokens


INSTAGRAM_API_BASE = "https://graph.facebook.com/v18.0"


async def get_instagram_account() -> Optional[dict]:
    """
    Get Instagram Business Account info.
    """
    tokens = get_tokens("instagram")
    if not tokens:
        return None
    
    async with httpx.AsyncClient() as client:
        # Get user's pages first
        pages_response = await client.get(
            f"{INSTAGRAM_API_BASE}/me/accounts",
            params={"access_token": tokens["access_token"]},
        )
        
        if pages_response.status_code != 200:
            return None
        
        pages = pages_response.json().get("data", [])
        if not pages:
            return None
        
        # Get Instagram account linked to the first page
        page_id = pages[0]["id"]
        ig_response = await client.get(
            f"{INSTAGRAM_API_BASE}/{page_id}",
            params={
                "fields": "instagram_business_account",
                "access_token": tokens["access_token"],
            },
        )
        
        if ig_response.status_code != 200:
            return None
        
        ig_data = ig_response.json()
        ig_account_id = ig_data.get("instagram_business_account", {}).get("id")
        
        if not ig_account_id:
            return None
        
        # Get Instagram account details
        account_response = await client.get(
            f"{INSTAGRAM_API_BASE}/{ig_account_id}",
            params={
                "fields": "id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url",
                "access_token": tokens["access_token"],
            },
        )
        
        if account_response.status_code != 200:
            return None
        
        return account_response.json()


async def get_instagram_insights() -> Optional[dict]:
    """
    Get Instagram account insights (reach, impressions, etc).
    """
    tokens = get_tokens("instagram")
    if not tokens:
        return None
    
    account = await get_instagram_account()
    if not account:
        return None
    
    ig_id = account.get("id")
    
    async with httpx.AsyncClient() as client:
        insights_response = await client.get(
            f"{INSTAGRAM_API_BASE}/{ig_id}/insights",
            params={
                "metric": "impressions,reach,profile_views",
                "period": "day",
                "access_token": tokens["access_token"],
            },
        )
        
        insights = {}
        if insights_response.status_code == 200:
            for item in insights_response.json().get("data", []):
                insights[item["name"]] = item["values"][0]["value"] if item.get("values") else 0
    
    return {
        "platform": "instagram",
        "connected": True,
        "account": {
            "id": account.get("id"),
            "username": account.get("username"),
            "name": account.get("name"),
            "bio": account.get("biography"),
            "profile_picture": account.get("profile_picture_url"),
        },
        "metrics": {
            "followers": account.get("followers_count", 0),
            "following": account.get("follows_count", 0),
            "posts": account.get("media_count", 0),
            "impressions": insights.get("impressions", 0),
            "reach": insights.get("reach", 0),
            "profile_views": insights.get("profile_views", 0),
        },
        "fetched_at": datetime.utcnow().isoformat(),
    }


async def get_recent_media(limit: int = 10) -> Optional[list]:
    """
    Get recent Instagram posts/reels.
    """
    tokens = get_tokens("instagram")
    if not tokens:
        return None
    
    account = await get_instagram_account()
    if not account:
        return None
    
    ig_id = account.get("id")
    
    async with httpx.AsyncClient() as client:
        media_response = await client.get(
            f"{INSTAGRAM_API_BASE}/{ig_id}/media",
            params={
                "fields": "id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count",
                "limit": limit,
                "access_token": tokens["access_token"],
            },
        )
        
        if media_response.status_code != 200:
            return None
        
        media = []
        for item in media_response.json().get("data", []):
            media.append({
                "id": item.get("id"),
                "caption": (item.get("caption") or "")[:100],
                "type": item.get("media_type"),
                "url": item.get("media_url") or item.get("thumbnail_url"),
                "timestamp": item.get("timestamp"),
                "likes": item.get("like_count", 0),
                "comments": item.get("comments_count", 0),
            })
        
        return media
