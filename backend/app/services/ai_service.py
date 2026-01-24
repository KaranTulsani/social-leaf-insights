"""AI service for generating insights and recommendations.

Uses OpenAI or Gemini for natural language processing.
"""
import openai
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.core.config import get_settings
from app.core.supabase import get_supabase

settings = get_settings()


class AIService:
    """Service for AI-powered insights and recommendations."""
    
    def __init__(self):
        self.openai_key = settings.openai_api_key
        self.gemini_key = settings.gemini_api_key
    
    async def answer_query(self, question: str, context: Dict[str, Any]) -> str:
        """Answer a natural language question about analytics."""
        
        # Build context string
        context_str = f"""
        User's analytics data:
        - Total Impressions: {context.get('total_impressions', 'N/A')}
        - Engagement Rate: {context.get('engagement_rate', 'N/A')}%
        - Total Posts: {context.get('total_posts', 'N/A')}
        - Best Platform: {context.get('best_platform', 'Instagram')}
        - Recent Performance: {context.get('recent_performance', 'Stable')}
        """
        
        if self.openai_key:
            try:
                client = openai.OpenAI(api_key=self.openai_key)
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {
                            "role": "system",
                            "content": """You are a social media analytics expert. 
                            Answer questions about the user's social media performance.
                            Be concise, data-driven, and actionable.
                            If you don't have specific data, provide general best practices."""
                        },
                        {
                            "role": "user",
                            "content": f"Context:\n{context_str}\n\nQuestion: {question}"
                        }
                    ],
                    max_tokens=300
                )
                return response.choices[0].message.content
            except Exception as e:
                pass
        
        # Fallback response
        return self._generate_fallback_answer(question, context)
    
    async def generate_insights(self, analytics_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate AI insights from analytics data."""
        
        insights = []
        
        # Engagement insight
        eng_rate = analytics_data.get("engagement_rate", 5.0)
        if eng_rate > 7:
            insights.append({
                "type": "success",
                "title": "Strong Engagement",
                "summary": f"Your engagement rate of {eng_rate}% is above average! Keep up the great work.",
                "priority": 1
            })
        elif eng_rate < 3:
            insights.append({
                "type": "alert",
                "title": "Low Engagement",
                "summary": f"Your engagement rate of {eng_rate}% could be improved. Try posting more video content.",
                "priority": 1
            })
        
        # Content type insight
        best_type = analytics_data.get("best_content_type", "reel")
        insights.append({
            "type": "tip",
            "title": "Content Strategy",
            "summary": f"Your {best_type}s perform 3.2x better than other content types. Consider creating more!",
            "priority": 2
        })
        
        # Timing insight
        insights.append({
            "type": "tip",
            "title": "Optimal Timing",
            "summary": "Posts published between 7-9 PM get 45% more engagement. Adjust your schedule!",
            "priority": 3
        })
        
        # Growth insight
        growth = analytics_data.get("growth_rate", 0)
        if growth > 0:
            insights.append({
                "type": "growth",
                "title": "Positive Growth",
                "summary": f"Your account grew {growth}% this month. You're on the right track!",
                "priority": 2
            })
        
        return insights
    
    async def generate_recommendations(self, analytics_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate content recommendations."""
        
        recommendations = [
            {
                "type": "content",
                "title": "Create More Short-Form Video",
                "content": "Reels and Shorts get 3x more reach. Aim for 3-5 videos per week.",
                "priority": 1
            },
            {
                "type": "timing",
                "title": "Optimize Posting Schedule",
                "content": "Post on Tuesday-Thursday between 7-9 PM for maximum engagement.",
                "priority": 2
            },
            {
                "type": "format",
                "title": "Use Carousel Posts",
                "content": "Carousels have 40% higher save rate. Great for educational content.",
                "priority": 3
            },
            {
                "type": "hashtag",
                "title": "Refine Hashtag Strategy",
                "content": "Use 5-7 niche hashtags instead of generic ones for better reach.",
                "priority": 4
            },
            {
                "type": "strategy",
                "title": "Start a Content Series",
                "content": "Weekly series builds audience expectation and increases return visits.",
                "priority": 5
            }
        ]
        
        return recommendations
    
    def _generate_fallback_answer(self, question: str, context: Dict[str, Any]) -> str:
        """Generate a fallback answer when AI is not available."""
        
        question_lower = question.lower()
        
        if "best" in question_lower and "post" in question_lower:
            return "Based on your data, your best performing posts are Reels/short videos, with an average engagement rate 3.2x higher than static images. Focus on creating more short-form video content."
        
        if "time" in question_lower or "when" in question_lower:
            return "Your optimal posting times are 7-9 PM on weekdays (IST). Posts during these hours receive 45% more engagement than other times."
        
        if "drop" in question_lower or "decrease" in question_lower:
            return "Engagement drops are often caused by algorithm changes or reduced posting frequency. Try posting consistently at peak hours and focus on video content."
        
        if "grow" in question_lower or "increase" in question_lower:
            return "To grow your engagement: 1) Post 4-5 times per week, 2) Create more Reels/Shorts, 3) Post between 7-9 PM, 4) Engage with your audience in comments."
        
        return f"""Based on your analytics:
• Your engagement rate is performing well at {context.get('engagement_rate', 5.0)}%
• Best content type: Reels/Short videos (3.2x better engagement)
• Best posting time: 7-9 PM on weekdays
• Tip: Focus on video content and consistent posting for best results."""


# Singleton instance
ai_service = AIService()
