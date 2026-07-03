from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth_database import get_auth_db
from app.core.deps import require_roles
from app.schemas.lead import LeadCreate, LeadResponse, LeadStatusUpdate
from app.services import lead as lead_service

router = APIRouter()


@router.post("/", response_model=LeadResponse)
async def create_lead(body: LeadCreate, db: AsyncSession = Depends(get_auth_db)):
    """Public endpoint — submitted from the studio-signup interest form."""
    return await lead_service.create_lead(db, body)


@router.get("/", response_model=list[LeadResponse], dependencies=[Depends(require_roles("super-admin"))])
async def list_leads(db: AsyncSession = Depends(get_auth_db)):
    return await lead_service.list_leads(db)


@router.patch("/{lead_id}/status", response_model=LeadResponse, dependencies=[Depends(require_roles("super-admin"))])
async def update_lead_status(lead_id: str, body: LeadStatusUpdate, db: AsyncSession = Depends(get_auth_db)):
    return await lead_service.update_lead_status(db, lead_id, body.status)
