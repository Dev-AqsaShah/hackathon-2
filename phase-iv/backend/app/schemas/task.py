"""Pydantic schemas for Task request/response validation."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    """
    Request schema for creating a new task.

    Attributes:
        title: Task title (1-1000 characters, required)
        description: Optional detailed description (max 5000 characters)
    """

    title: str = Field(..., min_length=1, max_length=1000, description="Task title")
    description: Optional[str] = Field(
        None, max_length=5000, description="Optional task description"
    )

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "title": "Complete project documentation",
                "description": "Write comprehensive API documentation for the todo backend"
            }
        }


class TaskUpdate(BaseModel):
    """
    Request schema for updating an existing task.

    Both fields are optional to support partial updates.

    Attributes:
        title: Updated task title (1-1000 characters, optional)
        description: Updated description (max 5000 characters, optional)
    """

    title: Optional[str] = Field(
        None, min_length=1, max_length=1000, description="Updated task title"
    )
    description: Optional[str] = Field(
        None, max_length=5000, description="Updated task description"
    )

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "title": "Complete project documentation (updated)",
                "description": "Write and review comprehensive API documentation"
            }
        }


class TaskResponse(BaseModel):
    """
    Response schema for task data.

    Attributes:
        id: Unique task identifier
        title: Task title
        description: Task description (null if not provided)
        completed: Completion status
        owner_id: ID of user who owns this task
        created_at: Task creation timestamp (UTC, ISO 8601)
        updated_at: Last update timestamp (UTC, ISO 8601)
    """

    id: int = Field(..., description="Unique task identifier")
    title: str = Field(..., description="Task title")
    description: Optional[str] = Field(None, description="Task description (null if not provided)")
    completed: bool = Field(..., description="Completion status")
    owner_id: str = Field(..., description="ID of user who owns this task (Better Auth UUID)")
    created_at: datetime = Field(..., description="Task creation timestamp (UTC, ISO 8601)")
    updated_at: datetime = Field(..., description="Last update timestamp (UTC, ISO 8601)")

    class Config:
        """Pydantic configuration."""
        from_attributes = True
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
