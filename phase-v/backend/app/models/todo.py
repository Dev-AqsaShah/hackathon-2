"""Task model for todo items — Phase V extended with due_date, priority, recurrence, tags."""

from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


class Task(SQLModel, table=True):
    """
    Task model representing a todo item belonging to a user.
    Phase V adds: due_date, priority, recurrence_rule_id, parent_task_id.
    """

    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(min_length=1, max_length=1000, nullable=False)
    description: Optional[str] = Field(default=None, max_length=5000)
    completed: bool = Field(default=False, nullable=False)
    owner_id: str = Field(nullable=False, index=True, max_length=255)

    # Phase V additions
    due_date: Optional[datetime] = Field(default=None)
    priority: str = Field(default="none", nullable=False, max_length=10)
    recurrence_rule_id: Optional[int] = Field(default=None, foreign_key="recurrence_rules.id")
    parent_task_id: Optional[int] = Field(default=None, foreign_key="tasks.id")

    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
