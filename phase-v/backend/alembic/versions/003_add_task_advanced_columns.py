"""Add advanced columns to tasks table: due_date, priority, parent_task_id, search_vector.

Revision ID: 003
Revises: 002
Create Date: 2026-03-02 10:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '003'
down_revision: Union[str, None] = '002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('tasks', sa.Column('due_date', sa.DateTime(timezone=True), nullable=True))
    op.add_column('tasks', sa.Column('priority', sa.String(length=10), nullable=False, server_default='none'))
    op.add_column('tasks', sa.Column('parent_task_id', sa.Integer(), nullable=True))
    op.add_column('tasks', sa.Column(
        'search_vector',
        sa.Column.__class__.__new__(sa.Column.__class__) if False else sa.text('tsvector').type if False else sa.Text(),
        nullable=True
    ))
    # Use raw SQL for tsvector type (not natively supported by SQLAlchemy)
    op.execute("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS search_vector tsvector")
    op.create_check_constraint(
        'ck_tasks_priority',
        'tasks',
        "priority IN ('high', 'medium', 'low', 'none')"
    )
    op.create_index('idx_tasks_user_due', 'tasks', ['owner_id', 'due_date'])
    op.create_index('idx_tasks_user_priority', 'tasks', ['owner_id', 'priority'])
    op.create_index('idx_tasks_user_status', 'tasks', ['owner_id', 'completed'])


def downgrade() -> None:
    op.drop_index('idx_tasks_user_status', table_name='tasks')
    op.drop_index('idx_tasks_user_priority', table_name='tasks')
    op.drop_index('idx_tasks_user_due', table_name='tasks')
    op.drop_constraint('ck_tasks_priority', 'tasks')
    op.drop_column('tasks', 'parent_task_id')
    op.drop_column('tasks', 'priority')
    op.drop_column('tasks', 'due_date')
    op.execute("ALTER TABLE tasks DROP COLUMN IF EXISTS search_vector")
