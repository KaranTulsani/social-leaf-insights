"""
Hook Detector Service - STABLE VERSION
Analyzes video frames using OpenRouter (Qwen-VL) to find the most engaging "hook" moment.
Falls back to Gemini 1.5 Flash, then text-only generation.
"""

import os
import json
import re
import httpx
from typing import List, Tuple, Optional

# Use Settings class to properly load environment variables
from app.core.config import get_settings

settings = get_settings()

# Get API keys from settings (works with Render env vars)
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
GEMINI_API_KEY = settings.gemini_api_key_secondary or settings.gemini_api_key
HUGGINGFACE_API_KEY = settings.huggingface_api_key

# Log which keys are available (helps debug on Render)
print(f"🎬 Hook Detector initialized - Gemini: {'✅' if GEMINI_API_KEY else '❌'}, HF: {'✅' if HUGGINGFACE_API_KEY else '❌'}, OpenRouter: {'✅' if OPENROUTER_API_KEY else '❌'}")

# CONFIRMED WORKING free VLM models on OpenRouter (NO :free suffix!)
OPENROUTER_VLM_MODELS = [
    "qwen/qwen-2-vl-7b-instruct",
    "llava/llava-1.5-7b-hf"
]

# Optimal frame extraction for hackathon (3 frames only!)
MAX_FRAMES = 3

HOOK_ANALYSIS_PROMPT = """You are an expert social media content analyst.

I'm showing you 3 frames from a short video:
- Frame 0 (0s): Opening shot
- Frame 1 (1s): Early hook moment
- Frame 2 (2s): Attention window

Which frame stops scrolling MOST and why?

Respond ONLY with JSON:
{
    "frame_index": <0, 1, or 2>,
    "timestamp_sec": <0, 1, or 2>,
    "hook_score": <1-100>,
    "reason": "<why this frame hooks viewers>",
    "visual_elements": ["<element1>", "<element2>"],
    "improvement_tip": "<how to make hook stronger>"
}
"""


