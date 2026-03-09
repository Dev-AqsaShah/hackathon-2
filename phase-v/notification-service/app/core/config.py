"""Notification Service configuration."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Prefers SYNC_DATABASE_URL (psycopg2). Falls back to DATABASE_URL,
    # stripping +asyncpg if present so SQLModel sync engine works.
    DATABASE_URL: str = ""
    SYNC_DATABASE_URL: str = ""
    DAPR_HTTP_PORT: int = 3501
    APP_NAME: str = "todo-notification-service"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def effective_db_url(self) -> str:
        if self.SYNC_DATABASE_URL:
            return self.SYNC_DATABASE_URL
        return self.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")


settings = Settings()
