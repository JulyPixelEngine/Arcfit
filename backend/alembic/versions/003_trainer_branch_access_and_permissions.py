"""Add trainer_branch_access join table and class_permissions column on trainers

Revision ID: 003
Revises: 002
Create Date: 2026-07-02
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # A trainer's `branch_id` column remains their primary/home branch.
    # This table lets them additionally work at other branches.
    op.create_table(
        "trainer_branch_access",
        sa.Column("trainer_id", sa.String, sa.ForeignKey("trainers.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("branch_id", sa.String, sa.ForeignKey("branches.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_trainer_branch_access_branch_id", "trainer_branch_access", ["branch_id"])

    # Which class types this trainer is authorized to teach — e.g. ["PT", "YOGA"]
    op.add_column("trainers", sa.Column("class_permissions", sa.JSON, nullable=False, server_default="[]"))


def downgrade() -> None:
    op.drop_column("trainers", "class_permissions")
    op.drop_index("ix_trainer_branch_access_branch_id", table_name="trainer_branch_access")
    op.drop_table("trainer_branch_access")
