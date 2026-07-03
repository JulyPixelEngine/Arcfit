from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product


async def get_all_by_branch(db: AsyncSession, branch_id: str, product_type: str | None = None) -> list[Product]:
    q = select(Product).where(Product.is_deleted == False, Product.branch_id == branch_id)
    if product_type:
        q = q.where(Product.product_type == product_type)
    result = await db.execute(q.order_by(Product.created_at.desc()))
    return list(result.scalars().all())


async def get_by_id(db: AsyncSession, product_id: str) -> Product | None:
    result = await db.execute(
        select(Product).where(Product.id == product_id, Product.is_deleted == False)
    )
    return result.scalar_one_or_none()


async def create(db: AsyncSession, **kwargs) -> Product:
    product = Product(**kwargs)
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product


async def update(db: AsyncSession, product: Product, **kwargs) -> Product:
    for key, value in kwargs.items():
        setattr(product, key, value)
    await db.commit()
    await db.refresh(product)
    return product


async def soft_delete(db: AsyncSession, product: Product) -> None:
    product.is_deleted = True
    await db.commit()
