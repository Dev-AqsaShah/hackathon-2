"""Periodic job: dispatches pending reminders as reminder.due events."""

import logging

from sqlalchemy import text

from app.core.database import get_session
from app.services.event_publisher import publish_event

logger = logging.getLogger(__name__)


def dispatch_pending_reminders() -> None:
    """Find undelivered reminders that are past due and publish reminder.due events."""
    try:
        with get_session() as db:
            rows = db.exec(
                text(
                    "SELECT r.id, r.task_id, r.user_id, r.offset_minutes, t.title "
                    "FROM reminders r "
                    "JOIN tasks t ON t.id = r.task_id "
                    "WHERE r.remind_at <= NOW() AND r.delivered = FALSE"
                )
            ).fetchall()

            dispatched_ids = []
            for row in rows:
                reminder_id, task_id, user_id, offset_minutes, task_title = row

                published = publish_event(
                    "reminder.due",
                    {
                        "reminder_id": reminder_id,
                        "task_id": task_id,
                        "user_id": str(user_id),
                        "task_title": task_title,
                        "offset_minutes": offset_minutes,
                    },
                )
                if published:
                    dispatched_ids.append(reminder_id)

            if dispatched_ids:
                for rid in dispatched_ids:
                    db.exec(
                        text("UPDATE reminders SET delivered = TRUE WHERE id = :rid").bindparams(rid=rid)
                    )
                db.commit()
                logger.info(f"Dispatched {len(dispatched_ids)} reminder(s)")

    except Exception as exc:
        logger.error(f"reminder_dispatcher error: {exc}", exc_info=True)
