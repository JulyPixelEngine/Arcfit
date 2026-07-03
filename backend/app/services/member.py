from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.member import Member
from app.repositories import branch as branch_repo
from app.repositories import member as member_repo
from app.repositories import trainer as trainer_repo
from app.schemas.member import MEMBER_STATUSES, MemberCreate, MemberUpdate


def _validate_status(value: str) -> None:
    if value not in MEMBER_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid status: {value}. Must be one of {MEMBER_STATUSES}.",
        )


async def list_members_by_branch(db: AsyncSession, branch_id: str, search: str | None = None) -> list[Member]:
    return await member_repo.get_all_by_branch(db, branch_id, search)


async def create_member(db: AsyncSession, data: MemberCreate) -> Member:
    _validate_status(data.status)

    if not await branch_repo.get_by_id(db, data.branch_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")
    if data.trainer_id and not await trainer_repo.get_by_id(db, data.trainer_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trainer not found")

    return await member_repo.create(
        db,
        branch_id=data.branch_id,
        trainer_id=data.trainer_id,
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        phone=data.phone,
        status=data.status,
    )


async def update_member(db: AsyncSession, member_id: str, data: MemberUpdate) -> Member:
    member = await member_repo.get_by_id(db, member_id)
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")

    if data.status is not None:
        _validate_status(data.status)
    if data.trainer_id is not None and not await trainer_repo.get_by_id(db, data.trainer_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trainer not found")

    updates = data.model_dump(exclude_none=True)
    return await member_repo.update(db, member, **updates)


async def set_member_active(db: AsyncSession, member_id: str, is_active: bool) -> Member:
    member = await member_repo.get_by_id(db, member_id)
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")
    return await member_repo.set_active(db, member, is_active)
