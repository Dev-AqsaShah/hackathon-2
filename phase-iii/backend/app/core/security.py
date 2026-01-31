"""JWT token verification and security utilities."""

from typing import Optional, Dict, Any
from jose import jwt, JWTError
from fastapi import HTTPException, status

from app.core.config import settings


def verify_token(token: str) -> Dict[str, Any]:
    """
    Verify JWT token signature and decode payload.

    Args:
        token: JWT token string

    Returns:
        Decoded token payload as dictionary

    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        # Decode and verify JWT token using shared secret
        payload = jwt.decode(
            token,
            settings.BETTER_AUTH_SECRET,
            algorithms=["HS256"]
        )
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e


def extract_user_id(token: str) -> str:
    """
    Extract user ID from JWT token.

    Args:
        token: JWT token string

    Returns:
        User ID as string (Better Auth uses UUID strings)

    Raises:
        HTTPException: If token is invalid or missing user ID
    """
    payload = verify_token(token)

    # Extract user ID from payload
    # Better Auth typically stores user ID in 'sub' claim
    user_id = payload.get("sub")
    if not user_id:
        # Fallback to 'user_id' or 'id' if 'sub' not present
        user_id = payload.get("user_id") or payload.get("id")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing user identification",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return str(user_id)


def extract_user_email(token: str) -> Optional[str]:
    """
    Extract user email from JWT token if available.

    Args:
        token: JWT token string

    Returns:
        User email as string or None
    """
    payload = verify_token(token)
    return payload.get("email")
