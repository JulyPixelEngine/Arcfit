from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth_database import get_auth_db
from app.core.deps import get_current_user, require_roles
from app.models.user import User
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate
from app.services import product as product_service

router = APIRouter()

ADMIN_ROLES = ("admin", "super-admin")


@router.get("/", response_model=list[ProductResponse])
async def list_products(
    branch_id: str | None = None,
    product_type: str | None = None,
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
    return await product_service.list_products_by_branch(db, scope_branch_id, product_type)


@router.post("/", response_model=ProductResponse, dependencies=[Depends(require_roles(*ADMIN_ROLES))])
async def create_product(body: ProductCreate, db: AsyncSession = Depends(get_auth_db)):
    return await product_service.create_product(db, body)


@router.put("/{product_id}", response_model=ProductResponse, dependencies=[Depends(require_roles(*ADMIN_ROLES))])
async def update_product(product_id: str, body: ProductUpdate, db: AsyncSession = Depends(get_auth_db)):
    return await product_service.update_product(db, product_id, body)


@router.delete("/{product_id}", dependencies=[Depends(require_roles(*ADMIN_ROLES))])
async def delete_product(product_id: str, db: AsyncSession = Depends(get_auth_db)):
    await product_service.delete_product(db, product_id)
    return {"success": True, "message": "Product deleted"}
