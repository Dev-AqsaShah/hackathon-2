"""RecurrenceService — calculates next occurrence dates for recurring tasks."""

import json
from datetime import datetime, timedelta
from typing import Optional

from app.models.recurrence import RecurrenceRule


def should_generate_next(rule: RecurrenceRule) -> bool:
    """Return True if another occurrence should be created based on end conditions."""
    if rule.end_type == "never":
        return True
    if rule.end_type == "on_date":
        return rule.end_date is None or datetime.utcnow() < rule.end_date.replace(tzinfo=None)
    if rule.end_type == "after_n":
        return rule.end_count is None or rule.occurrences_generated < rule.end_count
    return True


def calculate_next_due(rule: RecurrenceRule, current_due: datetime) -> Optional[datetime]:
    """
    Calculate the next due date based on the recurrence rule.
    Returns None if no further occurrences should be generated.
    """
    if not should_generate_next(rule):
        return None

    base = current_due.replace(tzinfo=None) if current_due.tzinfo else current_due

    if rule.frequency == "daily":
        return base + timedelta(days=rule.interval)

    if rule.frequency == "weekly":
        if rule.days_of_week:
            # Find the next matching weekday
            days = json.loads(rule.days_of_week) if isinstance(rule.days_of_week, str) else rule.days_of_week
            current_weekday = base.weekday()
            # Look ahead up to 7*interval days for next matching weekday
            for offset in range(1, 7 * rule.interval + 1):
                candidate = base + timedelta(days=offset)
                if candidate.weekday() in days:
                    return candidate
        return base + timedelta(weeks=rule.interval)

    if rule.frequency == "monthly":
        # Add N months, keeping same day-of-month
        month = base.month + rule.interval
        year = base.year + (month - 1) // 12
        month = (month - 1) % 12 + 1
        import calendar
        max_day = calendar.monthrange(year, month)[1]
        day = min(base.day, max_day)
        return base.replace(year=year, month=month, day=day)

    if rule.frequency == "custom":
        # Custom: treat interval as days
        return base + timedelta(days=rule.interval)

    return None
