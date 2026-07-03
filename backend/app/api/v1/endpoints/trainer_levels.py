from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth_database import get_auth_db
from app.core.deps import get_current_user, require_roles
from app.models.user import User
from app.schemas.trainer_level import TrainerLevelCreate, TrainerLevelResponse, TrainerLevelUpdate
from app.services import trainer_level as trainer_level_service

router = APIRouter()

ADMIN_ROLES = ("admin", "super-admin")


@router.get("/", response_model=list[TrainerLevelResponse])
async def list_trainer_levels(
    branch_id: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_auth_db),
):
    scope_branch_id = branch_id or current_user.branch_id
    if not scope_branch_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="branch_id is required (current user has no branch assigned)",
        )
    return await trainer_level_service.list_trainer_levels_by_branch(db, scope_branch_id)


@router.post("/", response_model=TrainerLevelResponse, dependencies=[Depends(require_roles(*ADMIN_ROLES))])
async def create_trainer_level(body: TrainerLevelCreate, db: AsyncSession = Depends(get_auth_db)):
    return await trainer_level_service.create_trainer_level(db, body)


@router.put("/{trainer_level_id}", response_model=TrainerLevelResponse, dependencies=[Depends(require_roles(*ADMIN_ROLES))])
async def update_trainer_level(trainer_level_id: str, body: TrainerLevelUpdate, db: AsyncSession = Depends(get_auth_db)):
    return await trainer_level_service.update_trainer_level(db, trainer_level_id, body)


@router.delete("/{trainer_level_id}", dependencies=[Depends(require_roles(*ADMIN_ROLES))])
async def delete_trainer_level(trainer_level_id: str, db: AsyncSession = Depends(get_auth_db)):
    await trainer_level_service.delete_trainer_level(db, trainer_level_id)
    return {"success": True, "message": "Trainer level deleted"}
