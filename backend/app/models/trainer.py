"""
Trainer = Gym Staff working at a Branch.

Trainer level: junior | senior | master
"""
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.auth_database import AuthBase


class Trainer(AuthBase):
    __tablename__ = "trainers"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    branch_id: Mapped[str] = mapped_column(
        String, ForeignKey("branches.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # Optional link to an auth user account (for trainer login)
    auth_user_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)

    first_name: Mapped[str] = mapped_column(String, nullable=False)
    last_name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False, index=True)
    phone: Mapped[str | None] = mapped_column(String, nullable=True)
    # trainer_level: junior | senior | master
    trainer_level: Mapped[str] = mapped_column(String, default="junior", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    branch: Mapped["Branch"] = relationship(back_populates="trainers")  # type: ignore[name-defined]
    members: Mapped[list["Member"]] = relationship(back_populates="trainer", lazy="select")  # type: ignore[name-defined]
    sessions: Mapped[list["PtSession"]] = relationship(back_populates="trainer", lazy="select")  # type: ignore[name-defined]
