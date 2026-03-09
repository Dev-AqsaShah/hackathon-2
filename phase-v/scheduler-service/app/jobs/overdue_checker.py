"""Periodic job: detects overdue tasks and publishes task.overdue events.

Uses Dapr state store to deduplicate — only one overdue notification per task per 24h.
"""

import logging
from datetime import datetime, timezone

import httpx
from sqlalchemy import text

from app.core.config import settings
from app.core.database import get_session
from app.services.event_publisher import publish_event

logger = logging.getLogger(__name__)

_STATE_BASE_URL = (
    f"http://localhost:{settings.DAPR_HTTP_PORT}"
    f"/v1.0/state/{settings.DAPR_STATESTORE_NAME}"
)


def check_overdue_tasks() -> None:
    """Query tasks that are overdue and publish task.overdue events (24h dedup via state store)."""
    try:
        with get_session() as db:
            rows = db.exec(
                text(
                    "SELECT id, owner_id, title, due_date "
                    "FROM tasks "
                    "WHERE due_date < NOW() "
                    "AND completed = FALSE "
                    "AND due_date IS NOT NULL"
                )
            ).fetchall()

        for row in rows:
            task_id, owner_id, title, due_date = row
            state_key = f"overdue_notified_{task_id}"

            if _state_exists(state_key):
                logger.debug(f"Skipping already-notified overdue task {task_id}")
                continue

            now = datetime.now(timezone.utc)
            if due_date.tzinfo is None:
                due_date = due_date.replace(tzinfo=timezone.utc)
            minutes_overdue = max(0, int((now - due_date).total_seconds() / 60))

            published = publish_event(
                "task.overdue",
                {
                    "task_id": task_id,
                    "user_id": str(owner_id),
                    "title": title,
                    "minutes_overdue": minutes_overdue,
                },
            )
            if published:
                # Record in state store with 24h TTL to prevent re-notification
                _save_state(state_key, "1")

    except Exception as exc:
        logger.error(f"overdue_checker error: {exc}", exc_info=True)


def _state_exists(key: str) -> bool:
    try:
        with httpx.Client(timeout=3.0) as client:
            resp = client.get(f"{_STATE_BASE_URL}/{key}")
            return resp.status_code == 200 and bool(resp.text.strip().strip('"'))
    except Exception:
        return False


def _save_state(key: str, value: str) -> None:
    try:
        with httpx.Client(timeout=3.0) as client:
            client.post(
                _STATE_BASE_URL,
                json=[
                    {
                        "key": key,
                        "value": value,
                        "metadata": {"ttlInSeconds": "86400"},
                    }
                ],
            )
    except Exception as exc:
        logger.warning(f"Failed to save state key {key}: {exc}")
