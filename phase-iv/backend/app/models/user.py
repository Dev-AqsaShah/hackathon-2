"""User model for authentication and ownership."""

from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    """
    User model representing an authenticated application user.

    Attributes:
        id: Unique user identifier (auto-generated)
        email: User's email address (unique, used for login)
        hashed_password: Bcrypt-hashed password (handled by Better Auth)
        created_at: Account creation timestamp
    """

    __tablename__ = "users"

    id: str = Field(primary_key=True, max_length=255)  # Better Auth string UUID
    email: str = Field(unique=True, index=True, max_length=255)
    hashed_password: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        """SQLModel configuration."""
        json_schema_extra = {
            "example": {
                "id": "sF6UiVxAjX0nB6YRoA90A0lVeG6WM4SW",
                "email": "user@example.com",
                "created_at": "2026-01-22T10:00:00Z"
            }
        }
