"""Conversation model for chat sessions."""

import uuid
from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


class Conversation(SQLModel, table=True):
    """
    Conversation model representing a chat session belonging to a user.

    Per constitution: One conversation per user (continuing conversation model).

    Attributes:
        id: Unique conversation identifier (UUID)
        user_id: Owner of the conversation (unique - one per user)
        created_at: Session start timestamp (UTC)
        updated_at: Last activity timestamp (UTC)
    """

    __tablename__ = "conversations"

    id: Optional[str] = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        max_length=36
    )
    user_id: str = Field(
        nullable=False,
        index=True,
        unique=True,  # One conversation per user
        max_length=255
    )
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    class Config:
        """SQLModel configuration."""
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "user_id": "user-123",
                "created_at": "2026-01-31T10:00:00Z",
                "updated_at": "2026-01-31T10:30:00Z"
            }
        }
