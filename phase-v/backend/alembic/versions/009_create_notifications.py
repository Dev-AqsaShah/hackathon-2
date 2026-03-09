"""Create notifications table.

Revision ID: 009
Revises: 008
Create Date: 2026-03-02 10:30:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '009'
down_revision: Union[str, None] = '008'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'notifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.String(length=255), nullable=False),
        sa.Column('task_id', sa.Integer(), nullable=True),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('notification_type', sa.String(length=30), nullable=False),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint(
            "notification_type IN ('reminder','overdue','system')",
            name='ck_notification_type'
        ),
    )
    op.create_index(
        'idx_notifications_user_unread',
        'notifications',
        ['user_id', 'is_read', sa.text('created_at DESC')]
    )


def downgrade() -> None:
    op.drop_index('idx_notifications_user_unread', table_name='notifications')
    op.drop_table('notifications')
