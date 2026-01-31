# Data Model: Todo Full-Stack Web Application (Phase-2)

**Branch**: `001-todo-fullstack-web`
**Date**: 2026-01-22
**Purpose**: Define database schema, entities, relationships, and validation rules

## Entity Overview

The application has two primary entities:
1. **User** - Application users who own todos
2. **Todo** - Task items belonging to users

## Entity Definitions

### User Entity

Represents an authenticated application user.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Integer | Primary Key, Auto-increment | Unique user identifier |
| `email` | String(255) | Unique, Not Null, Indexed | User's email address (used for login) |
| `hashed_password` | String(255) | Not Null | Bcrypt-hashed password (handled by Better Auth) |
| `created_at` | Timestamp with TZ | Not Null, Default: now() | Account creation timestamp |

**Relationships**:
- One-to-Many with Todo (one user owns many todos)

**Indexes**:
- Primary index on `id`
- Unique index on `email` (for fast login lookups)

**Validation Rules**:
- Email must match valid email format: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
- Email must be unique (database constraint + application validation)
- Password minimum length: 8 characters (enforced by Better Auth)
- Password must be hashed before storage (never store plaintext)

**State Transitions**: None (users don't have status/state in Phase-2)

**SQLModel Definition**:
```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    hashed_password: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

---

### Todo Entity

Represents a task item owned by a user.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Integer | Primary Key, Auto-increment | Unique todo identifier |
| `user_id` | Integer | Foreign Key (users.id), Not Null, Indexed | Owner of this todo |
| `title` | String(1000) | Not Null | Todo task description |
| `is_completed` | Boolean | Not Null, Default: false | Completion status |
| `created_at` | Timestamp with TZ | Not Null, Default: now() | Creation timestamp |
| `updated_at` | Timestamp with TZ | Not Null, Default: now() | Last modification timestamp |

**Relationships**:
- Many-to-One with User (many todos belong to one user)

**Indexes**:
- Primary index on `id`
- Index on `user_id` (for fast user-scoped queries)
- Composite index on `(user_id, created_at DESC)` (optional optimization for list queries)

**Validation Rules**:
- Title must not be empty (min_length=1)
- Title must not exceed 1000 characters (max_length=1000)
- `user_id` must reference existing user (foreign key constraint)
- `is_completed` must be boolean (true/false)

**State Transitions**:
```
[Created] → is_completed = false
    ↓
[User marks complete] → is_completed = true
    ↓
[User marks incomplete] → is_completed = false
    ↓
[User deletes] → (deleted from database)
```

**SQLModel Definition**:
```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class Todo(SQLModel, table=True):
    __tablename__ = "todos"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    title: str = Field(min_length=1, max_length=1000)
    is_completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

---

## Entity Relationships Diagram

```
┌─────────────────────┐
│       User          │
├─────────────────────┤
│ id (PK)             │
│ email (UNIQUE)      │
│ hashed_password     │
│ created_at          │
└──────────┬──────────┘
           │
           │ 1:N
           │ (one user has many todos)
           │
┌──────────▼──────────┐
│       Todo          │
├─────────────────────┤
│ id (PK)             │
│ user_id (FK)        │◄─── Index for fast lookups
│ title               │
│ is_completed        │
│ created_at          │
│ updated_at          │
└─────────────────────┘
```

---

## Database Schema (PostgreSQL DDL)

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on email for fast login lookups
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Todos table
CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(1000) NOT NULL CHECK (LENGTH(title) > 0),
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on user_id for fast user-scoped queries
CREATE INDEX idx_todos_user_id ON todos(user_id);

-- Optional composite index for optimized list queries (ordered by creation)
CREATE INDEX idx_todos_user_created ON todos(user_id, created_at DESC);
```

---

## Data Integrity Rules

### Foreign Key Constraints

1. **Todo → User**: Every todo must belong to an existing user
   - Constraint: `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`
   - Effect: When a user is deleted, all their todos are automatically deleted

### Uniqueness Constraints

1. **User Email**: Each email can only be registered once
   - Constraint: `UNIQUE(email)`
   - Effect: Prevents duplicate accounts

### Not Null Constraints

All fields except optional auto-generated fields (`id`, `created_at`, `updated_at`) must have values:
- `user.email`, `user.hashed_password`
- `todo.user_id`, `todo.title`, `todo.is_completed`

### Check Constraints

1. **Todo Title Length**: Title must not be empty
   - Constraint: `CHECK (LENGTH(title) > 0)`
   - Effect: Prevents empty todos

---

## Query Patterns

### User Isolation Pattern (CRITICAL)

All todo queries MUST include `user_id` filter to enforce isolation:

```python
# ✅ CORRECT - User isolation enforced
todos = await session.exec(
    select(Todo)
    .where(Todo.user_id == current_user.id)
    .order_by(Todo.created_at.desc())
)

# ❌ WRONG - Security vulnerability (returns all users' todos)
todos = await session.exec(select(Todo))
```

### Common Query Operations

**List all user's todos (ordered by creation)**:
```python
todos = await session.exec(
    select(Todo)
    .where(Todo.user_id == current_user.id)
    .order_by(Todo.created_at.desc())
)
```

**Get single todo (with ownership verification)**:
```python
todo = await session.exec(
    select(Todo)
    .where(Todo.id == todo_id)
    .where(Todo.user_id == current_user.id)  # Verify ownership
)
if not todo:
    raise HTTPException(status_code=404, detail="Todo not found")
```

**Create todo**:
```python
new_todo = Todo(
    user_id=current_user.id,
    title=request.title,
    is_completed=False
)
session.add(new_todo)
await session.commit()
await session.refresh(new_todo)
```

**Update todo (with ownership verification)**:
```python
todo = await session.exec(
    select(Todo)
    .where(Todo.id == todo_id)
    .where(Todo.user_id == current_user.id)
)
if not todo:
    raise HTTPException(status_code=404, detail="Todo not found")

todo.title = request.title
todo.updated_at = datetime.utcnow()
await session.commit()
await session.refresh(todo)
```

**Toggle completion (with ownership verification)**:
```python
todo = await session.exec(
    select(Todo)
    .where(Todo.id == todo_id)
    .where(Todo.user_id == current_user.id)
)
if not todo:
    raise HTTPException(status_code=404, detail="Todo not found")

todo.is_completed = not todo.is_completed
todo.updated_at = datetime.utcnow()
await session.commit()
await session.refresh(todo)
```

**Delete todo (with ownership verification)**:
```python
todo = await session.exec(
    select(Todo)
    .where(Todo.id == todo_id)
    .where(Todo.user_id == current_user.id)
)
if not todo:
    raise HTTPException(status_code=404, detail="Todo not found")

await session.delete(todo)
await session.commit()
```

---

## Migration Strategy

### Initial Migration (001_create_tables.py)

```python
"""Create users and todos tables

Revision ID: 001
Create Date: 2026-01-22
"""

def upgrade():
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True),
                  server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index('idx_users_email', 'users', ['email'], unique=True)

    # Create todos table
    op.create_table(
        'todos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=1000), nullable=False),
        sa.Column('is_completed', sa.Boolean(),
                  server_default='false', nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True),
                  server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True),
                  server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'],
                                ondelete='CASCADE')
    )
    op.create_index('idx_todos_user_id', 'todos', ['user_id'])
    op.create_index('idx_todos_user_created', 'todos',
                    ['user_id', sa.text('created_at DESC')])

def downgrade():
    op.drop_table('todos')
    op.drop_table('users')
```

---

## Data Model Validation Checklist

- [x] All entities extracted from feature specification
- [x] Field types match validation requirements
- [x] Relationships clearly defined with cardinality
- [x] Foreign key constraints ensure referential integrity
- [x] Indexes support common query patterns
- [x] User isolation enforced at query level
- [x] Timestamps use TIMESTAMPTZ for timezone awareness
- [x] No sensitive data stored in plaintext
- [x] Validation rules prevent invalid data
- [x] Migration strategy defined for schema deployment
