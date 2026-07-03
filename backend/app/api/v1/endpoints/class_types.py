from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth_database import get_auth_db
from app.core.deps import get_current_user, require_roles
from app.models.user import User
from app.schemas.class_type import ClassTypeCreate, ClassTypeResponse, ClassTypeUpdate
from app.services import class_type as class_type_service

router = APIRouter()

ADMIN_ROLES = ("admin", "super-admin")


@router.get("/", response_model=list[ClassTypeResponse])
async def list_class_types(
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
    return await class_type_service.list_class_types_by_branch(db, scope_branch_id)


@router.post("/", response_model=ClassTypeResponse, dependencies=[Depends(require_roles(*ADMIN_ROLES))])
async def create_class_type(body: ClassTypeCreate, db: AsyncSession = Depends(get_auth_db)):
    return await class_type_service.create_class_type(db, body)


@router.put("/{class_type_id}", response_model=ClassTypeResponse, dependencies=[Depends(require_roles(*ADMIN_ROLES))])
async def update_class_type(class_type_id: str, body: ClassTypeUpdate, db: AsyncSession = Depends(get_auth_db)):
    return await class_type_service.update_class_type(db, class_type_id, body)


@router.delete("/{class_type_id}", dependencies=[Depends(require_roles(*ADMIN_ROLES))])
async def delete_class_type(class_type_id: str, db: AsyncSession = Depends(get_auth_db)):
    await class_type_service.delete_class_type(db, class_type_id)
    return {"success": True, "message": "Class type deleted"}
