from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.class_type import ClassType
from app.repositories import branch as branch_repo
from app.repositories import class_type as class_type_repo
from app.schemas.class_type import ClassTypeCreate, ClassTypeUpdate


async def list_class_types_by_branch(db: AsyncSession, branch_id: str) -> list[ClassType]:
    return await class_type_repo.get_all_by_branch(db, branch_id)


async def create_class_type(db: AsyncSession, data: ClassTypeCreate) -> ClassType:
    if not await branch_repo.get_by_id(db, data.branch_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")
    return await class_type_repo.create(db, branch_id=data.branch_id, name=data.name, sort_order=data.sort_order)


async def update_class_type(db: AsyncSession, class_type_id: str, data: ClassTypeUpdate) -> ClassType:
    class_type = await class_type_repo.get_by_id(db, class_type_id)
    if not class_type:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class type not found")
    updates = data.model_dump(exclude_none=True)
    return await class_type_repo.update(db, class_type, **updates)


async def delete_class_type(db: AsyncSession, class_type_id: str) -> None:
    class_type = await class_type_repo.get_by_id(db, class_type_id)
    if not class_type:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class type not found")
    await class_type_repo.soft_delete(db, class_type)


async def validate_class_types(db: AsyncSession, branch_id: str, names: list[str]) -> None:
    """Raise if any of `names` isn't an active class type defined for this branch."""
    if not names:
        return
    valid = {ct.name for ct in await class_type_repo.get_all_by_branch(db, branch_id) if ct.is_active}
    invalid = set(names) - valid
    if invalid:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid class type(s): {', '.join(sorted(invalid))}. Must be one of {sorted(valid)}.",
        )
