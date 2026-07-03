from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.member import Member


async def get_all_by_branch(db: AsyncSession, branch_id: str, search: str | None = None) -> list[Member]:
    q = select(Member).where(Member.is_deleted == False, Member.branch_id == branch_id)
    if search:
        q = q.where(
            (Member.first_name.ilike(f"%{search}%"))
            | (Member.last_name.ilike(f"%{search}%"))
            | (Member.phone.ilike(f"%{search}%"))
        )
    result = await db.execute(q.order_by(Member.created_at.desc()))
    return list(result.scalars().all())


async def get_by_id(db: AsyncSession, member_id: str) -> Member | None:
    result = await db.execute(
        select(Member).where(Member.id == member_id, Member.is_deleted == False)
    )
    return result.scalar_one_or_none()


async def create(
    db: AsyncSession,
    *,
    branch_id: str,
    trainer_id: str | None,
    first_name: str,
    last_name: str,
    email: str,
    phone: str | None,
    status: str,
) -> Member:
    member = Member(
        branch_id=branch_id,
        trainer_id=trainer_id,
        first_name=first_name,
        last_name=last_name,
        email=email,
        phone=phone,
        status=status,
    )
    db.add(member)
    await db.commit()
    await db.refresh(member)
    return member


async def update(db: AsyncSession, member: Member, **kwargs) -> Member:
    for key, value in kwargs.items():
        setattr(member, key, value)
    await db.commit()
    await db.refresh(member)
    return member


async def set_active(db: AsyncSession, member: Member, is_active: bool) -> Member:
    member.is_active = is_active
    await db.commit()
    await db.refresh(member)
    return member
