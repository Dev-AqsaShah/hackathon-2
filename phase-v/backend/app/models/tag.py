"""Tag and TaskTag models for task labelling."""

from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


class Tag(SQLModel, table=True):
    """
    User-defined label that can be assigned to tasks.
    Names are stored lowercase; uniqueness enforced per user via DB index.
    """

    __tablename__ = "tags"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(nullable=False, max_length=255, index=True)
    name: str = Field(nullable=False, max_length=50)
    color: str = Field(default="#6B7280", max_length=7)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class TaskTag(SQLModel, table=True):
    """Junction table linking tasks to tags (many-to-many)."""

    __tablename__ = "task_tags"

    task_id: int = Field(foreign_key="tasks.id", primary_key=True, ondelete="CASCADE")
    tag_id: int = Field(foreign_key="tags.id", primary_key=True, ondelete="CASCADE")
