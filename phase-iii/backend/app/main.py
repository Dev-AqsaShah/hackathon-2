"""FastAPI application entry point for Todo AI Chatbot (Phase-3)."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import close_db_connection, create_db_and_tables
from app.api.routes import tasks
# Import models so SQLModel registers them for table creation
from app.models import User, Task, Conversation, Message  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    print(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    print(f"CORS origins: {settings.cors_origins_list}")
    # Create database tables
    print("Creating database tables...")
    await create_db_and_tables()
    print("Database tables created successfully")
    yield
    # Shutdown
    print("Shutting down...")
    await close_db_connection()


app = FastAPI(
    title=settings.APP_NAME,
    description="RESTful API for multi-user todo application with JWT authentication",
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

# CORS configuration from environment variables
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "message": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "healthy"
    }


@app.get("/health")
async def health_check():
    """Health check for monitoring."""
    return {"status": "ok"}


# Register task routes (Phase 2 REST API)
app.include_router(tasks.router, tags=["Tasks"])

# Chat routes (Phase 3 AI Chatbot)
from app.api.routes import chat
app.include_router(chat.router, tags=["Chat"])
