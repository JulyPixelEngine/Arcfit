from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lead import Lead


async def get_all(db: AsyncSession) -> list[Lead]:
    q = select(Lead).where(Lead.is_deleted == False)
    result = await db.execute(q.order_by(Lead.created_at.desc()))
    return list(result.scalars().all())


async def get_by_id(db: AsyncSession, lead_id: str) -> Lead | None:
    result = await db.execute(select(Lead).where(Lead.id == lead_id, Lead.is_deleted == False))
    return result.scalar_one_or_none()


async def create(
    db: AsyncSession,
    studio_name: str,
    owner_name: str,
    email: str,
    phone: str | None,
    message: str | None,
) -> Lead:
    lead = Lead(studio_name=studio_name, owner_name=owner_name, email=email, phone=phone, message=message)
    db.add(lead)
    await db.commit()
    await db.refresh(lead)
    return lead


async def update_status(db: AsyncSession, lead: Lead, status: str) -> Lead:
    lead.status = status
    await db.commit()
    await db.refresh(lead)
    return lead
