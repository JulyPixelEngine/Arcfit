"""Add products table (sellable catalog items: memberships, personal lessons, lockers, equipment)

Revision ID: 004
Revises: 003
Create Date: 2026-07-02
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "products",
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("branch_id", sa.String, sa.ForeignKey("branches.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String, nullable=False),
        # product_type: MEMBERSHIP | PERSONAL_LESSON | LOCKER | EQUIPMENT
        sa.Column("product_type", sa.String, nullable=False),
        # pass_type: PERIOD | COUNT
        sa.Column("pass_type", sa.String, nullable=False),
        # category: PT | YOGA | PILATES | CROSSFIT (same taxonomy as Trainer.class_permissions)
        sa.Column("category", sa.String, nullable=True),
        sa.Column("duration_months", sa.Integer, nullable=True),
        sa.Column("service_extra_days", sa.Integer, nullable=False, server_default="0"),
        sa.Column("session_count", sa.Integer, nullable=True),
        sa.Column("pause_allowed_days", sa.Integer, nullable=False, server_default="0"),
        sa.Column("pause_min_days", sa.Integer, nullable=False, server_default="0"),
        sa.Column("price", sa.Integer, nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("is_deleted", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_products_branch_id", "products", ["branch_id"])
    op.create_index("ix_products_product_type", "products", ["product_type"])


def downgrade() -> None:
    op.drop_index("ix_products_product_type", table_name="products")
    op.drop_index("ix_products_branch_id", table_name="products")
    op.drop_table("products")
