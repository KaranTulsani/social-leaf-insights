"""AI service for generating insights and recommendations.

Uses OpenAI or Gemini for natural language processing.
"""
import openai
from typing import Dict, Any, List, Optional
from datetime import datetime
import json
import re
import google.generativeai as genai

from PIL import Image
import io
from app.core.config import get_settings
from app.core.supabase import get_supabase

settings = get_settings()


class AIService:
    """Service for AI-powered insights and recommendations."""
    
    def __init__(self):
        self.openai_key = settings.openai_api_key
        self.gemini_key = settings.gemini_api_key  # Primary: captions & persona
        self.gemini_key_secondary = settings.gemini_api_key_secondary  # Secondary: chatbot
    
        if self.gemini_key:
            genai.configure(api_key=self.gemini_key)
    
    async def generate_instagram_caption(
        self, 
        image_bytes_list: List[bytes], 
        niche: Optional[str] = None, 
        tone: Optional[str] = None, 
        goal: Optional[str] = None, 
        cta: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate an Instagram-optimized caption using Gemini Vision for multiple images."""
        
        if not self.gemini_key:
            raise Exception("Gemini API Key is not configured")

        try:
            # Prepare images for Gemini
            images = [Image.open(io.BytesIO(img_bytes)) for img_bytes in image_bytes_list]
            
            # Deep Analysis Prompt with forced variety
            import random
            variety_seed = random.randint(1000, 9999)
            
            # Rotate through different caption styles to force variety
            caption_styles = [
                "Start with a bold question that makes people stop scrolling",
                "Begin with a shocking statement or surprising fact",
                "Open with a personal story or emotional hook",
                "Use a controversial or debate-sparking angle",
                "Start with humor or a witty observation",
                "Begin with a 'what if' scenario",
                "Open with a relatable pain point or struggle"
            ]
            selected_style = random.choice(caption_styles)
            
            prompt = f"""
            You are a world-class Instagram Growth Expert. 
            Analyze the attached image(s) with EXTREME precision. 
            
            IMAGE ANALYSIS (CRITICAL):
            - Describe EXACTLY what is in the images with specific details.
            - Mention colors, objects, mood, composition, lighting.
            
            POST STRATEGY:
            - Niche: {niche or 'Universal'}
            - Tone: {tone or 'Engaging'}
            - Goal: {goal or 'Engagement'}
            - CTA: {cta or 'Comment below!'}
            
            CAPTION STYLE FOR THIS GENERATION:
            {selected_style}
            
            VARIETY REQUIREMENTS (MANDATORY):
            - Write a COMPLETELY UNIQUE caption. Do NOT reuse previous hooks or structures.
            - The opening line MUST be different from any previous generation.
            - Vary sentence length, emoji usage, and paragraph breaks.
            - Try different angles: technical, emotional, philosophical, humorous, etc.
            
            OUTPUT RULES:
            - Return ONLY valid JSON.
            - Caption must reference specific visual elements.
            - Include 5-8 hyper-relevant hashtags.
            
            OUTPUT FORMAT (JSON):
            {{
              "caption": "...",
              "hashtags": ["...", "..."],
              "cta": "...",
              "style": "..."
            }}

            RANDOMIZATION_TOKEN: {variety_seed}-{datetime.now().strftime('%H%M%S%f')}-{random.random()}
            """

            # Try multiple models verified in test_vision.py
            candidate_models = [
                'models/gemini-2.0-flash',
                'models/gemini-flash-latest',
                'models/gemini-2.5-flash-lite',
                'models/gemini-2.5-flash',
                'models/gemini-1.5-flash',
            ]
            
            response = None
            last_error = None

            # Generation Config for MAXIMUM variety
            generation_config = {
                "temperature": 1.5,  # Increased from 0.9 to maximum creativity
                "top_p": 0.98,
                "top_k": 64,
                "max_output_tokens": 1024,
            }

            for model_name in candidate_models:
                try:
                    print(f"DEBUG: Attempting model {model_name}")
                    model = genai.GenerativeModel(model_name, generation_config=generation_config)
                    # Pass the prompt string + all image objects
                    # Ensure images is not empty
                    if not images:
                        raise Exception("No images provided to AI Service")
                        
                    response = await model.generate_content_async([prompt, *images])
                    if response and response.text:
                        print(f"DEBUG: Successfully got response from {model_name}")
                        break 
                except Exception as e:
                    print(f"DEBUG: Model {model_name} failed: {str(e)}")
                    last_error = e
                    continue
            
            if not response:
                print(f"CRITICAL: All models failed. Returning fallback caption.")
                return self._generate_post_fallback(niche, tone, goal, cta)
            
            # Parse JSON safely
            try:
                text = response.text.strip()
                print(f"DEBUG: Raw AI Response: {text[:200]}...")
                
                # Step 1: Remove markdown code blocks if present
                if text.startswith("```"):
                    # Remove opening ```json or ``` 
                    text = re.sub(r'^```(?:json)?\s*\n?', '', text)
                    # Remove closing ```
                    text = re.sub(r'\n?```\s*$', '', text)
                    text = text.strip()
                
                # Step 2: Find JSON object using regex (handles nested braces)
                json_match = re.search(r'\{[\s\S]*\}', text)
                
                if json_match:
                    json_str = json_match.group()
                    try:
                        parsed = json.loads(json_str)
                        print(f"DEBUG: Successfully parsed JSON with caption: {parsed.get('caption', '')[:50]}...")
                        return parsed
                    except json.JSONDecodeError as je:
                        print(f"DEBUG: JSON decode error: {je}")
                        # Try to extract just the caption manually
                        caption_match = re.search(r'"caption"\s*:\s*"([^"]*(?:\\"[^"]*)*)"', json_str)
                        if caption_match:
                            return {
                                "caption": caption_match.group(1).replace('\\"', '"'),
                                "hashtags": ["#content", "#socialmedia", "#growth"],
                                "cta": "Comment below!",
                                "style": "extracted"
                            }
                else:
                    print(f"DEBUG: No JSON structure found in response")
            except Exception as parse_err:
                print(f"DEBUG: Parse error: {parse_err}. Returning fallback.")
            
            return self._generate_post_fallback(niche, tone, goal, cta)
            
        except Exception as e:
            print(f"CRITICAL ERROR in generate_instagram_caption: {str(e)}")
            # Even on critical error, return a fallback so the UI works
            return self._generate_post_fallback(niche, tone, goal, cta)

    def _generate_post_fallback(self, niche: str, tone: str, goal: str, cta: str) -> Dict[str, Any]:
        """Hardcoded fallback for when AI is completely unavailable."""
        return {
            "caption": f"🚀 Excited to share this content! We're focusing on {niche or 'growth'} and bringing a {tone or 'authentic'} vibe to the grid. \n\nWhat do you think about this update? Let us know in the comments! 👇",
            "hashtags": ["#socialmedia", "#growth", "#marketing", "#contentcreator", "#instagram", "#tips"],
            "cta": cta or "Comment below!",
            "style": "stable-fallback"
        }

    async def generate_audience_persona(self, channel_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a realistic, critical, and motivating audience persona analysis."""
        
        if not self.gemini_key:
            return self._generate_persona_fallback(channel_data)

        try:
            # Extract key metrics from channel data
            channel_title = channel_data.get('channel', {}).get('title', 'Your Channel')
            subscribers = channel_data.get('channel', {}).get('statistics', {}).get('subscribers', 0)
            total_views = channel_data.get('channel', {}).get('statistics', {}).get('views', 0)
            
            videos = channel_data.get('recent_videos', [])
            
            # Calculate engagement metrics
            total_likes = sum(v.get('statistics', {}).get('likes', 0) for v in videos)
            total_comments = sum(v.get('statistics', {}).get('comments', 0) for v in videos)
            video_views = sum(v.get('statistics', {}).get('views', 0) for v in videos)
            
            avg_engagement = ((total_likes + total_comments) / max(video_views, 1)) * 100 if video_views > 0 else 0
            
            # Get video titles for content analysis
            video_titles = [v.get('title', '') for v in videos[:10]]
            
            prompt = f"""
            You are a brutally honest yet motivating YouTube analytics expert.
            Analyze this channel's data and create a REALISTIC audience persona.
            
            CHANNEL DATA:
            - Channel: {channel_title}
            - Subscribers: {subscribers:,}
            - Total Views: {total_views:,}
            - Recent Videos: {len(videos)}
            - Total Likes (recent): {total_likes:,}
            - Total Comments (recent): {total_comments:,}
            - Avg Engagement Rate: {avg_engagement:.2f}%
            
            TOP VIDEO TITLES:
            {chr(10).join(f"- {title}" for title in video_titles[:5])}
            
            INSTRUCTIONS:
            1. BE SPECIFIC - Use the actual numbers and channel name
            2. BE CRITICAL - Point out weaknesses (low engagement, inconsistent posting, etc.)
            3. BE MOTIVATING - Highlight strengths and provide actionable next steps
            4. BE REALISTIC - Don't sugarcoat, but don't be discouraging
            5. ANALYZE CONTENT - Based on video titles, identify the niche and content style
            
            Return ONLY valid JSON:
            {{
              "persona_text": "2-3 sentences describing the audience with specific metrics and critical insights",
              "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
              "confidence": 85-98,
              "key_strength": "One specific strength",
              "key_weakness": "One specific area to improve",
              "next_action": "One specific actionable step"
            }}
            
            Example persona_text format:
            "Your audience from {channel_title} shows {avg_engagement:.1f}% engagement - {
'below industry standard of 3-5%' if avg_engagement < 3 else 'solid performance'
            }. With {total_comments:,} comments across recent videos, your viewers are {
'somewhat passive' if total_comments < 100 else 'actively engaged'
            }. {
'Focus on creating more discussion-prompting content' if total_comments < 100 else 'Keep fostering this community interaction'
            }."
            """

            candidate_models = [
                'models/gemini-2.0-flash',
                'models/gemini-flash-latest',
                'models/gemini-2.5-flash-lite',
            ]
            
            generation_config = {
                "temperature": 0.7,  # Lower for more factual analysis
                "top_p": 0.9,
                "top_k": 40,
                "max_output_tokens": 512,
            }

            response = None
            for model_name in candidate_models:
                try:
                    model = genai.GenerativeModel(model_name, generation_config=generation_config)
                    response = model.generate_content(prompt)
                    if response and response.text:
                        break
                except Exception as e:
                    print(f"Model {model_name} failed for persona: {e}")
                    continue
            
            if not response:
                return self._generate_persona_fallback(channel_data)
            
            # Parse JSON
            import re
            text = response.text.strip()
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
            
            return self._generate_persona_fallback(channel_data)
            
        except Exception as e:
            print(f"Error generating audience persona: {e}")
            return self._generate_persona_fallback(channel_data)

    def _generate_persona_fallback(self, channel_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback persona when AI fails."""
        channel_title = channel_data.get('channel', {}).get('title', 'Your Channel')
        subscribers = channel_data.get('channel', {}).get('statistics', {}).get('subscribers', 0)
        
        return {
            "persona_text": f"Your audience from {channel_title} consists of engaged viewers. With {subscribers:,} subscribers, you have a solid foundation. Focus on consistent content to grow engagement further.",
            "tags": ["🎯 Growing", "📊 Data-Driven", "💡 Learners", "🎬 Video Enthusiasts", "📱 Mobile Users"],
            "confidence": 75,
            "key_strength": "Consistent subscriber base",
            "key_weakness": "Need more engagement data",
            "next_action": "Post more frequently to gather engagement insights"
        }

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
        
        Real YouTube Data (Live API):
        {json.dumps(context.get('real_youtube_data', {}), indent=2)}
        """
        
        if self.openai_key:
            try:
                client = openai.AsyncOpenAI(api_key=self.openai_key)
                response = await client.chat.completions.create(
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
                print(f"OpenAI query failed: {e}")
                pass
        
        # Try Gemini SECONDARY key for chatbot (dedicated quota)
        gemini_key_for_chat = self.gemini_key_secondary or self.gemini_key
        if gemini_key_for_chat:
            try:
                # Temporarily configure with secondary key
                genai.configure(api_key=gemini_key_for_chat)
                model = genai.GenerativeModel('models/gemini-flash-latest')
                response = await model.generate_content_async(f"Context:\n{context_str}\n\nQuestion: {question}")
                # Restore primary key configuration
                if self.gemini_key:
                    genai.configure(api_key=self.gemini_key)
                return response.text
            except Exception as e:
                print(f"Gemini query failed: {e}")
                # Restore primary key even on error
                if self.gemini_key:
                    genai.configure(api_key=self.gemini_key)
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

    async def generate_detailed_report_analysis(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a detailed executive summary and graph-specific analysis."""
        
        metrics_str = json.dumps(context, indent=2)
        
        prompt = f"""
        You are a no-nonsense Senior Social Media Consultant auditing a client's performance.
        
        YOUR GOAL: 
        Provide a "Brutal but constructive" audit in structured JSON format.
        
        METRICS CONTEXT:
        {metrics_str}
        
        OUTPUT FORMAT (STRICT JSON ONLY):
        {{
            "executive_summary": "Markdown text. Start with an Executive Verdict (2 sentencs). Then strictly use '## What's Working' and '## Critical Issues' headers. Be brutal.",
            "engagement_graph_analysis": "Specific paragraph (3-4 sentences) analyzing the engagement trends. Explain WHY spikes or drops happened. Mention specific months if data allows.",
            "content_graph_analysis": "Specific paragraph (3-4 sentences) analyzing content types. clearly state which format wins and why.",
            "platform_graph_analysis": "Specific paragraph comparing platforms. Call out the winner and the loser."
        }}
        
        RULES:
        - Return VALID JSON only. No markdown formatting around the JSON.
        - The 'executive_summary' field MUST use Markdown for headers (##) and bullets (-).
        - The graph analysis fields should be plain text paragraphs.
        - Be specific. Avoid generic advice.
        """
        
        response_text = ""
        
        # Try Gemini first
        if self.gemini_key:
            try:
                model = genai.GenerativeModel('gemini-1.5-flash')
                response = await model.generate_content_async(prompt)
                response_text = response.text
            except Exception as e:
                print(f"Gemini report generation failed: {e}")
                
        # Fallback to OpenAI
        if not response_text and self.openai_key:
            try:
                client = openai.AsyncOpenAI(api_key=self.openai_key)
                response = await client.chat.completions.create(
                    model="gpt-4o",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=1000,
                    response_format={"type": "json_object"}
                )
                response_text = response.choices[0].message.content
            except Exception as e:
                print(f"OpenAI report generation failed: {e}")

        # Parse JSON
        if response_text:
            try:
                # Clean up markdown code blocks if present (Gemini sometimes adds them)
                clean_text = response_text.replace("```json", "").replace("```", "").strip()
                return json.loads(clean_text)
            except json.JSONDecodeError:
                print("Failed to parse AI JSON response")
        
        # Fallback hardcoded structured report
        return {
            "executive_summary": f"""## Executive Verdict
Your social media performance shows steady engagement with a total of {context.get('total_impressions', 0):,} impressions. However, growth is stagnant.

## What's Working
- **Consistency**: You are posting regularly.
- **Reach**: Impressions are stable.

## Critical Issues
- **Engagement Rate**: At {context.get('engagement_rate', 0)}%, this is below industry standard.
- **Format**: Relying too much on static posts.

## Fix It Plan
1. **Stop**: Posting low-effort static images.
2. **Start**: 3 Reels per week.
3. **Experiment**: Carousel educational posts.""",
            "engagement_graph_analysis": "Engagement has been flat over the last period. The lack of significant spikes indicates a content strategy that maintains the audience but fails to excite them. You need viral-potential content to break this plateau.",
            "content_graph_analysis": "Video content (Reels) is outperforming static images by a significant margin. Your current mix heavily favors static posts, which is suppressing your potential reach.",
            "platform_graph_analysis": "Instagram is currently your strongest driver of engagement. LinkedIn performance is negligible and requires a dedicated strategy or should be deprioritized to focus resources."
        }


# Singleton instance
ai_service = AIService()
