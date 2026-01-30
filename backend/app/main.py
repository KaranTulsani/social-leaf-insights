from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import get_settings
from app.routers import analytics, platforms, ai, reports, voice_coach, hooks
from app.routers.oauth import router as oauth_router


settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    print("🚀 Social Leaf Backend starting...")
    yield
    # Shutdown
    print("👋 Social Leaf Backend shutting down...")


app = FastAPI(
    title="Social Leaf API",
    description="Unified Social Media Analytics & Content Strategy Optimizer",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware - Allow all origins in development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(platforms.router, prefix="/api/platforms", tags=["Platforms"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(voice_coach.router, prefix="/api/voice-coach", tags=["Voice Coach"])
app.include_router(hooks.router)  # Hook detector routes at /api/hooks/*
app.include_router(oauth_router)  # OAuth routes at /auth/*


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Welcome to Social Leaf API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "social-leaf-api"}


# ================== YOUTUBE PUBLIC API (API Key Only) ==================

@app.get("/api/youtube/featured")
async def get_youtube_featured():
    """Get featured YouTube channels with real data (T-Series, MrBeast, etc.)."""
    from app.services.youtube import YouTubeService
    service = YouTubeService()
    return await service.get_featured_channels()


@app.get("/api/youtube/channel/{channel_id}")
async def get_youtube_channel(channel_id: str):
    """Get stats for a specific YouTube channel by ID."""
    from app.services.youtube import YouTubeService
    service = YouTubeService()
    
    channel = await service.get_public_channel_stats(channel_id)
    videos = await service.get_channel_videos_with_stats(channel_id, max_results=6)
    
    return {
        "channel": channel,
        "recent_videos": videos
    }


# ================== REAL PLATFORM DATA (OAuth Required) ==================

@app.get("/api/real/youtube")
async def get_real_youtube():
    """Get real YouTube analytics (requires OAuth connection)."""
    from app.services.youtube_service import get_youtube_analytics
    data = await get_youtube_analytics()
    if not data:
        return {"connected": False, "message": "YouTube not connected. Visit /auth/youtube to connect."}
    return data


@app.get("/api/real/instagram")
async def get_real_instagram():
    """Get real Instagram analytics (requires OAuth connection)."""
    from app.services.instagram_service import get_instagram_insights
    data = await get_instagram_insights()
    if not data:
        return {"connected": False, "message": "Instagram not connected. Visit /auth/instagram to connect."}
    return data


@app.get("/api/real/twitter")
async def get_real_twitter():
    """Get real Twitter analytics (requires OAuth connection)."""
    from app.services.twitter_service import get_twitter_analytics
    data = await get_twitter_analytics()
    if not data:
        return {"connected": False, "message": "Twitter not connected. Visit /auth/twitter to connect."}
    return data


@app.get("/api/real/linkedin")
async def get_real_linkedin():
    """Get real LinkedIn analytics (requires OAuth connection)."""
    from app.services.linkedin_service import get_linkedin_analytics
    data = await get_linkedin_analytics()
    if not data:
        return {"connected": False, "message": "LinkedIn not connected. Visit /auth/linkedin to connect."}
    return data


@app.get("/api/real/all")
async def get_all_real_data():
    """Get all real platform data (uses OAuth tokens if available, otherwise mock)."""
    from app.services.youtube_service import get_youtube_analytics
    from app.services.instagram_service import get_instagram_insights
    from app.services.twitter_service import get_twitter_analytics
    from app.services.linkedin_service import get_linkedin_analytics
    from app.routers.oauth import get_tokens
    
    result = {}
    
    # YouTube
    if get_tokens("youtube"):
        result["youtube"] = await get_youtube_analytics()
    else:
        result["youtube"] = {"connected": False}
    
    # Instagram
    if get_tokens("instagram"):
        result["instagram"] = await get_instagram_insights()
    else:
        result["instagram"] = {"connected": False}
    
    # Twitter
    if get_tokens("twitter"):
        result["twitter"] = await get_twitter_analytics()
    else:
        result["twitter"] = {"connected": False}
    
    # LinkedIn
    if get_tokens("linkedin"):
        result["linkedin"] = await get_linkedin_analytics()
    else:
        result["linkedin"] = {"connected": False}
    
    return result


# ================== DEMO ENDPOINTS (No Auth Required) ==================

@app.get("/demo/analytics")
async def demo_analytics():
    """Demo analytics endpoint - no auth required."""
    from app.services.mock_data import get_mock_analytics_overview
    return get_mock_analytics_overview("demo-user")


@app.get("/demo/platform/{platform}")
async def demo_platform(platform: str):
    """Demo platform metrics - no auth required."""
    from app.services.mock_data import get_mock_platform_metrics
    return get_mock_platform_metrics(platform)


@app.get("/demo/insights")
async def demo_insights():
    """Demo AI insights - no auth required."""
    from app.services.mock_data import get_mock_insights
    return get_mock_insights()


@app.get("/demo/recommendations")
async def demo_recommendations():
    """Demo recommendations - no auth required."""
    from app.services.mock_data import get_mock_recommendations
    return get_mock_recommendations()


@app.get("/demo/best-times")
async def demo_best_times():
    """Demo best posting times - no auth required."""
    from app.services.mock_data import get_mock_best_times
    return get_mock_best_times()


@app.get("/demo/full-dashboard")
async def demo_full_dashboard():
    """Complete demo dashboard data - no auth required."""
    from app.services.mock_data import (
        get_mock_analytics_overview,
        get_mock_platform_metrics,
        get_mock_insights,
        get_mock_recommendations,
        get_mock_best_times
    )
    
    return {
        "overview": get_mock_analytics_overview("demo-user"),
        "platforms": [
            get_mock_platform_metrics("instagram"),
            get_mock_platform_metrics("youtube"),
            get_mock_platform_metrics("twitter"),
            get_mock_platform_metrics("linkedin"),
        ],
        "insights": get_mock_insights(),
        "recommendations": get_mock_recommendations(),
        "best_times": get_mock_best_times(),
        "generated_at": "2024-01-24T01:30:00"
    }


@app.get("/demo/content-comparison")
async def demo_content_comparison():
    """Demo content type comparison - no auth required."""
    return {
        "by_content_type": {
            "reel": {"avg_likes": 3500, "avg_comments": 120, "avg_shares": 85, "engagement_rate": 8.5},
            "carousel": {"avg_likes": 2800, "avg_comments": 95, "avg_shares": 60, "engagement_rate": 6.2},
            "image": {"avg_likes": 1500, "avg_comments": 45, "avg_shares": 25, "engagement_rate": 4.1},
            "video": {"avg_likes": 4200, "avg_comments": 180, "avg_shares": 110, "engagement_rate": 7.8},
            "short": {"avg_likes": 5000, "avg_comments": 200, "avg_shares": 150, "engagement_rate": 9.2},
        },
        "best_performing": "short",
        "worst_performing": "image",
        "recommendation": "Short-form videos (Reels/Shorts) perform 2.2x better than static images"
    }


@app.get("/demo/report")
async def demo_report():
    """Demo report summary - no auth required."""
    from app.services.reports import generate_report
    return await generate_report("demo-user", "summary", 30)


@app.get("/demo/best-time/{platform}")
async def demo_best_time_platform(platform: str, content_type: str = None):
    """Demo best posting times for a platform - no auth required."""
    from app.services.best_time import get_best_posting_times
    return await get_best_posting_times("demo-user", platform, content_type)

