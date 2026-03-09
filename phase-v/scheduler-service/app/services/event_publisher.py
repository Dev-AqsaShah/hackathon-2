"""Publishes domain events to Dapr pub/sub (Kafka).

Same pattern as backend EventPublisher — graceful degradation when Dapr is unavailable.
"""

import logging

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

DAPR_PUBLISH_URL = (
    f"http://localhost:{settings.DAPR_HTTP_PORT}"
    f"/v1.0/publish/{settings.DAPR_PUBSUB_NAME}/{settings.DAPR_TASK_TOPIC}"
)


def publish_event(event_type: str, payload: dict) -> bool:
    """
    Publish an event to Dapr pub/sub.

    Returns True on success, False if Dapr is unreachable.
    Never raises — caller should handle False gracefully.
    """
    body = {"event_type": event_type, **payload}
    try:
        with httpx.Client(timeout=5.0) as client:
            resp = client.post(DAPR_PUBLISH_URL, json=body)
            resp.raise_for_status()
        logger.info(f"Published {event_type}: task_id={payload.get('task_id')}")
        return True
    except Exception as exc:
        logger.warning(
            f"Dapr publish unavailable for {event_type} (will retry next cycle): {exc}"
        )
        return False
