"""Create recurrence_rules table.

Revision ID: 004
Revises: 003
Create Date: 2026-03-02 10:05:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '004'
down_revision: Union[str, None] = '003'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'recurrence_rules',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('frequency', sa.String(length=10), nullable=False),
        sa.Column('interval', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('days_of_week', sa.Text(), nullable=True),  # JSON array stored as text
        sa.Column('end_type', sa.String(length=10), nullable=False, server_default='never'),
        sa.Column('end_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('end_count', sa.Integer(), nullable=True),
        sa.Column('occurrences_generated', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint("frequency IN ('daily','weekly','monthly','custom')", name='ck_recurrence_frequency'),
        sa.CheckConstraint("end_type IN ('never','on_date','after_n')", name='ck_recurrence_end_type'),
    )


def downgrade() -> None:
    op.drop_table('recurrence_rules')
