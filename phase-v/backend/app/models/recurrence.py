"""RecurrenceRule model for repeating tasks."""

from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


class RecurrenceRule(SQLModel, table=True):
    """
    Defines the repeat pattern for a recurring task.

    Supports daily, weekly, monthly, and custom intervals
    following iCalendar RRULE semantics (RFC 5545).
    """

    __tablename__ = "recurrence_rules"

    id: Optional[int] = Field(default=None, primary_key=True)
    frequency: str = Field(nullable=False)          # daily | weekly | monthly | custom
    interval: int = Field(default=1, nullable=False) # every N periods
    days_of_week: Optional[str] = Field(default=None)  # JSON array: [0,2,4] = Mon,Wed,Fri
    end_type: str = Field(default="never", nullable=False)  # never | on_date | after_n
    end_date: Optional[datetime] = Field(default=None)
    end_count: Optional[int] = Field(default=None)
    occurrences_generated: int = Field(default=0, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
