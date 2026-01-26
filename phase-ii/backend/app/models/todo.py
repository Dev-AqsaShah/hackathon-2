"""Task model for todo items."""

from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


class Task(SQLModel, table=True):
    """
    Task model representing a todo item belonging to a user.

    Attributes:
        id: Unique task identifier (auto-generated)
        title: Task title (1-1000 characters, required)
        description: Optional detailed description (max 5000 characters)
        completed: Completion status (default: False)
        owner_id: Foreign key to users table (owner of this task)
        created_at: Creation timestamp (UTC)
        updated_at: Last modification timestamp (UTC)
    """

    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(min_length=1, max_length=1000, nullable=False)
    description: Optional[str] = Field(default=None, max_length=5000)
    completed: bool = Field(default=False, nullable=False)
    owner_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    class Config:
        """SQLModel configuration."""
        json_schema_extra = {
            "example": {
                "id": 42,
                "title": "Complete project documentation",
                "description": "Write comprehensive API documentation for the todo backend",
                "completed": False,
                "owner_id": 1,
                "created_at": "2026-01-23T10:30:00Z",
                "updated_at": "2026-01-23T10:30:00Z"
            }
        }
