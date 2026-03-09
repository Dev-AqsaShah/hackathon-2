"""Scheduler Service — APScheduler-based background job runner with Dapr sidecar."""

import logging
from contextlib import asynccontextmanager

from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI

from app.jobs.overdue_checker import check_overdue_tasks
from app.jobs.reminder_dispatcher import dispatch_pending_reminders

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler(timezone="UTC")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Scheduler Service starting up...")
    scheduler.add_job(
        check_overdue_tasks,
        "interval",
        seconds=30,
        id="overdue_checker",
        misfire_grace_time=60,
    )
    scheduler.add_job(
        dispatch_pending_reminders,
        "interval",
        seconds=30,
        id="reminder_dispatcher",
        misfire_grace_time=60,
    )
    scheduler.start()
    logger.info("APScheduler started — overdue_checker and reminder_dispatcher running every 30s.")
    yield
    logger.info("Scheduler Service shutting down...")
    scheduler.shutdown(wait=False)


app = FastAPI(
    title="Todo Scheduler Service",
    description="Background scheduler: overdue task detection + reminder dispatch via Dapr pub/sub",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/health")
async def health():
    jobs = [{"id": j.id, "next_run": str(j.next_run_time)} for j in scheduler.get_jobs()]
    return {"status": "ok", "service": "scheduler-service", "jobs": jobs}
