from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth_database import get_auth_db
from app.core.deps import require_roles
from app.repositories import user as user_repo
from app.schemas.admin import RoleUpdateRequest
from app.schemas.auth import UserResponse

router = APIRouter()

ADMIN_ROLES = ("admin", "super-admin")


@router.get("/users", response_model=list[UserResponse], dependencies=[Depends(require_roles(*ADMIN_ROLES))])
async def list_users(
    search: str | None = None,
    role: str | None = None,
    db: AsyncSession = Depends(get_auth_db),
):
    return await user_repo.get_all(db, search=search, role=role)


@router.patch("/users/{user_id}/role", response_model=UserResponse, dependencies=[Depends(require_roles(*ADMIN_ROLES))])
async def change_user_role(
    user_id: str,
    body: RoleUpdateRequest,
    db: AsyncSession = Depends(get_auth_db),
):
    user = await user_repo.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return await user_repo.update_role(db, user, body.role)


@router.patch("/users/{user_id}/deactivate", response_model=UserResponse, dependencies=[Depends(require_roles(*ADMIN_ROLES))])
async def deactivate_user(user_id: str, db: AsyncSession = Depends(get_auth_db)):
    user = await user_repo.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return await user_repo.set_active(db, user, False)


@router.patch("/users/{user_id}/activate", response_model=UserResponse, dependencies=[Depends(require_roles(*ADMIN_ROLES))])
async def activate_user(user_id: str, db: AsyncSession = Depends(get_auth_db)):
    user = await user_repo.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return await user_repo.set_active(db, user, True)
