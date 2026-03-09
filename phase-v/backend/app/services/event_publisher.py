"""EventPublisher — publishes domain events to Kafka via Dapr pub/sub HTTP API."""

import uuid
import logging
from datetime import datetime
from typing import Any, Dict, Optional

import httpx
from sqlmodel import Session

from app.core.dapr_config import DAPR_PUBSUB_URL
from app.models.domain_event import DomainEvent

logger = logging.getLogger(__name__)


async def publish_event(
    event_type: str,
    payload: Dict[str, Any],
    db: Session,
    correlation_id: Optional[str] = None,
    producer_service: str = "backend",
) -> None:
    """
    Publish a domain event to Kafka via Dapr pub/sub.

    Strategy:
    1. Write to domain_events table (outbox) for durability.
    2. POST to Dapr HTTP pub/sub endpoint (fire-and-forget).
    3. If Dapr is unavailable, log a warning — do NOT raise (API response must not block).
    """
    if correlation_id is None:
        correlation_id = str(uuid.uuid4())

    # Step 1: Write to outbox table
    event = DomainEvent(
        event_type=event_type,
        payload={**payload, "event_type": event_type, "correlation_id": correlation_id},
        correlation_id=correlation_id,
        producer_service=producer_service,
        published_at=datetime.utcnow(),
        processed=False,
    )
    db.add(event)
    db.commit()

    # Step 2: Publish to Dapr (non-blocking)
    event_data = {
        "event_type": event_type,
        "correlation_id": correlation_id,
        "timestamp": datetime.utcnow().isoformat(),
        **payload,
    }
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            response = await client.post(
                DAPR_PUBSUB_URL,
                json=event_data,
                headers={"Content-Type": "application/json"},
            )
            if response.status_code == 204:
                # Mark as processed in outbox
                event.processed = True
                db.commit()
                logger.info(f"Published event: {event_type} (correlation={correlation_id})")
            else:
                logger.warning(
                    f"Dapr returned {response.status_code} for event {event_type}: {response.text}"
                )
    except httpx.ConnectError:
        logger.warning(
            f"Dapr unavailable — event {event_type} saved to outbox (id={event.id}). "
            "Will be retried by outbox processor."
        )
    except Exception as e:
        logger.warning(f"Unexpected error publishing event {event_type}: {e}")
