"""
Product = Sellable catalog item (membership pass, personal lesson package,
locker rental, or equipment). Defined once per branch, later purchased/
assigned to individual members.

product_type: MEMBERSHIP | PERSONAL_LESSON | LOCKER | EQUIPMENT
pass_type: PERIOD | COUNT
category: PT | YOGA | PILATES | CROSSFIT (same taxonomy as Trainer.class_permissions)
"""
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.auth_database import AuthBase


class Product(AuthBase):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    branch_id: Mapped[str] = mapped_column(
        String, ForeignKey("branches.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    product_type: Mapped[str] = mapped_column(String, nullable=False, index=True)
    pass_type: Mapped[str] = mapped_column(String, nullable=False)
    category: Mapped[str | None] = mapped_column(String, nullable=True)
    duration_months: Mapped[int | None] = mapped_column(Integer, nullable=True)
    service_extra_days: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    session_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    pause_allowed_days: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    pause_min_days: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
