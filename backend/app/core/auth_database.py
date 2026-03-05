from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

auth_engine = create_async_engine(
    settings.AUTH_DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_recycle=3600,
)
AuthSessionLocal = async_sessionmaker(auth_engine, class_=AsyncSession, expire_on_commit=False)


class AuthBase(DeclarativeBase):
    pass


async def get_auth_db() -> AsyncSession:
    async with AuthSessionLocal() as session:
        yield session
