"""Pydantic schemas for RecurrenceRule."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, field_validator


class RecurrenceRuleCreate(BaseModel):
    frequency: str                          # daily | weekly | monthly | custom
    interval: int = 1
    days_of_week: Optional[List[int]] = None  # 0=Mon … 6=Sun
    end_type: str = "never"                 # never | on_date | after_n
    end_date: Optional[datetime] = None
    end_count: Optional[int] = None

    @field_validator("frequency")
    @classmethod
    def validate_frequency(cls, v: str) -> str:
        if v not in ("daily", "weekly", "monthly", "custom"):
            raise ValueError("frequency must be daily, weekly, monthly, or custom")
        return v

    @field_validator("end_type")
    @classmethod
    def validate_end_type(cls, v: str) -> str:
        if v not in ("never", "on_date", "after_n"):
            raise ValueError("end_type must be never, on_date, or after_n")
        return v


class RecurrenceRuleRead(BaseModel):
    id: int
    frequency: str
    interval: int
    days_of_week: Optional[List[int]] = None
    end_type: str
    end_date: Optional[datetime] = None
    end_count: Optional[int] = None
    occurrences_generated: int

    class Config:
        from_attributes = True
