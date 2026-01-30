from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel
from typing import Dict, Optional

from app.core.auth import get_current_user, TokenData
from app.services.voice_service import voice_service

router = APIRouter()

class AnalyzeRequest(BaseModel):
    script: str

class AnalyzeResponse(BaseModel):
    average_hook: str
    high_retention_hook: str
    why_high_retention_works: str
    retention_score: float
    retention_score_reason: str

class SpeechRequest(BaseModel):
    text: str
    voice_id: Optional[str] = "21m00Tcm4TlvDq8ikWAM" # Default to Rachel
    style: Optional[str] = "neutral" # neutral, energetic

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_script(
    request: AnalyzeRequest,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Analyze a script and generate hooks.
    """
    try:
        result = await voice_service.analyze_script(request.script)
        return AnalyzeResponse(
            average_hook=result.get("average_hook", ""),
            high_retention_hook=result.get("high_retention_hook", ""),
            why_high_retention_works=result.get("why_high_retention_works", ""),
            retention_score=float(result.get("retention_score", 0.0)),
            retention_score_reason=result.get("retention_score_reason", "")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/speech")
async def generate_speech(
    request: SpeechRequest,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Generate speech from text. Returns audio/mpeg.
    """
    try:
        # Select voice based on style if needed, or use provided voice_id
        # For this demo, we might want to switch voices for "Average" vs "High Retention"
        # but the prompt implies same voice, different text. 
        # However, user request said "Voice 1" and "Voice 2".
        
        target_voice_id = request.voice_id
        
        if request.style == "energetic":
            # Use a more energetic voice or settings
            # Example: Adam (premade)
            target_voice_id = "pNInz6obpgDQGcFmaJgB" 
        elif request.style == "boring":
            # Example: Antoni
            target_voice_id = "ErXwobaYiN019PkySvjV"
            
        audio_content = await voice_service.generate_audio(request.text, target_voice_id)
        
        return Response(content=audio_content, media_type="audio/mpeg")
        
    except Exception as e:
        print(f"Speech generation error: {str(e)}")
        # Return a mock error or handle gracefully
        raise HTTPException(status_code=500, detail=str(e))
