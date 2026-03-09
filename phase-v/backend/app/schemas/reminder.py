"""Pydantic schemas for Reminder."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class ReminderCreate(BaseModel):
    offset_minutes: int  # minutes before due_date (e.g. 60 = 1 hour before)


class ReminderRead(BaseModel):
    id: int
    remind_at: datetime
    offset_minutes: Optional[int]
    delivered: bool

    class Config:
        from_attributes = True


class ReminderListResponse(BaseModel):
    items: List[ReminderRead]
