from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


async def get_all(
    db: AsyncSession,
    search: str | None = None,
    role: str | None = None,
) -> list[User]:
    q = select(User).where(User.is_deleted == False)
    if search:
        q = q.where(User.email.ilike(f"%{search}%") | User.name.ilike(f"%{search}%"))
    if role:
        q = q.where(User.role == role)
    result = await db.execute(q.order_by(User.created_at.desc()))
    return list(result.scalars().all())


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


async def get_by_trainer_id(db: AsyncSession, trainer_id: str) -> User | None:
    result = await db.execute(
        select(User).where(User.trainer_id == trainer_id, User.is_deleted == False)
    )
    return result.scalar_one_or_none()


async def create(
    db: AsyncSession,
    email: str,
    hashed_password: str | None = None,
    provider: str = "local",
    provider_id: str | None = None,
    name: str | None = None,
    phone: str | None = None,
    branch_id: str | None = None,
    trainer_id: str | None = None,
    role: str = "user",
) -> User:
    user = User(
        email=email,
        name=name,
        phone=phone,
        role=role,
        branch_id=branch_id,
        trainer_id=trainer_id,
        hashed_password=hashed_password,
        provider=provider,
        provider_id=provider_id,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def update(db: AsyncSession, user: User, **kwargs) -> User:
    for key, value in kwargs.items():
        setattr(user, key, value)
    await db.commit()
    await db.refresh(user)
    return user


async def update_role(db: AsyncSession, user: User, role: str) -> User:
    user.role = role
    await db.commit()
    await db.refresh(user)
    return user


async def set_active(db: AsyncSession, user: User, is_active: bool) -> User:
    user.is_active = is_active
    await db.commit()
    await db.refresh(user)
    return user


async def set_password(db: AsyncSession, user: User, hashed_password: str) -> User:
    user.hashed_password = hashed_password
    await db.commit()
    await db.refresh(user)
    return user


async def soft_delete(db: AsyncSession, user: User) -> None:
    user.is_deleted = True
    await db.commit()
