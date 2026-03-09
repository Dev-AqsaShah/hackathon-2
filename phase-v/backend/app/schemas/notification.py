"""Pydantic schemas for Notification."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class NotificationRead(BaseModel):
    id: int
    content: str
    notification_type: str
    is_read: bool
    task_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    items: List[NotificationRead]
    total: int
    unread_count: int
