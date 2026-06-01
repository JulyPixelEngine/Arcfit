from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth_database import get_auth_db
from app.core.security import decode_access_token, get_token_from_cookie
from app.models.user import User
from app.repositories import user as user_repo


async def get_current_user(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_auth_db)],
) -> User:
    token = get_token_from_cookie(request)
    payload = decode_access_token(token)
    user = await user_repo.get_by_id(db, payload["sub"])
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    return user


def require_roles(*roles: str):
    """Returns a FastAPI dependency that enforces role-based access."""
    async def checker(
        current_user: Annotated[User, Depends(get_current_user)],
    ) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user

    return checker
