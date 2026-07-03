"""Add class_types and trainer_levels lookup tables (branch-scoped, admin-editable)

Revision ID: 005
Revises: 004
Create Date: 2026-07-03
"""
import uuid
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "005"
down_revision: Union[str, None] = "004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

DEFAULT_CLASS_TYPES = ["PT", "YOGA", "PILATES", "CROSSFIT"]
DEFAULT_TRAINER_LEVELS = ["junior", "senior", "master"]


def upgrade() -> None:
    op.create_table(
        "class_types",
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("branch_id", sa.String, sa.ForeignKey("branches.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String, nullable=False),
        sa.Column("sort_order", sa.Integer, nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("is_deleted", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_class_types_branch_id", "class_types", ["branch_id"])

    op.create_table(
        "trainer_levels",
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("branch_id", sa.String, sa.ForeignKey("branches.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String, nullable=False),
        sa.Column("sort_order", sa.Integer, nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("is_deleted", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_trainer_levels_branch_id", "trainer_levels", ["branch_id"])

    # Seed defaults for every branch that already exists, so nothing breaks
    # for branches created before this migration.
    connection = op.get_bind()
    branch_ids = [row[0] for row in connection.execute(sa.text("SELECT id FROM branches")).fetchall()]

    class_types_table = sa.table(
        "class_types",
        sa.column("id", sa.String), sa.column("branch_id", sa.String),
        sa.column("name", sa.String), sa.column("sort_order", sa.Integer),
    )
    trainer_levels_table = sa.table(
        "trainer_levels",
        sa.column("id", sa.String), sa.column("branch_id", sa.String),
        sa.column("name", sa.String), sa.column("sort_order", sa.Integer),
    )

    if branch_ids:
        op.bulk_insert(
            class_types_table,
            [
                {"id": str(uuid.uuid4()), "branch_id": bid, "name": name, "sort_order": i}
                for bid in branch_ids
                for i, name in enumerate(DEFAULT_CLASS_TYPES)
            ],
        )
        op.bulk_insert(
            trainer_levels_table,
            [
                {"id": str(uuid.uuid4()), "branch_id": bid, "name": name, "sort_order": i}
                for bid in branch_ids
                for i, name in enumerate(DEFAULT_TRAINER_LEVELS)
            ],
        )


def downgrade() -> None:
    op.drop_index("ix_trainer_levels_branch_id", table_name="trainer_levels")
    op.drop_table("trainer_levels")
    op.drop_index("ix_class_types_branch_id", table_name="class_types")
    op.drop_table("class_types")
