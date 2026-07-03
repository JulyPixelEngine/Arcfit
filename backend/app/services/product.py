from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.repositories import branch as branch_repo
from app.repositories import product as product_repo
from app.schemas.product import PASS_TYPES, PRODUCT_TYPES, ProductCreate, ProductUpdate
from app.services import class_type as class_type_service


def _validate_enum(value: str | None, allowed: tuple[str, ...], field: str) -> None:
    if value is not None and value not in allowed:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid {field}: {value}. Must be one of {allowed}.",
        )


async def list_products_by_branch(db: AsyncSession, branch_id: str, product_type: str | None = None) -> list[Product]:
    return await product_repo.get_all_by_branch(db, branch_id, product_type)


async def create_product(db: AsyncSession, data: ProductCreate) -> Product:
    _validate_enum(data.product_type, PRODUCT_TYPES, "product_type")
    _validate_enum(data.pass_type, PASS_TYPES, "pass_type")

    if not await branch_repo.get_by_id(db, data.branch_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")
    if data.category:
        await class_type_service.validate_class_types(db, data.branch_id, [data.category])

    return await product_repo.create(db, **data.model_dump())


async def update_product(db: AsyncSession, product_id: str, data: ProductUpdate) -> Product:
    product = await product_repo.get_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    _validate_enum(data.product_type, PRODUCT_TYPES, "product_type")
    _validate_enum(data.pass_type, PASS_TYPES, "pass_type")
    if data.category:
        await class_type_service.validate_class_types(db, product.branch_id, [data.category])

    updates = data.model_dump(exclude_none=True)
    return await product_repo.update(db, product, **updates)


async def delete_product(db: AsyncSession, product_id: str) -> None:
    product = await product_repo.get_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    await product_repo.soft_delete(db, product)
