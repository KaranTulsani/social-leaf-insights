from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import openai

from app.core.auth import get_current_user, TokenData
from app.core.config import get_settings
from app.core.supabase import get_supabase

router = APIRouter()
settings = get_settings()


class QueryRequest(BaseModel):
    """Natural language query request."""
    question: str


class QueryResponse(BaseModel):
    """AI query response."""
    answer: str
    data: Optional[dict] = None


class InsightResponse(BaseModel):
    """AI-generated insight."""
    id: str
    summary: str
    generated_at: datetime


class RecommendationResponse(BaseModel):
    """AI-generated recommendation."""
    id: str
    recommendation_type: str
    content: str
    generated_at: datetime


@router.post("/query", response_model=QueryResponse)
async def natural_language_query(
    request: QueryRequest,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Process a natural language query about analytics.
    
    Examples:
    - "Which post performed best last month?"
    - "Why did my reach drop this week?"
    - "Do reels outperform images?"
    """
    supabase = get_supabase()
    
    try:
        # Get user's analytics data for context
        posts_response = supabase.table("posts").select(
            "id, platform, content_type, posted_at"
        ).eq("user_id", current_user.user_id).order(
            "posted_at", desc=True
        ).limit(50).execute()
        
        metrics_response = supabase.table("metrics").select(
            "post_id, likes, comments, shares, engagement_rate, collected_at"
        ).order("collected_at", desc=True).limit(100).execute()
        
        # Build context for AI
        context = f"""
        User has {len(posts_response.data)} posts across platforms.
        Recent metrics: {metrics_response.data[:10] if metrics_response.data else 'No data yet'}
        """
        
        # Call OpenAI
        if settings.openai_api_key:
            client = openai.OpenAI(api_key=settings.openai_api_key)
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": """You are a social media analytics assistant. 
                        Answer questions about the user's social media performance based on the provided data.
                        Be concise and actionable. If data is limited, provide general best practices."""
                    },
                    {
                        "role": "user",
                        "content": f"Context: {context}\n\nQuestion: {request.question}"
                    }
                ],
                max_tokens=500
            )
            
            answer = response.choices[0].message.content
        else:
            # Fallback response for demo
            answer = f"""Based on your analytics, here's what I found:

Your engagement rate is performing well. Your best performing content appears to be Reels/short-form video.

For the question "{request.question}":
- Your top posts get 3.2x more engagement than average
- Best posting times are 7-9 PM on weekdays
- Carousel posts drive 40% more saves than single images

Tip: Focus on creating more video content and post consistently at peak hours."""
        
        return QueryResponse(answer=answer, data={"posts_analyzed": len(posts_response.data)})
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/insights", response_model=List[InsightResponse])
async def get_insights(
    current_user: TokenData = Depends(get_current_user)
):
    """
    Get AI-generated insights for the user.
    """
    supabase = get_supabase()
    
    try:
        response = supabase.table("insights").select("*").eq(
            "user_id", current_user.user_id
        ).order("generated_at", desc=True).limit(10).execute()
        
        return [
            InsightResponse(
                id=insight["id"],
                summary=insight["summary"],
                generated_at=insight["generated_at"]
            )
            for insight in response.data
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-insights")
async def generate_insights(
    current_user: TokenData = Depends(get_current_user)
):
    """
    Generate new AI insights based on recent data.
    """
    supabase = get_supabase()
    
    try:
        # Get recent metrics
        metrics = supabase.table("metrics").select("*").order(
            "collected_at", desc=True
        ).limit(100).execute()
        
        # Generate insight using AI
        if settings.openai_api_key:
            client = openai.OpenAI(api_key=settings.openai_api_key)
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "Generate a brief, actionable insight about social media performance. Be specific and data-driven."
                    },
                    {
                        "role": "user",
                        "content": f"Analyze this data and provide one key insight: {metrics.data[:20]}"
                    }
                ],
                max_tokens=200
            )
            
            summary = response.choices[0].message.content
        else:
            summary = "Your Reels receive 43% higher engagement than images, especially when posted after 8 PM. Consider creating more short-form video content."
        
        # Save insight
        result = supabase.table("insights").insert({
            "user_id": current_user.user_id,
            "summary": summary,
            "generated_at": datetime.now().isoformat()
        }).execute()
        
        return {"message": "Insight generated", "insight": summary}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recommendations", response_model=List[RecommendationResponse])
async def get_recommendations(
    current_user: TokenData = Depends(get_current_user)
):
    """
    Get AI-generated content recommendations.
    """
    supabase = get_supabase()
    
    try:
        response = supabase.table("recommendations").select("*").eq(
            "user_id", current_user.user_id
        ).order("generated_at", desc=True).limit(10).execute()
        
        return [
            RecommendationResponse(
                id=rec["id"],
                recommendation_type=rec["recommendation_type"],
                content=rec["content"],
                generated_at=rec["generated_at"]
            )
            for rec in response.data
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/best-time-to-post")
async def get_best_time_to_post(
    platform: Optional[str] = None,
    content_type: Optional[str] = None,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Get the best time to post based on historical engagement.
    """
    # For hackathon, return mock data
    # In production, this would analyze posts.posted_at vs engagement
    
    best_times = {
        "instagram": {
            "reel": ["7:00 PM", "9:00 PM", "12:00 PM"],
            "carousel": ["9:00 AM", "6:00 PM"],
            "image": ["11:00 AM", "3:00 PM"]
        },
        "youtube": {
            "video": ["5:00 PM", "8:00 PM"]
        },
        "twitter": {
            "post": ["9:00 AM", "12:00 PM", "5:00 PM"]
        },
        "linkedin": {
            "post": ["8:00 AM", "12:00 PM", "5:00 PM"]
        }
    }
    
    if platform and platform in best_times:
        result = best_times[platform]
        if content_type and content_type in result:
            return {
                "platform": platform,
                "content_type": content_type,
                "best_times": result[content_type],
                "timezone": "IST"
            }
        return {
            "platform": platform,
            "best_times": result,
            "timezone": "IST"
        }
    
    return {
        "all_platforms": best_times,
        "timezone": "IST"
    }
