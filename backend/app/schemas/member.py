from datetime import datetime

from pydantic import BaseModel, EmailStr

MEMBER_STATUSES = ("active", "inactive", "suspended")


class MemberCreate(BaseModel):
    branch_id: str
    trainer_id: str | None = None
    first_name: str
    last_name: str
    email: EmailStr
    phone: str | None = None
    status: str = "active"


class MemberUpdate(BaseModel):
    trainer_id: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    status: str | None = None


class MemberResponse(BaseModel):
    id: str
    branch_id: str
    trainer_id: str | None = None
    first_name: str
    last_name: str
    email: str
    phone: str | None = None
    status: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
