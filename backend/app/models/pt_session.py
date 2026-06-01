"""
PtSession = PT / Class Schedule entry.

Assigned to one Trainer and one Member at a Branch.
status: scheduled | completed | cancelled | no_show
"""
import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.auth_database import AuthBase


class PtSession(AuthBase):
    __tablename__ = "pt_sessions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    trainer_id: Mapped[str] = mapped_column(
        String, ForeignKey("trainers.id", ondelete="CASCADE"), nullable=False, index=True
    )
    member_id: Mapped[str] = mapped_column(
        String, ForeignKey("members.id", ondelete="CASCADE"), nullable=False, index=True
    )
    branch_id: Mapped[str] = mapped_column(
        String, ForeignKey("branches.id", ondelete="CASCADE"), nullable=False, index=True
    )

    session_title: Mapped[str] = mapped_column(String, nullable=False)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    # status: scheduled | completed | cancelled | no_show
    status: Mapped[str] = mapped_column(String, default="scheduled", nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    trainer: Mapped["Trainer"] = relationship(back_populates="sessions")  # type: ignore[name-defined]
    member: Mapped["Member"] = relationship(back_populates="sessions")  # type: ignore[name-defined]
