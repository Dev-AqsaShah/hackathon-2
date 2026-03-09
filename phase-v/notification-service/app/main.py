"""Notification Service — consumes task events from Kafka via Dapr and writes in-app notifications."""

import logging
from contextlib import asynccontextmanager
from typing import Any, Dict

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from app.subscribers.task_events import EVENT_HANDLERS

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Notification Service starting up...")
    yield
    logger.info("Notification Service shutting down.")


app = FastAPI(
    title="Todo Notification Service",
    description="Consumes Kafka events via Dapr pub/sub and delivers in-app notifications",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "notification-service"}


@app.post("/subscribe/task-events")
async def handle_task_event(request: Request):
    """
    Dapr pub/sub subscription endpoint.
    Receives CloudEvent envelopes from Kafka topic 'task-events'.
    Returns {"status": "SUCCESS"} to ack, {"status": "RETRY"} to retry.
    """
    try:
        body: Dict[str, Any] = await request.json()
        # Dapr wraps the payload in a CloudEvent envelope
        event_data: Dict[str, Any] = body.get("data", body)
        event_type: str = event_data.get("event_type", "")

        logger.info(f"Received event: {event_type}")

        handler = EVENT_HANDLERS.get(event_type)
        if handler:
            handler(event_data)
        else:
            logger.debug(f"No handler for event type '{event_type}' — ignoring")

        return JSONResponse(content={"status": "SUCCESS"})

    except Exception as e:
        logger.error(f"Error handling event: {e}", exc_info=True)
        # Return RETRY so Dapr redelivers the message
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"status": "RETRY"},
        )
