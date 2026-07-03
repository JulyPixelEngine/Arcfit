from datetime import datetime

from pydantic import BaseModel, EmailStr


class TrainerCreate(BaseModel):
    branch_id: str
    additional_branch_ids: list[str] = []
    first_name: str
    last_name: str
    email: EmailStr
    phone: str | None = None
    trainer_level: str = "junior"
    class_permissions: list[str] = []
    # Login credentials for the trainer's own account (role=trainer).
    password: str


class TrainerUpdate(BaseModel):
    branch_id: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    trainer_level: str | None = None
    class_permissions: list[str] | None = None
    additional_branch_ids: list[str] | None = None
    is_active: bool | None = None
    # Set or reset the trainer's login password. Omit to leave it unchanged.
    password: str | None = None


class TrainerResponse(BaseModel):
    id: str
    branch_id: str
    additional_branch_ids: list[str] = []
    first_name: str
    last_name: str
    email: str
    phone: str | None = None
    trainer_level: str
    class_permissions: list[str] = []
    is_active: bool
    has_login: bool = False
    created_at: datetime

    class Config:
        from_attributes = True
