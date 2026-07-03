from datetime import datetime

from pydantic import BaseModel

PRODUCT_TYPES = ("MEMBERSHIP", "PERSONAL_LESSON", "LOCKER", "EQUIPMENT")
PASS_TYPES = ("PERIOD", "COUNT")
# category is validated against the branch's class_types table (see services/product.py)


class ProductCreate(BaseModel):
    branch_id: str
    name: str
    product_type: str
    pass_type: str
    category: str | None = None
    duration_months: int | None = None
    service_extra_days: int = 0
    session_count: int | None = None
    pause_allowed_days: int = 0
    pause_min_days: int = 0
    price: int
    description: str | None = None


class ProductUpdate(BaseModel):
    name: str | None = None
    product_type: str | None = None
    pass_type: str | None = None
    category: str | None = None
    duration_months: int | None = None
    service_extra_days: int | None = None
    session_count: int | None = None
    pause_allowed_days: int | None = None
    pause_min_days: int | None = None
    price: int | None = None
    description: str | None = None
    is_active: bool | None = None


class ProductResponse(BaseModel):
    id: str
    branch_id: str
    name: str
    product_type: str
    pass_type: str
    category: str | None = None
    duration_months: int | None = None
    service_extra_days: int
    session_count: int | None = None
    pause_allowed_days: int
    pause_min_days: int
    price: int
    description: str | None = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
