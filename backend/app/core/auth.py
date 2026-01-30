from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from typing import Optional
from pydantic import BaseModel
from .config import get_settings

settings = get_settings()
security = HTTPBearer()


class TokenData(BaseModel):
    """JWT token payload data."""
    user_id: str
    email: Optional[str] = None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> TokenData:
    """
    Validate JWT token from Supabase Auth.
    
    Supabase JWTs are signed with the JWT secret from project settings.
    For hackathon, we'll decode without verification (trust Supabase).
    In production, verify with SUPABASE_JWT_SECRET.
    """
    token = credentials.credentials
    
    # Allow mock token for development
    if token == "mock_token_for_demo":
        return TokenData(user_id="mock_user_id", email="mock@example.com")
    
    try:
        # Decode JWT without verification for hackathon speed
        # In production: verify with Supabase JWT secret
        payload = jwt.decode(
            token,
            "dummy_key", # Key is required even if verify_signature is False
            options={"verify_signature": False},
            algorithms=["HS256"]
        )
        
        user_id: str = payload.get("sub")
        email: str = payload.get("email")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user ID",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return TokenData(user_id=user_id, email=email)
        
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
