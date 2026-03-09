"""Writes notification records to the shared PostgreSQL database."""

import logging
from datetime import datetime
from typing import Optional

from sqlmodel import Session, select, func

from app.core.database import engine

logger = logging.getLogger(__name__)


def write_notification(
    user_id: str,
    task_id: Optional[int],
    content: str,
    notification_type: str,
) -> None:
    """
    Insert a notification row. Checks for duplicates before inserting
    to ensure idempotency (at-least-once delivery via Kafka may cause duplicates).
    """
    from sqlalchemy import text

    with Session(engine) as db:
        # Idempotency: don't insert if same (user, task, type) already exists today
        if task_id is not None:
            existing = db.exec(
                text(
                    "SELECT id FROM notifications "
                    "WHERE user_id = :uid AND task_id = :tid AND notification_type = :ntype "
                    "AND DATE_TRUNC('day', created_at) = DATE_TRUNC('day', NOW())"
                ).bindparams(uid=user_id, tid=task_id, ntype=notification_type)
            ).first()
            if existing:
                logger.info(
                    f"Skipping duplicate notification: user={user_id} task={task_id} type={notification_type}"
                )
                return

        db.execute(
            text(
                "INSERT INTO notifications (user_id, task_id, content, notification_type, is_read, created_at) "
                "VALUES (:uid, :tid, :content, :ntype, false, NOW())"
            ).bindparams(uid=user_id, tid=task_id, content=content, ntype=notification_type)
        )
        db.commit()
        logger.info(f"Notification written: user={user_id} type={notification_type}")
