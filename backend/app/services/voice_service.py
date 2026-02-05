"""
Service for AI Voice Coach features.
Handles script analysis using OpenAI and text-to-speech using ElevenLabs.
"""
import httpx
import google.generativeai as genai
import json
from typing import Dict, Any, List, Optional
from app.core.config import get_settings

settings = get_settings()

class VoiceService:
    """Service for Voice Coach features."""
    
    def __init__(self):
        self.gemini_key = settings.gemini_api_key
        self.elevenlabs_key = settings.elevenlabs_api_key
        self.elevenlabs_url = "https://api.elevenlabs.io/v1"
        
        if self.gemini_key:
            genai.configure(api_key=self.gemini_key)
        
    async def analyze_script(self, script: str) -> Dict[str, str]:
        """
        Analyze a script and generate improved hooks using Gemini.
        Returns original hook (first sentence) and improved hooks.
        """
        print(f"DEBUG: Analyzing script with Gemini. Key present: {bool(self.gemini_key)}")
        
        if not self.gemini_key:
            print("DEBUG: No Gemini key found.")
            return {
                "original": script[:50] + "...",
                "average_hook": "Today I want to talk about productivity tips.",
                "high_retention_hook": "Stop wasting 3 hours every single day without realizing it.",
                "why_high_retention_works": "It creates immediate urgency and addresses a specific pain point.",
                "retention_score": 8.5,
                "retention_score_reason": "Strong negative emotion trigger and curiosity gap."
            }
            
        # Models to try in order of preference (cheaper/faster first)
        # Models to try in order of preference (cheaper/faster first)
        models_to_try = [
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-pro'
        ]
        
        import asyncio
        from functools import partial
        import re
        import time
        from google.api_core import exceptions
        
        last_error = None
        
        for model_name in models_to_try:
            print(f"DEBUG: Trying model {model_name}...")
            try:
                model = genai.GenerativeModel(model_name)
                
                prompt = f"""
                You are a senior social media growth strategist.

                Your task:
                Given a video script, generate TWO opening hooks:

                1. An AVERAGE hook (low curiosity, informational, generic)
                2. A HIGH-RETENTION hook that:
                   - Is directly related to the script content
                   - Creates curiosity WITHOUT clickbait
                   - Clearly hints at the topic
                   - Is suitable for Instagram Reels / YouTube Shorts
                   - Is under 12 words

                Rules for HIGH-RETENTION hook:
                - Must mention or imply the topic
                - No generic phrases like: "You won't believe", "This will shock you", "Wait till the end"
                - Make it sound natural, not marketing-y

                Script:
                "{script}"

                After generating hooks, also rate the high_retention_hook from 1-10 for audience retention and give one reason.

                Return response in this JSON format ONLY:
                {{
                  "average_hook": "...",
                  "high_retention_hook": "...",
                  "why_high_retention_works": "one short sentence explanation of why this hook works",
                  "retention_score": 8.7,
                  "retention_score_reason": "one short sentence reason for the score"
                }}
                
                Do not include Markdown formatting like ```json ... ```. Just the raw JSON string.
                """
                
                # Retry loop for this model
                for attempt in range(3):
                    try:
                        print(f"DEBUG: Calling Gemini API (Attempt {attempt+1})...")
                        loop = asyncio.get_event_loop()
                        response = await loop.run_in_executor(None, partial(model.generate_content, prompt))
                        print(f"DEBUG: Gemini response: {response.text[:100]}...")
                        
                        text = response.text.strip()
                        
                        # Extract JSON using regex
                        json_match = re.search(r'\{.*\}', text, re.DOTALL)
                        if json_match:
                            text = json_match.group(0)
                        
                        return json.loads(text)
                        
                    except exceptions.ResourceExhausted:
                        print(f"WARNING: Rate limit hit for {model_name}. Waiting...")
                        await asyncio.sleep(2 * (attempt + 1)) # Exponential backoff
                        continue
                    except Exception as e:
                        print(f"WARNING: Error with {model_name}: {e}")
                        raise e # Re-raise to break inner loop and try next model
                
            except Exception as e:
                print(f"DEBUG: Failed with {model_name}: {e}")
                last_error = e
                continue # Try next model
                
        print(f"ERROR: All models failed. Last error: {last_error}")
        return {
            "average_hook": "Error: AI Service Unavailable",
            "high_retention_hook": f"We are experiencing high traffic with our AI provider. Please try again in a few minutes. (Error: {str(last_error)[:50]}...)",
            "why_high_retention_works": "N/A",
            "retention_score": 0.0,
            "retention_score_reason": "Error"
        }

    async def generate_audio(self, text: str, voice_id: str = "21m00Tcm4TlvDq8ikWAM") -> bytes:
        """
        Generate audio from text using ElevenLabs API.
        Default voice: Rachel (21m00Tcm4TlvDq8ikWAM)
        """
        print(f"DEBUG: Generating audio. Key present: {bool(self.elevenlabs_key)}")
        
        if not self.elevenlabs_key:
            print("ERROR: ElevenLabs API Key not configured")
            raise Exception("ElevenLabs API Key not configured")
            
        url = f"{self.elevenlabs_url}/text-to-speech/{voice_id}"
        
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": self.elevenlabs_key
        }
        
        data = {
            "text": text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75
            }
        }
        
        async with httpx.AsyncClient() as client:
            print(f"DEBUG: Sending request to ElevenLabs: {url}")
            response = await client.post(url, json=data, headers=headers, timeout=30.0)
            
            if response.status_code != 200:
                print(f"ERROR: ElevenLabs API Error ({response.status_code}): {response.text}")
                raise Exception(f"ElevenLabs API Error: {response.text}")
                
            print("DEBUG: Audio generated successfully")
            return response.content

# Singleton instance
voice_service = VoiceService()
