from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.branch import Branch
from app.repositories import branch as branch_repo
from app.schemas.branch import BranchCreate, BranchUpdate


async def list_branches(db: AsyncSession, search: str | None = None) -> list[Branch]:
    return await branch_repo.get_all(db, search)


async def create_branch(db: AsyncSession, data: BranchCreate, customer_id: str | None = None) -> Branch:
    return await branch_repo.create(
        db,
        name=data.name,
        address=data.address,
        phone=data.phone,
        description=data.description,
        customer_id=customer_id,
    )


async def update_branch(db: AsyncSession, branch_id: str, data: BranchUpdate) -> Branch:
    branch = await branch_repo.get_by_id(db, branch_id)
    if not branch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")
    updates = data.model_dump(exclude_none=True)
    return await branch_repo.update(db, branch, **updates)


async def delete_branch(db: AsyncSession, branch_id: str) -> None:
    branch = await branch_repo.get_by_id(db, branch_id)
    if not branch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")
    await branch_repo.soft_delete(db, branch)
