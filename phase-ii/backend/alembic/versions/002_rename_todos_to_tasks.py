"""Rename todos table to tasks and update schema.

Revision ID: 002
Revises: 001
Create Date: 2026-01-23 14:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '002'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Rename todos table to tasks and update schema to match specification.

    Changes:
    - Rename table: todos → tasks
    - Rename column: user_id → owner_id
    - Rename column: is_completed → completed
    - Add column: description (optional, max 5000 chars)
    - Update indexes and constraints to match new names
    """

    # Step 1: Rename table
    op.rename_table('todos', 'tasks')

    # Step 2: Rename columns
    op.alter_column('tasks', 'user_id', new_column_name='owner_id')
    op.alter_column('tasks', 'is_completed', new_column_name='completed')

    # Step 3: Add description column
    op.add_column(
        'tasks',
        sa.Column('description', sa.String(length=5000), nullable=True)
    )

    # Step 4: Drop old indexes (with old table/column names)
    op.drop_index('idx_todos_user_id', table_name='tasks')
    op.drop_index('idx_todos_user_created', table_name='tasks')

    # Step 5: Create new indexes with updated names
    op.create_index('idx_tasks_owner_id', 'tasks', ['owner_id'])
    op.create_index(
        'idx_tasks_owner_created',
        'tasks',
        ['owner_id', sa.text('created_at DESC')]
    )

    # Step 6: Drop old check constraint
    op.drop_constraint('check_title_not_empty', 'tasks', type_='check')

    # Step 7: Create new check constraint with updated table name
    op.create_check_constraint(
        'check_tasks_title_not_empty',
        'tasks',
        sa.text('LENGTH(title) > 0')
    )


def downgrade() -> None:
    """
    Revert tasks table back to todos with original schema.

    This reverses all changes made in upgrade().
    """

    # Step 1: Drop new check constraint
    op.drop_constraint('check_tasks_title_not_empty', 'tasks', type_='check')

    # Step 2: Create old check constraint
    op.create_check_constraint(
        'check_title_not_empty',
        'tasks',
        sa.text('LENGTH(title) > 0')
    )

    # Step 3: Drop new indexes
    op.drop_index('idx_tasks_owner_created', table_name='tasks')
    op.drop_index('idx_tasks_owner_id', table_name='tasks')

    # Step 4: Create old indexes
    op.create_index('idx_todos_user_created', 'tasks', ['owner_id', sa.text('created_at DESC')])
    op.create_index('idx_todos_user_id', 'tasks', ['owner_id'])

    # Step 5: Drop description column
    op.drop_column('tasks', 'description')

    # Step 6: Rename columns back
    op.alter_column('tasks', 'completed', new_column_name='is_completed')
    op.alter_column('tasks', 'owner_id', new_column_name='user_id')

    # Step 7: Rename table back
    op.rename_table('tasks', 'todos')
