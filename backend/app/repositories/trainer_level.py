from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.trainer_level import TrainerLevel


async def get_all_by_branch(db: AsyncSession, branch_id: str) -> list[TrainerLevel]:
    q = select(TrainerLevel).where(TrainerLevel.is_deleted == False, TrainerLevel.branch_id == branch_id)
    result = await db.execute(q.order_by(TrainerLevel.sort_order, TrainerLevel.created_at))
    return list(result.scalars().all())


async def get_by_id(db: AsyncSession, trainer_level_id: str) -> TrainerLevel | None:
    result = await db.execute(
        select(TrainerLevel).where(TrainerLevel.id == trainer_level_id, TrainerLevel.is_deleted == False)
    )
    return result.scalar_one_or_none()


async def create(db: AsyncSession, *, branch_id: str, name: str, sort_order: int) -> TrainerLevel:
    trainer_level = TrainerLevel(branch_id=branch_id, name=name, sort_order=sort_order)
    db.add(trainer_level)
    await db.commit()
    await db.refresh(trainer_level)
    return trainer_level


async def update(db: AsyncSession, trainer_level: TrainerLevel, **kwargs) -> TrainerLevel:
    for key, value in kwargs.items():
        setattr(trainer_level, key, value)
    await db.commit()
    await db.refresh(trainer_level)
    return trainer_level


async def soft_delete(db: AsyncSession, trainer_level: TrainerLevel) -> None:
    trainer_level.is_deleted = True
    await db.commit()
