"""Dapr configuration settings."""

import os

DAPR_HTTP_PORT: int = int(os.getenv("DAPR_HTTP_PORT", "3500"))
DAPR_PUBSUB_NAME: str = os.getenv("DAPR_PUBSUB_NAME", "task-pubsub")
DAPR_TASK_TOPIC: str = os.getenv("DAPR_TASK_TOPIC", "task-events")
DAPR_STATESTORE_NAME: str = os.getenv("DAPR_STATESTORE_NAME", "task-statestore")

DAPR_BASE_URL: str = f"http://localhost:{DAPR_HTTP_PORT}"
DAPR_PUBSUB_URL: str = f"{DAPR_BASE_URL}/v1.0/publish/{DAPR_PUBSUB_NAME}/{DAPR_TASK_TOPIC}"
