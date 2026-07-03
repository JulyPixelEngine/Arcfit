from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth_database import get_auth_db
from app.core.deps import require_roles
from app.models.user import User
from app.schemas.branch import BranchCreate, BranchResponse, BranchUpdate
from app.services import branch as branch_service

router = APIRouter()

ADMIN_ROLES = ("admin", "super-admin")


@router.get("/", response_model=list[BranchResponse])
async def list_branches(search: str | None = None, db: AsyncSession = Depends(get_auth_db)):
    """Public endpoint — used for branch selector on login/signup."""
    return await branch_service.list_branches(db, search)


@router.post("/", response_model=BranchResponse)
async def create_branch(
    body: BranchCreate,
    current_user: Annotated[User, Depends(require_roles(*ADMIN_ROLES))],
    db: AsyncSession = Depends(get_auth_db),
):
    # A studio admin's branches always belong to their own customer — a
    # super-admin (platform operator, no customer_id) creating one directly
    # here is an edge case; normally studios are onboarded via create_customer.py.
    return await branch_service.create_branch(db, body, customer_id=current_user.customer_id)


@router.put("/{branch_id}", response_model=BranchResponse, dependencies=[Depends(require_roles(*ADMIN_ROLES))])
async def update_branch(branch_id: str, body: BranchUpdate, db: AsyncSession = Depends(get_auth_db)):
    return await branch_service.update_branch(db, branch_id, body)


@router.delete("/{branch_id}", dependencies=[Depends(require_roles(*ADMIN_ROLES))])
async def delete_branch(branch_id: str, db: AsyncSession = Depends(get_auth_db)):
    await branch_service.delete_branch(db, branch_id)
    return {"success": True, "message": "Branch deleted"}
