"""Add GIN full-text search index and trigger on tasks table.

Revision ID: 011
Revises: 010
Create Date: 2026-03-02 10:40:00.000000
"""
from typing import Sequence, Union
from alembic import op

revision: str = '011'
down_revision: Union[str, None] = '010'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create trigger function to auto-update search_vector
    op.execute("""
        CREATE OR REPLACE FUNCTION tasks_search_vector_update() RETURNS trigger AS $$
        BEGIN
            NEW.search_vector :=
                setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
                setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)

    # Create trigger on tasks table
    op.execute("""
        CREATE TRIGGER tasks_search_vector_trigger
        BEFORE INSERT OR UPDATE ON tasks
        FOR EACH ROW EXECUTE FUNCTION tasks_search_vector_update();
    """)

    # Backfill search_vector for existing rows
    op.execute("""
        UPDATE tasks SET search_vector =
            setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
            setweight(to_tsvector('english', COALESCE(description, '')), 'B');
    """)

    # GIN index for full-text search
    op.execute("CREATE INDEX idx_tasks_search ON tasks USING GIN(search_vector)")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS idx_tasks_search")
    op.execute("DROP TRIGGER IF EXISTS tasks_search_vector_trigger ON tasks")
    op.execute("DROP FUNCTION IF EXISTS tasks_search_vector_update()")
