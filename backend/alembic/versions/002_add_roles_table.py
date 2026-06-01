"""Add roles table with default seed data

Revision ID: 002
Revises: 001
Create Date: 2026-03-10
"""
from typing import Sequence, Union
import uuid

import sqlalchemy as sa
from alembic import op

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

DEFAULT_ROLES = [
    {"name": "super-admin", "description": "Platform owner — full access to everything"},
    {"name": "admin",       "description": "Customer-level admin — manages branches and staff"},
    {"name": "trainer",     "description": "Branch trainer — manages own members and sessions"},
    {"name": "user",        "description": "Basic account — default role on signup"},
]


def upgrade() -> None:
    op.create_table(
        "roles",
        sa.Column("id",          sa.String,              primary_key=True),
        sa.Column("name",        sa.String,              nullable=False, unique=True),
        sa.Column("description", sa.Text,                nullable=True),
        sa.Column("is_active",   sa.Boolean,             nullable=False, server_default="true"),
        sa.Column("created_at",  sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at",  sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_roles_name", "roles", ["name"], unique=True)

    # Seed default roles
    roles_table = sa.table(
        "roles",
        sa.column("id",          sa.String),
        sa.column("name",        sa.String),
        sa.column("description", sa.Text),
    )
    op.bulk_insert(
        roles_table,
        [{"id": str(uuid.uuid4()), "name": r["name"], "description": r["description"]}
         for r in DEFAULT_ROLES],
    )


def downgrade() -> None:
    op.drop_index("ix_roles_name", table_name="roles")
    op.drop_table("roles")
