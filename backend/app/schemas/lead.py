from datetime import datetime

from pydantic import BaseModel, EmailStr


class LeadCreate(BaseModel):
    studio_name: str
    owner_name: str
    email: EmailStr
    phone: str | None = None
    message: str | None = None


class LeadStatusUpdate(BaseModel):
    status: str


class LeadResponse(BaseModel):
    id: str
    studio_name: str
    owner_name: str
    email: str
    phone: str | None = None
    message: str | None = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
