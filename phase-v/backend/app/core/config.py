"""Configuration settings using Pydantic Settings."""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    # Database
    DATABASE_URL: str
    SYNC_DATABASE_URL: str = ""  # Sync URL for MCP server

    # Authentication
    BETTER_AUTH_SECRET: str

    # OpenAI (Phase 3)
    OPENAI_API_KEY: str = ""

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"

    # Frontend
    FRONTEND_URL: str = "http://localhost:3000"

    # Application
    APP_NAME: str = "Todo Full-Stack API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS_ORIGINS string into list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


# Create a single instance of settings
settings = Settings()
