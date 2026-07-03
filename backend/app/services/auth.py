from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories import user as user_repo


async def register(
    db: AsyncSession,
    email: str,
    password: str,
    name: str | None = None,
    phone: str | None = None,
    branch_id: str | None = None,
) -> tuple[User, str]:
    existing = await user_repo.get_by_email(db, email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    hashed = hash_password(password)
    user = await user_repo.create(
        db,
        email=email,
        hashed_password=hashed,
        name=name,
        phone=phone,
        branch_id=branch_id,
        role="user",
    )
    token = create_access_token(user.id)
    return user, token


async def login(db: AsyncSession, email: str, password: str) -> tuple[User, str]:
    user = await user_repo.get_by_email(db, email)
    if not user or not user.hashed_password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Account is deactivated")

    token = create_access_token(user.id)
    return user, token


async def get_or_create_oauth_user(
    db: AsyncSession, email: str, provider: str, provider_id: str
) -> tuple[User, str]:
    user = await user_repo.get_by_provider(db, provider, provider_id)
    if not user:
        # 같은 이메일로 기존 로컬 계정이 있으면 연결
        user = await user_repo.get_by_email(db, email)
        if not user:
            user = await user_repo.create(db, email=email, provider=provider, provider_id=provider_id)

    token = create_access_token(user.id)
    return user, token
