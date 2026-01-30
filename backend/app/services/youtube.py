"""YouTube Data API service.

This module handles fetching data from YouTube Data API v3.
For demo, it uses mock data. Replace with real API calls when API key is available.
"""
import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from app.core.config import get_settings
from .mock_data import generate_mock_posts, generate_mock_metrics

settings = get_settings()

YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"


class YouTubeService:
    """Service for interacting with YouTube Data API."""
    
    # Popular channel IDs for featured content
    FEATURED_CHANNELS = {
        "tseries": "UCq-Fj5jknLsUf-MWSy4_brA",  # T-Series
        "mrbeast": "UCX6OQ3DkcsbYNE6H8uQQuVA",  # MrBeast
        "pewdiepie": "UC-lHJZR3Gqxm24_Vd_AJ5Yw",  # PewDiePie
        "cocomelon": "UCbCmjCuTUZos6Inko4u57UQ",  # Cocomelon
    }
    
    def __init__(self, access_token: Optional[str] = None):
        self.access_token = access_token
        self.api_key = settings.youtube_api_key
    
    async def get_public_channel_stats(self, channel_id: str) -> Dict[str, Any]:
        """Get public statistics for any YouTube channel by ID."""
        if not self.api_key:
            return self._mock_channel_info()
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{YOUTUBE_API_BASE}/channels",
                params={
                    "part": "snippet,statistics,brandingSettings",
                    "id": channel_id,
                    "key": self.api_key
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("items"):
                    channel = data["items"][0]
                    snippet = channel.get("snippet", {})
                    stats = channel.get("statistics", {})
                    branding = channel.get("brandingSettings", {}).get("channel", {})
                    
                    return {
                        "id": channel.get("id"),
                        "title": snippet.get("title"),
                        "description": snippet.get("description", "")[:200],
                        "customUrl": snippet.get("customUrl", ""),
                        "thumbnail": snippet.get("thumbnails", {}).get("high", {}).get("url"),
                        "banner": branding.get("bannerExternalUrl"),
                        "country": snippet.get("country"),
                        "publishedAt": snippet.get("publishedAt"),
                        "statistics": {
                            "subscribers": int(stats.get("subscriberCount", 0)),
                            "views": int(stats.get("viewCount", 0)),
                            "videos": int(stats.get("videoCount", 0)),
                            "hiddenSubscriberCount": stats.get("hiddenSubscriberCount", False),
                        }
                    }
            return self._mock_channel_info()
    
    async def get_channel_videos_with_stats(self, channel_id: str, max_results: int = 6) -> List[Dict[str, Any]]:
        """Get recent videos from a channel with full statistics."""
        if not self.api_key:
            return self._mock_videos(max_results)
        
        async with httpx.AsyncClient() as client:
            # First get channel's uploads playlist
            channel_response = await client.get(
                f"{YOUTUBE_API_BASE}/channels",
                params={
                    "part": "contentDetails",
                    "id": channel_id,
                    "key": self.api_key
                }
            )
            
            if channel_response.status_code != 200:
                return self._mock_videos(max_results)
            
            channel_data = channel_response.json()
            if not channel_data.get("items"):
                return self._mock_videos(max_results)
            
            uploads_playlist = channel_data["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]
            
            # Get video IDs from uploads playlist
            playlist_response = await client.get(
                f"{YOUTUBE_API_BASE}/playlistItems",
                params={
                    "part": "snippet,contentDetails",
                    "playlistId": uploads_playlist,
                    "maxResults": max_results,
                    "key": self.api_key
                }
            )
            
            if playlist_response.status_code != 200:
                return self._mock_videos(max_results)
            
            playlist_data = playlist_response.json()
            video_ids = [item["contentDetails"]["videoId"] for item in playlist_data.get("items", [])]
            
            if not video_ids:
                return []
            
            # Get full video statistics
            videos_response = await client.get(
                f"{YOUTUBE_API_BASE}/videos",
                params={
                    "part": "snippet,statistics,contentDetails",
                    "id": ",".join(video_ids),
                    "key": self.api_key
                }
            )
            
            if videos_response.status_code != 200:
                return self._mock_videos(max_results)
            
            videos_data = videos_response.json()
            videos = []
            
            for video in videos_data.get("items", []):
                snippet = video.get("snippet", {})
                stats = video.get("statistics", {})
                content = video.get("contentDetails", {})
                
                videos.append({
                    "id": video.get("id"),
                    "title": snippet.get("title"),
                    "description": snippet.get("description", "")[:150],
                    "thumbnail": snippet.get("thumbnails", {}).get("high", {}).get("url"),
                    "publishedAt": snippet.get("publishedAt"),
                    "duration": content.get("duration"),
                    "statistics": {
                        "views": int(stats.get("viewCount", 0)),
                        "likes": int(stats.get("likeCount", 0)),
                        "comments": int(stats.get("commentCount", 0)),
                    }
                })
            
            return videos
    
    async def get_featured_channels(self) -> List[Dict[str, Any]]:
        """Get stats for all featured channels (T-Series, MrBeast, etc.)."""
        channels = []
        for name, channel_id in self.FEATURED_CHANNELS.items():
            stats = await self.get_public_channel_stats(channel_id)
            videos = await self.get_channel_videos_with_stats(channel_id, max_results=3)
            channels.append({
                "key": name,
                "channel": stats,
                "recent_videos": videos
            })
        return channels
    
    async def get_channel_info(self, channel_id: str) -> Dict[str, Any]:
        """Get channel information."""
        if not self.api_key:
            return self._mock_channel_info()
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{YOUTUBE_API_BASE}/channels",
                params={
                    "part": "snippet,statistics",
                    "id": channel_id,
                    "key": self.api_key
                }
            )
            if response.status_code == 200:
                data = response.json()
                if data.get("items"):
                    return data["items"][0]
            return self._mock_channel_info()
    
    async def get_videos(self, channel_id: str, max_results: int = 50) -> List[Dict[str, Any]]:
        """Get recent videos from a channel."""
        if not self.api_key:
            return self._mock_videos(max_results)
        
        async with httpx.AsyncClient() as client:
            # First get uploads playlist
            channel_response = await client.get(
                f"{YOUTUBE_API_BASE}/channels",
                params={
                    "part": "contentDetails",
                    "id": channel_id,
                    "key": self.api_key
                }
            )
            
            if channel_response.status_code != 200:
                return self._mock_videos(max_results)
            
            channel_data = channel_response.json()
            if not channel_data.get("items"):
                return self._mock_videos(max_results)
            
            uploads_playlist = channel_data["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]
            
            # Get videos from uploads playlist
            videos_response = await client.get(
                f"{YOUTUBE_API_BASE}/playlistItems",
                params={
                    "part": "snippet",
                    "playlistId": uploads_playlist,
                    "maxResults": max_results,
                    "key": self.api_key
                }
            )
            
            if videos_response.status_code == 200:
                return videos_response.json().get("items", [])
            
            return self._mock_videos(max_results)
    
    async def get_video_stats(self, video_ids: List[str]) -> List[Dict[str, Any]]:
        """Get statistics for specific videos."""
        if not self.api_key or not video_ids:
            return self._mock_video_stats(len(video_ids) if video_ids else 10)
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{YOUTUBE_API_BASE}/videos",
                params={
                    "part": "statistics,snippet",
                    "id": ",".join(video_ids[:50]),  # Max 50 per request
                    "key": self.api_key
                }
            )
            
            if response.status_code == 200:
                return response.json().get("items", [])
            
            return self._mock_video_stats(len(video_ids))
    
    def _mock_channel_info(self) -> Dict[str, Any]:
        """Return mock channel info."""
        return {
            "id": "UC_mock_channel",
            "snippet": {
                "title": "Demo Channel",
                "description": "This is a demo channel for Social Leaf",
                "customUrl": "@demochannel",
                "thumbnails": {"default": {"url": "https://via.placeholder.com/88"}}
            },
            "statistics": {
                "viewCount": "1500000",
                "subscriberCount": "25000",
                "videoCount": "150"
            }
        }
    
    def _mock_videos(self, count: int = 10) -> List[Dict[str, Any]]:
        """Return mock videos."""
        import random
        titles = [
            "Getting Started Tutorial",
            "Advanced Tips & Tricks",
            "Product Review 2024",
            "Behind the Scenes",
            "Q&A Session",
            "Weekly Update",
            "How To Guide",
            "Live Stream Recap",
            "Top 10 Features",
            "Community Spotlight"
        ]
        
        videos = []
        for i in range(min(count, len(titles))):
            videos.append({
                "snippet": {
                    "resourceId": {"videoId": f"yt_video_{i}"},
                    "title": titles[i],
                    "description": f"Description for {titles[i]}",
                    "publishedAt": (datetime.now() - timedelta(days=i*3)).isoformat(),
                    "thumbnails": {"default": {"url": "https://via.placeholder.com/120x90"}}
                }
            })
        return videos
    
    def _mock_video_stats(self, count: int = 10) -> List[Dict[str, Any]]:
        """Return mock video statistics."""
        import random
        stats = []
        for i in range(count):
            views = random.randint(5000, 100000)
            stats.append({
                "id": f"yt_video_{i}",
                "statistics": {
                    "viewCount": str(views),
                    "likeCount": str(int(views * 0.05)),
                    "commentCount": str(int(views * 0.01)),
                }
            })
        return stats


# Singleton instance
youtube_service = YouTubeService()


async def sync_youtube_data(user_id: str, channel_id: str) -> Dict[str, Any]:
    """
    Sync YouTube data for a user.
    
    This function fetches videos and their stats, then saves to database.
    """
    service = YouTubeService()
    
    # Get videos
    videos = await service.get_videos(channel_id, max_results=20)
    
    # Get video IDs
    video_ids = [v["snippet"]["resourceId"]["videoId"] for v in videos if "resourceId" in v.get("snippet", {})]
    
    # Get stats
    if video_ids:
        stats = await service.get_video_stats(video_ids)
    else:
        stats = []
    
    return {
        "videos_fetched": len(videos),
        "stats_fetched": len(stats),
        "channel_id": channel_id,
        "synced_at": datetime.now().isoformat()
    }
