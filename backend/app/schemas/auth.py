from datetime import datetime

from pydantic import BaseModel, EmailStr


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    password: str
    branch_id: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    branch_id: str | None = None


class UserResponse(BaseModel):
    id: str
    name: str | None = None
    email: str
    phone: str | None = None
    role: str
    branch_id: str | None = None
    is_active: bool
    provider: str
    created_at: datetime

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    success: bool
    message: str
