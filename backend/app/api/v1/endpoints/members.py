from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth_database import get_auth_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.member import MemberCreate, MemberResponse, MemberUpdate
from app.services import member as member_service

router = APIRouter()


@router.get("/", response_model=list[MemberResponse])
async def list_members(
    branch_id: str | None = None,
    search: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_auth_db),
):
    """Scoped to a branch — defaults to the current user's own branch."""
    scope_branch_id = branch_id or current_user.branch_id
    if not scope_branch_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="branch_id is required (current user has no branch assigned)",
        )
    return await member_service.list_members_by_branch(db, scope_branch_id, search)


@router.post("/", response_model=MemberResponse, dependencies=[Depends(get_current_user)])
async def create_member(body: MemberCreate, db: AsyncSession = Depends(get_auth_db)):
    return await member_service.create_member(db, body)


@router.put("/{member_id}", response_model=MemberResponse, dependencies=[Depends(get_current_user)])
async def update_member(member_id: str, body: MemberUpdate, db: AsyncSession = Depends(get_auth_db)):
    return await member_service.update_member(db, member_id, body)


@router.patch("/{member_id}/activate", response_model=MemberResponse, dependencies=[Depends(get_current_user)])
async def activate_member(member_id: str, db: AsyncSession = Depends(get_auth_db)):
    return await member_service.set_member_active(db, member_id, True)


@router.patch("/{member_id}/deactivate", response_model=MemberResponse, dependencies=[Depends(get_current_user)])
async def deactivate_member(member_id: str, db: AsyncSession = Depends(get_auth_db)):
    return await member_service.set_member_active(db, member_id, False)
