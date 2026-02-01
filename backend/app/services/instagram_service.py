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

# ================== PUBLISHING (Direct API) ==================

import os

async def create_media_container(image_url: str, caption: str) -> str:
    """
    Step 1: Create a media container for the image.
    Uses environment variables for authentication.
    """
    ig_user_id = os.getenv("IG_USER_ID")
    access_token = os.getenv("IG_PAGE_ACCESS_TOKEN")

    if not ig_user_id or not access_token:
        raise RuntimeError("IG_USER_ID or IG_PAGE_ACCESS_TOKEN not configured in environment")

    url = f"{INSTAGRAM_API_BASE}/{ig_user_id}/media"
    
    payload = {
        "image_url": image_url,
        "caption": caption,
        "access_token": access_token
    }

    async with httpx.AsyncClient() as client:
        # DEV MODE BYPASS: Instagram cannot fetch localhost URLs. 
        # If we are on localhost, mock the response so the UI flow can be tested.
        if "localhost" in image_url or "127.0.0.1" in image_url:
            print(f"⚠️  DEV MODE: Skipping Instagram API call for localhost URL: {image_url}")
            return "mock_creation_id_12345"

        # Real API Call
        response = await client.post(url, params=payload)
        
        if response.status_code != 200:
            error_data = response.json()
            print(f"Instagram API Error Body: {error_data}")
            error_msg = error_data.get("error", {}).get("message", "Unknown error")
            raise RuntimeError(f"Instagram API Error (Create Container): {error_msg}")
            
        data = response.json()
        return data["id"]


async def publish_media(creation_id: str) -> dict:
    """
    Step 2: Publish the media container.
    """
    ig_user_id = os.getenv("IG_USER_ID")
    access_token = os.getenv("IG_PAGE_ACCESS_TOKEN")

    if not ig_user_id or not access_token:
        raise RuntimeError("IG_USER_ID or IG_PAGE_ACCESS_TOKEN not configured in environment")

    url = f"{INSTAGRAM_API_BASE}/{ig_user_id}/media_publish"
    
    payload = {
        "creation_id": creation_id,
        "access_token": access_token
    }

    async with httpx.AsyncClient() as client:
        # DEV MODE BYPASS
        if creation_id == "mock_creation_id_12345":
            print(f"⚠️  DEV MODE: Mocking successful publish for creation_id: {creation_id}")
            return {"id": "mock_ig_media_id_98765"}

        response = await client.post(url, params=payload)
        
        if response.status_code != 200:
            error_data = response.json()
            error_msg = error_data.get("error", {}).get("message", "Unknown error")
            raise RuntimeError(f"Instagram API Error (Publish): {error_msg}")
            
        return response.json()
