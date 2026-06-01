import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.auth_database import AuthBase


class User(AuthBase):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    name: Mapped[str | None] = mapped_column(String, nullable=True)
    phone: Mapped[str | None] = mapped_column(String, nullable=True)
    # role: user | trainer | admin | super-admin
    role: Mapped[str] = mapped_column(String, default="user", nullable=False)
    # Soft FK references to domain tables (no DB-level constraint — cross-concept)
    customer_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    branch_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    trainer_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    hashed_password: Mapped[str | None] = mapped_column(String, nullable=True)
    provider: Mapped[str] = mapped_column(String, default="local", nullable=False)  # local | google | kakao
    provider_id: Mapped[str | None] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
