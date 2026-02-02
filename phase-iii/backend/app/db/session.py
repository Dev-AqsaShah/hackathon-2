"""Database session management.

Per constitution: Stateless server - every request fetches fresh data from database.
"""

from typing import Generator
from sqlmodel import Session, create_engine
from app.core.config import settings

# Create database engine with connection pooling
# Use SYNC_DATABASE_URL for synchronous operations (MCP server)
engine = create_engine(
    settings.SYNC_DATABASE_URL or settings.DATABASE_URL.replace("+asyncpg", "").replace("ssl=require", "sslmode=require"),
    echo=settings.DEBUG,  # Log SQL queries in debug mode
    pool_pre_ping=True,  # Verify connections before use
)


def get_session() -> Generator[Session, None, None]:
    """Get a database session.

    Yields:
        SQLModel Session for database operations

    Note:
        Per constitution, each request gets a fresh session.
        No state is stored between requests.
    """
    with Session(engine) as session:
        yield session
