"""Notification model for in-app user notifications."""

from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


class Notification(SQLModel, table=True):
    """
    In-app notification delivered to a user.
    Written by the notification-service when it consumes task events from Kafka.
    Frontend polls GET /notifications to fetch these.
    """

    __tablename__ = "notifications"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(nullable=False, max_length=255, index=True)
    task_id: Optional[int] = Field(default=None, foreign_key="tasks.id", ondelete="SET NULL")
    content: str = Field(nullable=False)
    notification_type: str = Field(nullable=False, max_length=30)  # reminder | overdue | system
    is_read: bool = Field(default=False, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
