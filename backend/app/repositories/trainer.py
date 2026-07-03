from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.trainer import Trainer, TrainerBranchAccess


async def get_all_by_branch(db: AsyncSession, branch_id: str) -> list[Trainer]:
    """Trainers whose primary branch is `branch_id`, or who have additional access to it."""
    access_subq = select(TrainerBranchAccess.trainer_id).where(TrainerBranchAccess.branch_id == branch_id)
    q = select(Trainer).where(
        Trainer.is_deleted == False,
        (Trainer.branch_id == branch_id) | (Trainer.id.in_(access_subq)),
    )
    result = await db.execute(q.order_by(Trainer.created_at))
    return list(result.scalars().all())


async def get_by_id(db: AsyncSession, trainer_id: str) -> Trainer | None:
    result = await db.execute(
        select(Trainer).where(Trainer.id == trainer_id, Trainer.is_deleted == False)
    )
    return result.scalar_one_or_none()


async def count_by_trainer_level(db: AsyncSession, branch_id: str, trainer_level_name: str) -> int:
    result = await db.execute(
        select(func.count()).select_from(Trainer).where(
            Trainer.is_deleted == False,
            Trainer.branch_id == branch_id,
            Trainer.trainer_level == trainer_level_name,
        )
    )
    return result.scalar_one()


async def get_additional_branch_ids(db: AsyncSession, trainer_id: str) -> list[str]:
    result = await db.execute(
        select(TrainerBranchAccess.branch_id).where(TrainerBranchAccess.trainer_id == trainer_id)
    )
    return list(result.scalars().all())


async def create(
    db: AsyncSession,
    *,
    branch_id: str,
    first_name: str,
    last_name: str,
    email: str,
    phone: str | None,
    trainer_level: str,
    class_permissions: list[str],
    additional_branch_ids: list[str],
) -> Trainer:
    trainer = Trainer(
        branch_id=branch_id,
        first_name=first_name,
        last_name=last_name,
        email=email,
        phone=phone,
        trainer_level=trainer_level,
        class_permissions=class_permissions,
    )
    db.add(trainer)
    await db.flush()  # assign trainer.id before creating access rows

    for bid in set(additional_branch_ids) - {branch_id}:
        db.add(TrainerBranchAccess(trainer_id=trainer.id, branch_id=bid))

    await db.commit()
    await db.refresh(trainer)
    return trainer


async def set_additional_branches(db: AsyncSession, trainer_id: str, branch_ids: list[str], primary_branch_id: str) -> None:
    await db.execute(
        TrainerBranchAccess.__table__.delete().where(TrainerBranchAccess.trainer_id == trainer_id)
    )
    for bid in set(branch_ids) - {primary_branch_id}:
        db.add(TrainerBranchAccess(trainer_id=trainer_id, branch_id=bid))
    await db.commit()


async def update(db: AsyncSession, trainer: Trainer, **kwargs) -> Trainer:
    for key, value in kwargs.items():
        setattr(trainer, key, value)
    await db.commit()
    await db.refresh(trainer)
    return trainer


async def soft_delete(db: AsyncSession, trainer: Trainer) -> None:
    trainer.is_deleted = True
    await db.commit()
