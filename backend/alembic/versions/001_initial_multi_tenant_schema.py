"""Initial multi-tenant schema: customers, branches, trainers, members, pt_sessions, users

Revision ID: 001
Revises: (none)
Create Date: 2026-03-10
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── customers ─────────────────────────────────────────────────────────────
    op.create_table(
        "customers",
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("name", sa.String, nullable=False),
        sa.Column("email", sa.String, nullable=False, unique=True),
        sa.Column("phone", sa.String, nullable=True),
        sa.Column("address", sa.String, nullable=True),
        sa.Column("address2", sa.String, nullable=True),
        sa.Column("city", sa.String, nullable=True),
        sa.Column("state", sa.String, nullable=True),
        sa.Column("country", sa.String, nullable=True),
        sa.Column("postal_code", sa.String, nullable=True),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("is_deleted", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_customers_email", "customers", ["email"])

    # ── branches ──────────────────────────────────────────────────────────────
    op.create_table(
        "branches",
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("customer_id", sa.String, sa.ForeignKey("customers.id", ondelete="SET NULL"), nullable=True),
        sa.Column("name", sa.String, nullable=False),
        sa.Column("address", sa.String, nullable=False),
        sa.Column("address2", sa.String, nullable=True),
        sa.Column("city", sa.String, nullable=True),
        sa.Column("state", sa.String, nullable=True),
        sa.Column("country", sa.String, nullable=True),
        sa.Column("postal_code", sa.String, nullable=True),
        sa.Column("phone", sa.String, nullable=True),
        sa.Column("description", sa.String, nullable=True),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("is_deleted", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_branches_customer_id", "branches", ["customer_id"])

    # ── trainers ──────────────────────────────────────────────────────────────
    op.create_table(
        "trainers",
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("branch_id", sa.String, sa.ForeignKey("branches.id", ondelete="CASCADE"), nullable=False),
        sa.Column("auth_user_id", sa.String, nullable=True),
        sa.Column("first_name", sa.String, nullable=False),
        sa.Column("last_name", sa.String, nullable=False),
        sa.Column("email", sa.String, nullable=False),
        sa.Column("phone", sa.String, nullable=True),
        sa.Column("trainer_level", sa.String, nullable=False, server_default="junior"),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("is_deleted", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_trainers_branch_id", "trainers", ["branch_id"])
    op.create_index("ix_trainers_email", "trainers", ["email"])
    op.create_index("ix_trainers_auth_user_id", "trainers", ["auth_user_id"])

    # ── members ───────────────────────────────────────────────────────────────
    op.create_table(
        "members",
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("trainer_id", sa.String, sa.ForeignKey("trainers.id", ondelete="SET NULL"), nullable=True),
        sa.Column("branch_id", sa.String, sa.ForeignKey("branches.id", ondelete="CASCADE"), nullable=False),
        sa.Column("first_name", sa.String, nullable=False),
        sa.Column("last_name", sa.String, nullable=False),
        sa.Column("email", sa.String, nullable=False),
        sa.Column("phone", sa.String, nullable=True),
        sa.Column("status", sa.String, nullable=False, server_default="active"),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("is_deleted", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_members_trainer_id", "members", ["trainer_id"])
    op.create_index("ix_members_branch_id", "members", ["branch_id"])
    op.create_index("ix_members_email", "members", ["email"])

    # ── pt_sessions ───────────────────────────────────────────────────────────
    op.create_table(
        "pt_sessions",
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("trainer_id", sa.String, sa.ForeignKey("trainers.id", ondelete="CASCADE"), nullable=False),
        sa.Column("member_id", sa.String, sa.ForeignKey("members.id", ondelete="CASCADE"), nullable=False),
        sa.Column("branch_id", sa.String, sa.ForeignKey("branches.id", ondelete="CASCADE"), nullable=False),
        sa.Column("session_title", sa.String, nullable=False),
        sa.Column("start_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("end_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("status", sa.String, nullable=False, server_default="scheduled"),
        sa.Column("notes", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_pt_sessions_trainer_id", "pt_sessions", ["trainer_id"])
    op.create_index("ix_pt_sessions_member_id", "pt_sessions", ["member_id"])
    op.create_index("ix_pt_sessions_branch_id", "pt_sessions", ["branch_id"])
    op.create_index("ix_pt_sessions_start_time", "pt_sessions", ["start_time"])

    # ── users (auth login accounts) ───────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("email", sa.String, nullable=False, unique=True),
        sa.Column("name", sa.String, nullable=True),
        sa.Column("phone", sa.String, nullable=True),
        sa.Column("role", sa.String, nullable=False, server_default="user"),
        sa.Column("customer_id", sa.String, nullable=True),
        sa.Column("branch_id", sa.String, nullable=True),
        sa.Column("trainer_id", sa.String, nullable=True),
        sa.Column("hashed_password", sa.String, nullable=True),
        sa.Column("provider", sa.String, nullable=False, server_default="local"),
        sa.Column("provider_id", sa.String, nullable=True),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("is_deleted", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_customer_id", "users", ["customer_id"])
    op.create_index("ix_users_branch_id", "users", ["branch_id"])
    op.create_index("ix_users_trainer_id", "users", ["trainer_id"])


def downgrade() -> None:
    op.drop_table("pt_sessions")
    op.drop_table("members")
    op.drop_table("trainers")
    op.drop_table("branches")
    op.drop_table("customers")
    op.drop_table("users")
