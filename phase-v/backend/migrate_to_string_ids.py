#!/usr/bin/env python3
"""
Migrate database to use string user IDs for Better Auth compatibility.
"""

import os
from dotenv import load_dotenv
import psycopg2

# Load environment variables
load_dotenv()

# Get database URL and convert from asyncpg format
db_url = os.getenv("DATABASE_URL", "")
db_url = db_url.replace("postgresql+asyncpg://", "postgresql://")

print("Connecting to database...")

MIGRATION_SQL = """
-- Drop ALL foreign key constraints on tasks table
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT constraint_name
              FROM information_schema.table_constraints
              WHERE table_name = 'tasks'
              AND constraint_type = 'FOREIGN KEY')
    LOOP
        EXECUTE 'ALTER TABLE tasks DROP CONSTRAINT ' || r.constraint_name;
    END LOOP;
END$$;

-- Change owner_id column type from INT to VARCHAR
ALTER TABLE tasks ALTER COLUMN owner_id TYPE VARCHAR(255) USING owner_id::VARCHAR(255);

-- Drop the old users table (replaced by Better Auth's "user" table)
DROP TABLE IF EXISTS users CASCADE;

-- Create index on owner_id for performance
DROP INDEX IF EXISTS ix_tasks_owner_id;
CREATE INDEX ix_tasks_owner_id ON tasks(owner_id);
"""

def run_migration():
    """Run the database migration."""
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cur = conn.cursor()

        print("Running migration to string user IDs...")

        # Execute migration
        cur.execute(MIGRATION_SQL)

        print("Migration completed successfully!")

        # Verify the change
        cur.execute("""
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'tasks' AND column_name = 'owner_id'
        """)
        result = cur.fetchone()
        if result:
            print(f"tasks.owner_id is now: {result[1]}")

        cur.close()
        conn.close()

    except Exception as e:
        print(f"Migration error: {e}")
        raise

if __name__ == "__main__":
    run_migration()
