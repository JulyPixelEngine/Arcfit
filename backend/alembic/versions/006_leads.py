"""Add leads table (public studio-signup interest form submissions)

Revision ID: 006
Revises: 005
Create Date: 2026-07-03
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "006"
down_revision: Union[str, None] = "005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "leads",
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("studio_name", sa.String, nullable=False),
        sa.Column("owner_name", sa.String, nullable=False),
        sa.Column("email", sa.String, nullable=False),
        sa.Column("phone", sa.String, nullable=True),
        sa.Column("message", sa.Text, nullable=True),
        sa.Column("status", sa.String, nullable=False, server_default="new"),
        sa.Column("is_deleted", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("leads")
