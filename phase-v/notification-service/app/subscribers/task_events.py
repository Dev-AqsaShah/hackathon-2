"""Handles task domain events consumed from Kafka via Dapr pub/sub."""

import logging
from typing import Any, Dict

from app.services.notification_writer import write_notification

logger = logging.getLogger(__name__)


def handle_task_overdue(event_data: Dict[str, Any]) -> None:
    """Create an overdue notification when a task passes its deadline."""
    user_id = event_data.get("user_id")
    task_id = event_data.get("task_id")
    title = event_data.get("title", "A task")
    minutes_overdue = event_data.get("minutes_overdue", 0)

    if not user_id:
        logger.warning("task.overdue event missing user_id — skipping")
        return

    content = f"Task '{title}' is overdue"
    if minutes_overdue:
        hours = minutes_overdue // 60
        mins = minutes_overdue % 60
        if hours > 0:
            content += f" by {hours}h {mins}m"
        else:
            content += f" by {mins} minutes"

    write_notification(user_id, task_id, content, "overdue")


def handle_reminder_due(event_data: Dict[str, Any]) -> None:
    """Create a reminder notification when a scheduled reminder fires."""
    user_id = event_data.get("user_id")
    task_id = event_data.get("task_id")
    task_title = event_data.get("task_title", "A task")
    offset_minutes = event_data.get("offset_minutes")

    if not user_id:
        logger.warning("reminder.due event missing user_id — skipping")
        return

    if offset_minutes is not None:
        if offset_minutes >= 1440:
            time_str = f"{offset_minutes // 1440} day(s)"
        elif offset_minutes >= 60:
            time_str = f"{offset_minutes // 60} hour(s)"
        else:
            time_str = f"{offset_minutes} minutes"
        content = f"Reminder: '{task_title}' is due in {time_str}"
    else:
        content = f"Reminder: '{task_title}' is due soon"

    write_notification(user_id, task_id, content, "reminder")


EVENT_HANDLERS = {
    "task.overdue": handle_task_overdue,
    "reminder.due": handle_reminder_due,
}
