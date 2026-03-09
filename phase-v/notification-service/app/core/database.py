"""Database session for notification-service (shares same Neon PostgreSQL DB)."""

from sqlmodel import Session, create_engine
from app.core.config import settings

engine = create_engine(settings.effective_db_url, echo=False)


def get_db():
    with Session(engine) as session:
        yield session
