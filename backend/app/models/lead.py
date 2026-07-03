"""
Lead = Inbound interest from a studio owner ("우리 센터 무료로 등록하기").

Submitted publicly from the marketing/signup page. Reviewed manually by a
super-admin, who then onboards the studio via scripts/create_customer.py.

status: new | contacted | onboarded | dismissed
"""
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.auth_database import AuthBase


class Lead(AuthBase):
    __tablename__ = "leads"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    studio_name: Mapped[str] = mapped_column(String, nullable=False)
    owner_name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False)
    phone: Mapped[str | None] = mapped_column(String, nullable=True)
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String, default="new", nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
