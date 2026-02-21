"""Message model for chat messages."""

import uuid
from datetime import datetime
from typing import Optional, Literal
from sqlmodel import Field, SQLModel


class Message(SQLModel, table=True):
    """
    Message model representing a single message in a conversation.

    Per constitution: Every message (user and assistant) MUST be stored.

    Attributes:
        id: Unique message identifier (UUID)
        conversation_id: Parent conversation reference
        role: Message author role ('user' or 'assistant')
        content: Message text content
        created_at: Message timestamp (UTC)
    """

    __tablename__ = "messages"

    id: Optional[str] = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        max_length=36
    )
    conversation_id: str = Field(
        nullable=False,
        index=True,
        foreign_key="conversations.id",
        max_length=36
    )
    role: str = Field(
        nullable=False,
        max_length=20  # 'user' or 'assistant'
    )
    content: str = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    class Config:
        """SQLModel configuration."""
        json_schema_extra = {
            "example": {
                "id": "660e8400-e29b-41d4-a716-446655440001",
                "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
                "role": "user",
                "content": "Add buy groceries to my list",
                "created_at": "2026-01-31T10:00:00Z"
            }
        }
