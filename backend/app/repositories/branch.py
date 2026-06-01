from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.branch import Branch


async def get_all(db: AsyncSession, search: str | None = None) -> list[Branch]:
    q = select(Branch).where(Branch.is_deleted == False)
    if search:
        q = q.where(Branch.name.ilike(f"%{search}%"))
    result = await db.execute(q.order_by(Branch.created_at))
    return list(result.scalars().all())


async def get_by_id(db: AsyncSession, branch_id: str) -> Branch | None:
    result = await db.execute(
        select(Branch).where(Branch.id == branch_id, Branch.is_deleted == False)
    )
    return result.scalar_one_or_none()


async def create(db: AsyncSession, name: str, address: str, phone: str | None, description: str | None) -> Branch:
    branch = Branch(name=name, address=address, phone=phone, description=description)
    db.add(branch)
    await db.commit()
    await db.refresh(branch)
    return branch


async def update(db: AsyncSession, branch: Branch, **kwargs) -> Branch:
    for key, value in kwargs.items():
        setattr(branch, key, value)
    await db.commit()
    await db.refresh(branch)
    return branch


async def soft_delete(db: AsyncSession, branch: Branch) -> None:
    branch.is_deleted = True
    await db.commit()
