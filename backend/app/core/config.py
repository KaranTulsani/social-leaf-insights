from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import List, Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Supabase
    supabase_url: str
    supabase_key: str
    supabase_service_key: Optional[str] = None  # Made optional
    
    # AI - support both OpenAI and Gemini
    openai_api_key: Optional[str] = ""
    gemini_api_key: Optional[str] = ""  # Added Gemini support
    
    # App
    app_env: str = "development"
    debug: bool = True
    cors_origins: str = "http://localhost:5173,http://localhost:3000,http://localhost:8080"
    
    # Social APIs
    youtube_api_key: Optional[str] = ""
    instagram_client_id: Optional[str] = ""
    instagram_client_secret: Optional[str] = ""
    
    # Voice AI
    elevenlabs_api_key: Optional[str] = ""
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"  # Ignore extra environment variables
    )


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
