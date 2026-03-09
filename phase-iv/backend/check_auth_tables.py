#!/usr/bin/env python3
"""
Check Better Auth tables and data in the database.
"""

import os
from dotenv import load_dotenv
import psycopg2

# Load environment variables
load_dotenv()

# Get database URL and convert from asyncpg format
db_url = os.getenv("DATABASE_URL", "")
db_url = db_url.replace("postgresql+asyncpg://", "postgresql://")

print(f"Connecting to database...")

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()

    print("\n=== Users ===")
    cur.execute('SELECT id, name, email, "createdAt" FROM "user" LIMIT 5')
    users = cur.fetchall()
    for user in users:
        print(f"  {user}")

    print("\n=== Sessions ===")
    cur.execute('SELECT id, "userId", token, "expiresAt" FROM "session" LIMIT 5')
    sessions = cur.fetchall()
    for session in sessions:
        print(f"  {session}")

    print("\n=== Accounts ===")
    cur.execute('SELECT id, "userId", "providerId" FROM "account" LIMIT 5')
    accounts = cur.fetchall()
    for account in accounts:
        print(f"  {account}")

    cur.close()
    conn.close()

except Exception as e:
    print(f"Error: {e}")
