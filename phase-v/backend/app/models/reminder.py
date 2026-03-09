"""Reminder model for scheduled task notifications."""

from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


class Reminder(SQLModel, table=True):
    """
    Scheduled notification for a task.
    Created when a user sets a reminder offset on a task with a due_date.
    The scheduler service polls this table and publishes reminder.due events.
    """

    __tablename__ = "reminders"

    id: Optional[int] = Field(default=None, primary_key=True)
    task_id: int = Field(foreign_key="tasks.id", nullable=False, ondelete="CASCADE")
    user_id: str = Field(nullable=False, max_length=255, index=True)
    remind_at: datetime = Field(nullable=False)       # absolute scheduled time
    offset_minutes: Optional[int] = Field(default=None)  # original offset from due_date
    delivered: bool = Field(default=False, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
