from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.trainer_level import TrainerLevel
from app.repositories import branch as branch_repo
from app.repositories import trainer as trainer_repo
from app.repositories import trainer_level as trainer_level_repo
from app.schemas.trainer_level import TrainerLevelCreate, TrainerLevelUpdate


async def list_trainer_levels_by_branch(db: AsyncSession, branch_id: str) -> list[TrainerLevel]:
    return await trainer_level_repo.get_all_by_branch(db, branch_id)


async def create_trainer_level(db: AsyncSession, data: TrainerLevelCreate) -> TrainerLevel:
    if not await branch_repo.get_by_id(db, data.branch_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")
    return await trainer_level_repo.create(db, branch_id=data.branch_id, name=data.name, sort_order=data.sort_order)


async def update_trainer_level(db: AsyncSession, trainer_level_id: str, data: TrainerLevelUpdate) -> TrainerLevel:
    trainer_level = await trainer_level_repo.get_by_id(db, trainer_level_id)
    if not trainer_level:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trainer level not found")
    updates = data.model_dump(exclude_none=True)
    return await trainer_level_repo.update(db, trainer_level, **updates)


async def delete_trainer_level(db: AsyncSession, trainer_level_id: str) -> None:
    trainer_level = await trainer_level_repo.get_by_id(db, trainer_level_id)
    if not trainer_level:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trainer level not found")

    in_use_count = await trainer_repo.count_by_trainer_level(db, trainer_level.branch_id, trainer_level.name)
    if in_use_count > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot delete: {in_use_count} trainer(s) are currently assigned this level.",
        )

    await trainer_level_repo.soft_delete(db, trainer_level)


async def validate_trainer_level(db: AsyncSession, branch_id: str, name: str) -> None:
    """Raise if `name` isn't an active trainer level defined for this branch."""
    valid = {tl.name for tl in await trainer_level_repo.get_all_by_branch(db, branch_id) if tl.is_active}
    if name not in valid:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid trainer level: {name}. Must be one of {sorted(valid)}.",
        )
