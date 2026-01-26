"""Database engine and session management with connection pooling."""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession as SQLModelAsyncSession

from app.core.config import settings

# Create async engine with connection pooling for Neon Serverless PostgreSQL
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,  # Log SQL queries in debug mode
    future=True,
    pool_size=5,  # Conservative pool size for serverless
    max_overflow=10,  # Allow burst connections
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=3600,  # Recycle connections after 1 hour
    connect_args={
        "ssl": "require",  # Enable SSL for Neon PostgreSQL
        "server_settings": {
            "jit": "off"  # Disable JIT for better compatibility
        }
    }
)

# Create async session factory
async_session_maker = sessionmaker(
    engine,
    class_=SQLModelAsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency to get database session.

    Usage:
        @app.get("/items")
        async def read_items(session: AsyncSession = Depends(get_session)):
            ...
    """
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()


async def create_db_and_tables():
    """Create all database tables. Called on application startup."""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


async def close_db_connection():
    """Close database connections. Called on application shutdown."""
    await engine.dispose()
