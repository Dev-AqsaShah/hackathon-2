"""Todo schemas for request/response validation per OpenAPI specification."""

from datetime import datetime
from pydantic import BaseModel, Field


class TodoCreate(BaseModel):
    """Request schema for creating a new todo."""

    title: str = Field(min_length=1, max_length=1000, description="Todo task description")

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "title": "Complete Phase-2 implementation"
            }
        }


class TodoUpdate(BaseModel):
    """Request schema for updating a todo."""

    title: str = Field(min_length=1, max_length=1000, description="Updated todo task description")

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "title": "Complete Phase-2 implementation and testing"
            }
        }


class TodoResponse(BaseModel):
    """Response schema for todo operations."""

    id: int
    user_id: int
    title: str
    is_completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic configuration."""
        from_attributes = True  # Enable ORM mode for SQLModel compatibility
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 123,
                "title": "Complete Phase-2 implementation",
                "is_completed": False,
                "created_at": "2026-01-22T10:30:00Z",
                "updated_at": "2026-01-22T10:30:00Z"
            }
        }


class TodoListResponse(BaseModel):
    """Response schema for listing todos."""

    todos: list[TodoResponse]
    count: int

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "todos": [
                    {
                        "id": 1,
                        "user_id": 123,
                        "title": "Buy groceries",
                        "is_completed": False,
                        "created_at": "2026-01-22T10:30:00Z",
                        "updated_at": "2026-01-22T10:30:00Z"
                    }
                ],
                "count": 1
            }
        }
