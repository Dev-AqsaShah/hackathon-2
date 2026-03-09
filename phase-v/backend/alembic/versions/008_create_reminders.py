"""Create reminders table with partial index on pending reminders.

Revision ID: 008
Revises: 007
Create Date: 2026-03-02 10:25:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '008'
down_revision: Union[str, None] = '007'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'reminders',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('task_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.String(length=255), nullable=False),
        sa.Column('remind_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('offset_minutes', sa.Integer(), nullable=True),
        sa.Column('delivered', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    # Partial index: only index undelivered reminders for efficient scheduler polling
    op.execute(
        "CREATE INDEX idx_reminders_pending ON reminders(remind_at) WHERE delivered = FALSE"
    )
    op.create_index('idx_reminders_user', 'reminders', ['user_id'])


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS idx_reminders_pending")
    op.drop_index('idx_reminders_user', table_name='reminders')
    op.drop_table('reminders')
