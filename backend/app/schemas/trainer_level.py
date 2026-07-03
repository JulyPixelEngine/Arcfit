from datetime import datetime

from pydantic import BaseModel


class TrainerLevelCreate(BaseModel):
    branch_id: str
    name: str
    sort_order: int = 0


class TrainerLevelUpdate(BaseModel):
    name: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class TrainerLevelResponse(BaseModel):
    id: str
    branch_id: str
    name: str
    sort_order: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
