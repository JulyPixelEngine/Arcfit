from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


async def get_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email, User.is_deleted == False))
    return result.scalar_one_or_none()


async def get_by_provider(db: AsyncSession, provider: str, provider_id: str) -> User | None:
    result = await db.execute(
        select(User).where(
            User.provider == provider,
            User.provider_id == provider_id,
            User.is_deleted == False,
        )
    )
    return result.scalar_one_or_none()


async def get_by_id(db: AsyncSession, user_id: str) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id, User.is_deleted == False))
    return result.scalar_one_or_none()


async def create(
    db: AsyncSession,
    email: str,
    hashed_password: str | None = None,
    provider: str = "local",
    provider_id: str | None = None,
) -> User:
    user = User(
        email=email,
        hashed_password=hashed_password,
        provider=provider,
        provider_id=provider_id,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user
