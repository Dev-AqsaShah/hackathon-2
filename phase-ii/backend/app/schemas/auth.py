"""Authentication schemas for JWT tokens and user context."""

from typing import Optional
from pydantic import BaseModel, EmailStr


class JWTPayload(BaseModel):
    """JWT token payload structure."""

    sub: str  # Subject (user ID)
    email: Optional[EmailStr] = None
    exp: Optional[int] = None  # Expiration time
    iat: Optional[int] = None  # Issued at time

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "sub": "123",
                "email": "user@example.com",
                "exp": 1706000000,
                "iat": 1705900000
            }
        }


class UserContext(BaseModel):
    """User context extracted from JWT token for request handling."""

    user_id: int
    email: Optional[str] = None

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "user_id": 123,
                "email": "user@example.com"
            }
        }
