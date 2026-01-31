"""FastAPI dependencies for authentication and database sessions."""

from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.database import get_session
from app.core.security import extract_user_id, extract_user_email
from app.schemas.auth import UserContext

# HTTP Bearer token authentication scheme
security = HTTPBearer()


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]
) -> UserContext:
    """
    Dependency to extract and verify JWT token from Authorization header.

    Usage:
        @app.get("/protected")
        async def protected_route(user: UserContext = Depends(get_current_user)):
            print(f"Authenticated user ID: {user.user_id}")

    Args:
        credentials: HTTP Bearer credentials from Authorization header

    Returns:
        UserContext with user_id and email

    Raises:
        HTTPException: If token is missing, invalid, or expired (401)
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    # Extract user information from token
    user_id = extract_user_id(token)
    email = extract_user_email(token)

    return UserContext(user_id=user_id, email=email)


# Type alias for cleaner dependency injection
CurrentUser = Annotated[UserContext, Depends(get_current_user)]
DatabaseSession = Annotated[AsyncSession, Depends(get_session)]