async def analyze_hook_with_openrouter(frames: List[Tuple[float, str]]) -> Optional[dict]:
    """Analyze frames using OpenRouter API with confirmed working models."""
    if not OPENROUTER_API_KEY:
        print("DEBUG: OPENROUTER_API_KEY not configured")
        return None
    
    # DEBUG: Check if we are getting the right key
    key_prefix = OPENROUTER_API_KEY[:5] + "..." if OPENROUTER_API_KEY else "None"
    print(f"DEBUG: OPENROUTER_API_KEY loaded: {key_prefix}")
    print(f"DEBUG: Analyzing {len(frames)} frames with OpenRouter...")
    
    api_url = "https://openrouter.ai/api/v1/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8080",
        "X-Title": "Social Leaf"
    }
    
    # Build SINGLE content with ALL frames (single-pass VLM call)
    content = [{"type": "text", "text": HOOK_ANALYSIS_PROMPT}]
    
    for i, (timestamp, b64_image) in enumerate(frames):
        content.append({
            "type": "image_url",
            "image_url": {"url": f"data:image/jpeg;base64,{b64_image}"}
        })
    
    # Try confirmed working models only
    for model in OPENROUTER_VLM_MODELS:
        print(f"DEBUG: Trying OpenRouter model: {model}")
        
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": content}],
            "max_tokens": 400,
            "temperature": 0.2
        }
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(api_url, headers=headers, json=payload)
                
                print(f"DEBUG: OpenRouter {model} status: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    result_text = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                    
                    print(f"DEBUG: OpenRouter response: {result_text[:100]}...")
                    
                    json_match = re.search(r'\{[\s\S]*\}', result_text)
                    if json_match:
                        result = json.loads(json_match.group())
                        result.setdefault("frame_index", 0)
                        result.setdefault("timestamp_sec", 0)
                        result.setdefault("hook_score", 50)
                        result.setdefault("reason", "Analysis completed")
                        result.setdefault("visual_elements", [])
                        
                        frame_idx = min(result.get("frame_index", 0) or 0, len(frames) - 1)
                        result["frame_image"] = frames[frame_idx][1]
                        return result
                else:
                    print(f"DEBUG: OpenRouter error: {response.text[:150]}")
                    continue
                    
        except Exception as e:
            print(f"DEBUG: OpenRouter exception: {str(e)[:100]}")
            continue
    
    return None


async def analyze_hook_with_gemini(frames: List[Tuple[float, str]]) -> Optional[dict]:
    """Fallback to Gemini 1.5 Flash (stable, not 2.0)."""
    if not GEMINI_API_KEY:
        print("DEBUG: GEMINI_API_KEY not configured")
        return None
        
    print("DEBUG: Falling back to Gemini 1.5 Flash...")
    
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        
        # Use only 2 frames max for Gemini fallback (quota sensitive)
        limited_frames = frames[:2]
        
        # Build single-pass content
        content_parts = [HOOK_ANALYSIS_PROMPT]
        for i, (timestamp, b64_image) in enumerate(limited_frames):
            content_parts.append({"mime_type": "image/jpeg", "data": b64_image})
        
        # Use models/gemini-flash-latest (confirmed working)
        print("DEBUG: Calling models/gemini-flash-latest...")
        model = genai.GenerativeModel("models/gemini-flash-latest")
        
        response = await model.generate_content_async(
            content_parts,
            generation_config=genai.types.GenerationConfig(
                temperature=0.2,
                max_output_tokens=400
            )
        )
        
        response_text = ""
        
        # Check if response has valid parts before accessing .text
        if response.candidates and len(response.candidates) > 0:
            candidate = response.candidates[0]
            if candidate.content and candidate.content.parts:
                response_text = response.text.strip()
        
        if not response_text:
            print("DEBUG: Gemini returned empty/blocked response")
            return None
        
        print(f"DEBUG: Gemini response: {response_text[:100]}...")
        
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            result = json.loads(json_match.group())
            result.setdefault("frame_index", 0)
            result.setdefault("timestamp_sec", 0)
            result.setdefault("hook_score", 50)
            result.setdefault("reason", "Analysis completed")
            result.setdefault("visual_elements", [])
            
            frame_idx = min(result.get("frame_index", 0) or 0, len(frames) - 1)
            result["frame_image"] = frames[frame_idx][1]
            return result
            
    except Exception as e:
        error_str = str(e)
        print(f"DEBUG: Gemini failed: {error_str[:100]}")
    
    return None


async def analyze_hook_with_huggingface(frames: List[Tuple[float, str]]) -> Optional[dict]:
    """Analyze frames using Hugging Face Inference API (LLaVA)."""
    if not HUGGINGFACE_API_KEY:
        print("DEBUG: HUGGINGFACE_API_KEY not configured")
        return None
    
    print("DEBUG: Analyzing frames with Hugging Face (LLaVA)...")
    
    # Use Qwen2-VL model via HF Inference Providers (OpenAI-compatible endpoint)
    # https://router.huggingface.co/v1 is the OpenAI-compatible base URL
    api_url = "https://router.huggingface.co/hf-inference/v1/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Use OpenAI-compatible vision format
    best_frame = frames[0] if frames else None
    if not best_frame:
        return None
    
    # Build OpenAI-compatible message content
    content = [
        {"type": "text", "text": "Which moment in this video frame would stop viewers from scrolling? Rate hook strength 1-100 and explain why. Respond with JSON: {\"hook_score\": NUMBER, \"reason\": \"...\", \"visual_elements\": []}."},
        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{best_frame[1]}"}}
    ]
    
    payload = {
        "model": "Qwen/Qwen2-VL-7B-Instruct",
        "messages": [{"role": "user", "content": content}],
        "max_tokens": 300
    }
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(api_url, headers=headers, json=payload)
            
            print(f"DEBUG: Hugging Face status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"DEBUG: Hugging Face response: {str(data)[:150]}...")
                
                # OpenAI chat completions format
                result_text = ""
                if "choices" in data and len(data["choices"]) > 0:
                    result_text = data["choices"][0].get("message", {}).get("content", "")
                elif isinstance(data, list) and len(data) > 0:
                    result_text = data[0].get("generated_text", "")
                elif isinstance(data, dict):
                    result_text = data.get("generated_text", str(data))
                
                # Try to extract JSON, otherwise parse text for score
                json_match = re.search(r'\{[^\}]+\}', result_text)
                if json_match:
                    try:
                        result = json.loads(json_match.group())
                    except:
                        result = {}
                else:
                    result = {}
                
                # Extract score from text if not in JSON
                score_match = re.search(r'(\d{1,3})/100|score[:\s]+(\d{1,3})', result_text, re.IGNORECASE)
                if score_match:
                    result["hook_score"] = int(score_match.group(1) or score_match.group(2))
                
                result.setdefault("frame_index", 0)
                result.setdefault("timestamp_sec", 0)
                result.setdefault("hook_score", 70)
                result.setdefault("reason", result_text[:200] if result_text else "Hook analyzed via LLaVA")
                result.setdefault("visual_elements", ["analyzed"])
                result.setdefault("improvement_tip", "Add text overlay in first 2 seconds")
                
                result["frame_image"] = frames[0][1]
                return result
            else:
                print(f"DEBUG: Hugging Face error: {response.text[:150]}")
                
    except Exception as e:
        print(f"DEBUG: Hugging Face exception: {str(e)[:100]}")
    
    return None


def generate_text_only_fallback(frames: List[Tuple[float, str]]) -> dict:
    """Last resort: Return a sensible default without vision analysis."""
    print("DEBUG: Using text-only fallback (no vision API available)")
    
    return {
        "frame_index": 0,
        "timestamp_sec": 0,
        "hook_score": 65,
        "reason": "Opening frame selected as default hook. For accurate analysis, please ensure GEMINI_API_KEY is configured.",
        "visual_elements": ["opening shot"],
        "improvement_tip": "Add text overlay or strong emotion in first 2 seconds",
        "frame_image": frames[0][1] if frames else ""
    }


async def analyze_hook(
    frames: List[Tuple[float, str]],
    model_name: str = "qwen/qwen-2-vl-7b-instruct"
) -> Optional[dict]:
    """
    Analyze frames to find the best hook moment.
    Priority: HuggingFace (Qwen) -> Gemini Flash -> OpenRouter -> Text fallback
    """
    if not frames:
        raise ValueError("No frames provided for analysis")
    
    # Limit to MAX_FRAMES (3) for optimal performance
    limited_frames = frames[:MAX_FRAMES]
    
    # Try Hugging Face FIRST (Gemini key was leaked/blocked)
    if HUGGINGFACE_API_KEY:
        result = await analyze_hook_with_huggingface(limited_frames)
        if result:
            return result
    
    # Try Gemini as backup
    if GEMINI_API_KEY:
        result = await analyze_hook_with_gemini(limited_frames)
        if result:
            return result
    
    # Fallback to OpenRouter if available
    if OPENROUTER_API_KEY:
        result = await analyze_hook_with_openrouter(limited_frames)
        if result:
            return result
    
    # Last resort: text-only fallback
    return generate_text_only_fallback(limited_frames)


def get_hook_summary(analysis: dict) -> str:
    """Generate a human-readable summary of the hook analysis."""
    if "error" in analysis:
        return f"Analysis failed: {analysis['error']}"
    
    timestamp = analysis.get("timestamp_sec", 0)
    reason = analysis.get("reason", "Unknown")
    score = analysis.get("hook_score", "N/A")
    elements = analysis.get("visual_elements", [])
    
    summary = f"🎯 Best Hook at {timestamp:.1f}s (Score: {score}/100)\n"
    summary += f"📝 {reason}\n"
    if elements:
        summary += f"👀 Key Elements: {', '.join(elements)}"
    
    return summary
