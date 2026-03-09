"""Synchronous database session for scheduler-service (APScheduler runs in threads)."""

from sqlmodel import Session, create_engine

from app.core.config import settings

engine = create_engine(settings.effective_db_url, echo=False)


def get_session() -> Session:
    return Session(engine)
