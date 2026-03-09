"""Create tags table with unique index per user (case-insensitive).

Revision ID: 006
Revises: 005
Create Date: 2026-03-02 10:15:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '006'
down_revision: Union[str, None] = '005'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'tags',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.String(length=255), nullable=False),
        sa.Column('name', sa.String(length=50), nullable=False),
        sa.Column('color', sa.String(length=7), nullable=False, server_default='#6B7280'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('idx_tags_user_id', 'tags', ['user_id'])
    # Case-insensitive unique index: user cannot have two tags with same lowercase name
    op.execute("CREATE UNIQUE INDEX idx_tags_user_name ON tags(user_id, LOWER(name))")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS idx_tags_user_name")
    op.drop_index('idx_tags_user_id', table_name='tags')
    op.drop_table('tags')
