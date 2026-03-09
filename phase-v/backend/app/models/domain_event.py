"""DomainEvent model — append-only audit/outbox table for task lifecycle events."""

from datetime import datetime
from typing import Any, Dict, Optional
from sqlmodel import Field, SQLModel
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB


class DomainEvent(SQLModel, table=True):
    """
    Audit log of all significant task lifecycle transitions.
    Published to Kafka via Dapr pub/sub. Also serves as outbox for at-least-once delivery.
    Never updated or deleted in normal operation.
    """

    __tablename__ = "domain_events"

    id: Optional[int] = Field(default=None, primary_key=True)
    event_type: str = Field(nullable=False, max_length=50)
    # task.created | task.completed | task.deleted | task.updated | task.overdue | reminder.due
    payload: Dict[str, Any] = Field(default={}, sa_column=Column(JSONB, nullable=False))
    correlation_id: Optional[str] = Field(default=None, max_length=255)
    producer_service: str = Field(nullable=False, max_length=50)
    published_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    processed: bool = Field(default=False, nullable=False)
