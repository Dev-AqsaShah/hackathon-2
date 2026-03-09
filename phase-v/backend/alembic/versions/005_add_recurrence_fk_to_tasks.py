"""Add recurrence_rule_id FK and parent_task_id self-ref FK to tasks.

Revision ID: 005
Revises: 004
Create Date: 2026-03-02 10:10:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '005'
down_revision: Union[str, None] = '004'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('tasks', sa.Column('recurrence_rule_id', sa.Integer(), nullable=True))
    op.create_foreign_key(
        'fk_tasks_recurrence_rule',
        'tasks', 'recurrence_rules',
        ['recurrence_rule_id'], ['id'],
        ondelete='SET NULL'
    )
    op.create_foreign_key(
        'fk_tasks_parent_task',
        'tasks', 'tasks',
        ['parent_task_id'], ['id'],
        ondelete='SET NULL'
    )


def downgrade() -> None:
    op.drop_constraint('fk_tasks_parent_task', 'tasks', type_='foreignkey')
    op.drop_constraint('fk_tasks_recurrence_rule', 'tasks', type_='foreignkey')
    op.drop_column('tasks', 'recurrence_rule_id')
