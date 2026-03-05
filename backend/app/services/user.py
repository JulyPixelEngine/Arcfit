from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories import user as user_repo


async def get_user_by_id(db: AsyncSession, user_id: str) -> User:
    user = await user_repo.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


async def get_user_by_email(db: AsyncSession, email: str) -> User:
    user = await user_repo.get_by_email(db, email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user
