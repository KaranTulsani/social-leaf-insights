from typing import Optional, List, Dict
from pydantic import BaseModel
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Depends
from app.services.ai_service import ai_service
from app.services.image_service import optimize_image
from app.core.auth import get_current_user_with_profile
from app.core.plan_access import assert_feature_access

router = APIRouter()

class PostPreviewResponse(BaseModel):
    caption: str
    hashtags: List[str]
    cta: str
    style: str
    optimized_image_path: str
    auto_post: bool

@router.post("/generate", response_model=PostPreviewResponse)
async def generate_post(
    image: UploadFile = File(...),
    niche: Optional[str] = Form(None),
    tone: Optional[str] = Form(None),
    goal: Optional[str] = Form(None),
    cta: Optional[str] = Form(None),
    auto_post: bool = Form(False),
    profile: Dict = Depends(get_current_user_with_profile)
):
    """
    Generate an Instagram post (Caption + Optimized Image) from an uploaded image.
    """
    """
    Generate an Instagram post (Caption + Optimized Image) from an uploaded image.
    Requires Business Plan.
    """
    assert_feature_access(profile, "create_post")
    try:
        # 1. Generate Caption (AI)
        # We need to read file bytes for AI
        image_bytes = await image.read()
        
        # Reset cursor for image optimization service
        image.file.seek(0) 

        ai_result = await ai_service.generate_instagram_caption(
            image_bytes=image_bytes,
            niche=niche,
            tone=tone,
            goal=goal,
            cta=cta
        )

        # 2. Optimize Image
        # Pass the UploadFile directly (it has the cursor reset)
        optimized_path = optimize_image(image)

        # 3. Return Payload
        return PostPreviewResponse(
            caption=ai_result.get("caption", ""),
            hashtags=ai_result.get("hashtags", []),
            cta=ai_result.get("cta", ""),
            style=ai_result.get("style", "custom"),
            optimized_image_path=optimized_path,
            auto_post=auto_post
        )

    except Exception as e:
        print(f"Error in /post/generate: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
