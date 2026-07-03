from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth_database import get_auth_db
from app.core.deps import get_current_user, require_roles
from app.models.user import User
from app.schemas.trainer import TrainerCreate, TrainerResponse, TrainerUpdate
from app.services import trainer as trainer_service

router = APIRouter()

ADMIN_ROLES = ("admin", "super-admin")


@router.get("/", response_model=list[TrainerResponse])
async def list_trainers(
    branch_id: str | None = None,
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
    return await trainer_service.list_trainers_by_branch(db, scope_branch_id)


@router.post("/", response_model=TrainerResponse, dependencies=[Depends(require_roles(*ADMIN_ROLES))])
async def create_trainer(body: TrainerCreate, db: AsyncSession = Depends(get_auth_db)):
    return await trainer_service.create_trainer(db, body)


@router.put("/{trainer_id}", response_model=TrainerResponse, dependencies=[Depends(require_roles(*ADMIN_ROLES))])
async def update_trainer(trainer_id: str, body: TrainerUpdate, db: AsyncSession = Depends(get_auth_db)):
    return await trainer_service.update_trainer(db, trainer_id, body)


@router.delete("/{trainer_id}", dependencies=[Depends(require_roles(*ADMIN_ROLES))])
async def delete_trainer(trainer_id: str, db: AsyncSession = Depends(get_auth_db)):
    await trainer_service.delete_trainer(db, trainer_id)
    return {"success": True, "message": "Trainer deleted"}
