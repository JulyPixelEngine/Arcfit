from datetime import datetime

from pydantic import BaseModel, EmailStr


class SignupRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    provider: str
    created_at: datetime

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    success: bool
    message: str
