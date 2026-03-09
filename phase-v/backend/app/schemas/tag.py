"""Pydantic schemas for Tag."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, field_validator


class TagCreate(BaseModel):
    name: str
    color: str = "#6B7280"

    @field_validator("name")
    @classmethod
    def normalize_name(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator("color")
    @classmethod
    def validate_color(cls, v: str) -> str:
        if not v.startswith("#") or len(v) not in (4, 7):
            raise ValueError("color must be a valid hex color (e.g. #FF0000)")
        return v


class TagUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None

    @field_validator("name")
    @classmethod
    def normalize_name(cls, v: Optional[str]) -> Optional[str]:
        return v.strip().lower() if v else v


class TagRead(BaseModel):
    id: int
    name: str
    color: str
    task_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class TagListResponse(BaseModel):
    items: List[TagRead]
    total: int
