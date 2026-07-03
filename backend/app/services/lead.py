from fastapi import HTTPException, status as http_status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lead import Lead
from app.repositories import lead as lead_repo
from app.schemas.lead import LeadCreate

VALID_STATUSES = ("new", "contacted", "onboarded", "dismissed")


async def list_leads(db: AsyncSession) -> list[Lead]:
    return await lead_repo.get_all(db)


async def create_lead(db: AsyncSession, data: LeadCreate) -> Lead:
    return await lead_repo.create(
        db,
        studio_name=data.studio_name,
        owner_name=data.owner_name,
        email=data.email,
        phone=data.phone,
        message=data.message,
    )


async def update_lead_status(db: AsyncSession, lead_id: str, new_status: str) -> Lead:
    if new_status not in VALID_STATUSES:
        raise HTTPException(
            status_code=http_status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid status: {new_status}. Must be one of {VALID_STATUSES}.",
        )
    lead = await lead_repo.get_by_id(db, lead_id)
    if not lead:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Lead not found")
    return await lead_repo.update_status(db, lead, new_status)
