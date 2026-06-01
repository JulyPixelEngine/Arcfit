"""
Member = Gym User / Customer's client.

Assigned to one Trainer and one Branch.
status: active | inactive | suspended
"""
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.auth_database import AuthBase


class Member(AuthBase):
    __tablename__ = "members"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    trainer_id: Mapped[str | None] = mapped_column(
        String, ForeignKey("trainers.id", ondelete="SET NULL"), nullable=True, index=True
    )
    branch_id: Mapped[str] = mapped_column(
        String, ForeignKey("branches.id", ondelete="CASCADE"), nullable=False, index=True
    )

    first_name: Mapped[str] = mapped_column(String, nullable=False)
    last_name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False, index=True)
    phone: Mapped[str | None] = mapped_column(String, nullable=True)
    # status: active | inactive | suspended
    status: Mapped[str] = mapped_column(String, default="active", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    trainer: Mapped["Trainer"] = relationship(back_populates="members")  # type: ignore[name-defined]
    branch: Mapped["Branch"] = relationship(back_populates="members")  # type: ignore[name-defined]
    sessions: Mapped[list["PtSession"]] = relationship(back_populates="member", lazy="select")  # type: ignore[name-defined]
