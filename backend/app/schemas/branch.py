from datetime import datetime

from pydantic import BaseModel


class BranchCreate(BaseModel):
    name: str
    address: str
    phone: str | None = None
    description: str | None = None


class BranchUpdate(BaseModel):
    name: str | None = None
    address: str | None = None
    phone: str | None = None
    description: str | None = None


class BranchResponse(BaseModel):
    id: str
    name: str
    address: str
    phone: str | None = None
    description: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True
