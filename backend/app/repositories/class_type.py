from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.class_type import ClassType


async def get_all_by_branch(db: AsyncSession, branch_id: str) -> list[ClassType]:
    q = select(ClassType).where(ClassType.is_deleted == False, ClassType.branch_id == branch_id)
    result = await db.execute(q.order_by(ClassType.sort_order, ClassType.created_at))
    return list(result.scalars().all())


async def get_by_id(db: AsyncSession, class_type_id: str) -> ClassType | None:
    result = await db.execute(
        select(ClassType).where(ClassType.id == class_type_id, ClassType.is_deleted == False)
    )
    return result.scalar_one_or_none()


async def create(db: AsyncSession, *, branch_id: str, name: str, sort_order: int) -> ClassType:
    class_type = ClassType(branch_id=branch_id, name=name, sort_order=sort_order)
    db.add(class_type)
    await db.commit()
    await db.refresh(class_type)
    return class_type


async def update(db: AsyncSession, class_type: ClassType, **kwargs) -> ClassType:
    for key, value in kwargs.items():
        setattr(class_type, key, value)
    await db.commit()
    await db.refresh(class_type)
    return class_type


async def soft_delete(db: AsyncSession, class_type: ClassType) -> None:
    class_type.is_deleted = True
    await db.commit()
