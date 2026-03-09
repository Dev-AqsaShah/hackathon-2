"""FastAPI dependencies for authentication and database sessions.

Auth bypassed for Phase IV hackathon demo - falls back to default user.
"""

from typing import Annotated, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.database import get_session
from app.core.security import extract_user_id, extract_user_email
from app.schemas.auth import UserContext

# HTTP Bearer token authentication scheme (auto_error=False to allow missing tokens)
security = HTTPBearer(auto_error=False)

# Default demo user for auth bypass
DEFAULT_USER_ID = "default-user"
DEFAULT_EMAIL = "demo@taskflow.app"


async def get_current_user(
    credentials: Annotated[Optional[HTTPAuthorizationCredentials], Depends(security)]
) -> UserContext:
    """
    Dependency to extract user from JWT token, or fall back to default user.

    For Phase IV hackathon demo, if no token is provided or token is invalid,
    returns the default demo user instead of raising 401.
    """
    if not credentials:
        return UserContext(user_id=DEFAULT_USER_ID, email=DEFAULT_EMAIL)

    try:
        token = credentials.credentials
        user_id = extract_user_id(token)
        email = extract_user_email(token)
        return UserContext(user_id=user_id, email=email)
    except Exception:
        # Fall back to default user on any token error
        return UserContext(user_id=DEFAULT_USER_ID, email=DEFAULT_EMAIL)


# Type alias for cleaner dependency injection
CurrentUser = Annotated[UserContext, Depends(get_current_user)]
DatabaseSession = Annotated[AsyncSession, Depends(get_session)]
