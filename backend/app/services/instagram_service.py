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
    
    
async def get_simulated_stats(username: str) -> dict:
    """
    Get stats for a public profile using lightweight scraping first, 
    falling back to simulation if blocked.
    """
    username_clean = username.lower().replace("@", "")
    
    # Preset known influencers for demo overrides (optional, can be removed if we want pure scrape)
    # Keeping them as "Fast Path" for demo reliability if scraping fails
    known_profiles = {
        "mrbeast": {
            "followers": 62500000,
            "following": 450,
            "posts": 850,
            "impressions": 12500000,
            "reach": 8500000,
            "profile_views": 450000
        },
        "pewdiepie": {
            "followers": 21000000,
            "following": 120,
            "posts": 450,
            "impressions": 5000000,
            "reach": 3200000,
            "profile_views": 120000
        }
    }

    # 1. Attempt Real Web Scrape
    real_data = None
    try:
        import re
        async with httpx.AsyncClient(follow_redirects=True, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
        }) as client:
            response = await client.get(f"https://www.instagram.com/{username_clean}/")
            if response.status_code == 200:
                html = response.text
                
                # Parse og:description meta tag
                # Format usually: "100K Followers, 50 Following, 100 Posts - See Instagram photos..."
                match = re.search(r'<meta property="og:description" content="([^"]+)"', html)
                if match:
                    content = match.group(1)
                    parts = content.split(" - ")[0].split(", ")
                    if len(parts) >= 3:
                        followers_str = parts[0].replace("Followers", "").strip()
                        following_str = parts[1].replace("Following", "").strip()
                        posts_str = parts[2].replace("Posts", "").strip()
                        
                        # Helper to parse K/M string to int
                        def parse_count(s):
                            s = s.lower().replace(",", "")
                            if "k" in s: return int(float(s.replace("k", "")) * 1000)
                            if "m" in s: return int(float(s.replace("m", "")) * 1000000)
                            return int(s) if s.isdigit() else 0

                        real_metrics = {
                            "followers": parse_count(followers_str),
                            "following": parse_count(following_str),
                            "posts": parse_count(posts_str),
                            # Estimate other metrics based on followers
                            "impressions": int(parse_count(followers_str) * 0.2), # Est 20% reach
                            "reach": int(parse_count(followers_str) * 0.15),
                            "profile_views": int(parse_count(followers_str) * 0.01)
                        }
                        
                        real_data = {
                            "platform": "instagram",
                            "connected": True,
                            "is_simulated": False,  # REAL DATA!
                            "account": {
                                "id": f"real_{username_clean}",
                                "username": username_clean,
                                "name": username, 
                                "bio": "Public Web Profile",
                                "profile_picture": "https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png", # Hard to extract dynamic expiration URLs
                            },
                            "metrics": real_metrics,
                            "fetched_at": datetime.utcnow().isoformat(),
                        }
    except Exception as e:
        print(f"Scraping failed for {username_clean}: {e}")

    if real_data:
        return real_data

    # 2. Fallback to Simulation if Scraping blocked/failed
    base = known_profiles.get(username_clean, {
        "followers": 15000, 
        "following": 500, 
        "posts": 120,
        "impressions": 2500,
        "reach": 1800,
        "profile_views": 450
    })
    
    return {
        "platform": "instagram",
        "connected": True,
        "is_simulated": True,
        "account": {
            "id": f"sim_{username_clean}",
            "username": username_clean,
            "name": username,
            "bio": "Simulated Public Profile",
            "profile_picture": "https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png",
        },
        "metrics": base,
        "fetched_at": datetime.utcnow().isoformat(),
    }


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
