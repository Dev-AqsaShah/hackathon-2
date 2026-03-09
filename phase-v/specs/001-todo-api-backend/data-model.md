# Data Model: Todo Backend API

**Feature**: Todo Full-Stack Web Application — Backend & API
**Branch**: 001-todo-api-backend
**Date**: 2026-01-23

## Overview

This document defines the data model for the Todo Backend API, including entity schemas, relationships, constraints, and state transitions. The model is designed for Neon Serverless PostgreSQL using SQLModel ORM.

## Entity: Task

### Purpose

Represents a todo item owned by a single user. Tasks can be created, updated, marked as complete/incomplete, and deleted by their owner.

### Schema

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Integer | Primary Key, Auto-increment | Unique identifier for the task |
| `title` | String(1000) | NOT NULL, min_length=1 | Task title/summary |
| `description` | String(5000) | NULL allowed | Optional detailed description |
| `completed` | Boolean | NOT NULL, Default: False | Completion status flag |
| `owner_id` | Integer | NOT NULL, Foreign Key → users.id | User who owns this task |
| `created_at` | DateTime (UTC) | NOT NULL, Auto-set | Timestamp when task was created |
| `updated_at` | DateTime (UTC) | NOT NULL, Auto-update | Timestamp of last modification |

### SQLModel Implementation

```python
from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(min_length=1, max_length=1000, nullable=False)
    description: Optional[str] = Field(default=None, max_length=5000)
    completed: bool = Field(default=False, nullable=False)
    owner_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
```

### Database Constraints

**Primary Key**:
```sql
PRIMARY KEY (id)
```

**Foreign Key**:
```sql
FOREIGN KEY (owner_id) REFERENCES users(id)
-- No cascade delete (application-level handling if needed)
```

**Check Constraints**:
```sql
-- Ensure title is not empty string
CHECK (length(trim(title)) > 0)
```

**Indexes**:
```sql
-- Critical for fast user-scoped queries
CREATE INDEX idx_tasks_owner_id ON tasks(owner_id);

-- Optional: Compound index for filtering completed tasks by user
CREATE INDEX idx_tasks_owner_completed ON tasks(owner_id, completed);
```

### Field Validation Rules

**title**:
- ✅ Required (cannot be null)
- ✅ Must not be empty string (whitespace-only rejected)
- ✅ Minimum length: 1 character
- ✅ Maximum length: 1000 characters
- ❌ No special character restrictions (supports UTF-8)

**description**:
- ✅ Optional (null allowed)
- ✅ Maximum length: 5000 characters
- ✅ Can be empty string
- ❌ No special character restrictions (supports UTF-8)

**completed**:
- ✅ Boolean only (true/false)
- ✅ Defaults to false on creation
- ✅ Cannot be null

**owner_id**:
- ✅ Must reference existing user in users table
- ✅ Cannot be null
- ❌ No cascade delete (orphaned tasks handled at application level if needed)

**created_at / updated_at**:
- ✅ Automatically set on insert (created_at)
- ✅ Automatically updated on modification (updated_at)
- ✅ Stored in UTC timezone
- ✅ ISO 8601 format for API responses

### State Transitions

**Task Lifecycle**:

```
┌─────────────┐
│   Create    │
│ (POST)      │
└─────┬───────┘
      │
      ▼
┌─────────────────┐
│  Active Task    │
│ completed=false │
└────┬────────┬───┘
     │        │
     │        │ PATCH /complete
     │        │
     │        ▼
     │   ┌─────────────────┐
     │   │ Completed Task  │
     │   │ completed=true  │
     │   └────┬────────────┘
     │        │
     │        │ PATCH /complete
     │        │
     │        ▼
     │   (back to Active)
     │
     ▼
┌─────────────┐
│   Delete    │
│ (DELETE)    │
└─────────────┘
```

**Allowed Operations by State**:

| Operation | Active (completed=false) | Completed (completed=true) |
|-----------|-------------------------|---------------------------|
| GET (retrieve) | ✅ Allowed | ✅ Allowed |
| PUT (update title/desc) | ✅ Allowed | ✅ Allowed |
| PATCH (toggle complete) | ✅ Sets to true | ✅ Sets to false |
| DELETE | ✅ Allowed | ✅ Allowed |

**Note**: No state prevents any operation. Tasks can be updated or deleted regardless of completion status.

### Relationships

**Task → User** (Many-to-One):
- Each Task belongs to exactly one User (via `owner_id`)
- A User can have zero or many Tasks
- Relationship is not enforced at database level (no FK cascade)
- Application layer ensures user isolation

**Cardinality**:
```
User (1) ──── has ───▶ (0..*) Task
```

**No Other Relationships**: Tasks are independent entities. No relationships to categories, tags, or other tasks.

## Entity: User (Referenced)

**Note**: User entity is managed by Better Auth, not by this API. Included here for relationship clarity only.

### Schema (Reference Only)

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer | Primary Key (referenced by Task.owner_id) |
| `email` | String | User email (unique) |
| `hashed_password` | String | Password hash (managed by Better Auth) |
| `created_at` | DateTime | User registration timestamp |

**This API does NOT**:
- ❌ Create users (handled by Better Auth)
- ❌ Modify users (handled by Better Auth)
- ❌ Delete users (handled by Better Auth)
- ❌ Query user table directly

**This API DOES**:
- ✅ Reference user.id via JWT token
- ✅ Validate tasks belong to authenticated user
- ✅ Use owner_id foreign key to users.id

## Database Migration

### Migration 002: Rename todos to tasks

**File**: `backend/alembic/versions/002_rename_todos_to_tasks.py`

```python
"""Rename todos table to tasks for spec alignment

Revision ID: 002
Revises: 001
Create Date: 2026-01-23
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None

def upgrade():
    # Rename table
    op.rename_table('todos', 'tasks')

    # Ensure schema matches spec (in case 001 had different constraints)
    op.alter_column('tasks', 'title',
               existing_type=sa.VARCHAR(),
               type_=sa.VARCHAR(length=1000),
               existing_nullable=False)

    op.alter_column('tasks', 'description',
               existing_type=sa.VARCHAR(),
               type_=sa.VARCHAR(length=5000),
               existing_nullable=True)

    # Rename column if needed (todos.user_id → tasks.owner_id)
    # Uncomment if migration 001 used user_id instead of owner_id
    # op.alter_column('tasks', 'user_id', new_column_name='owner_id')

    # Ensure index exists on owner_id
    op.create_index('idx_tasks_owner_id', 'tasks', ['owner_id'], unique=False, if_not_exists=True)

    # Ensure check constraint exists
    op.create_check_constraint(
        'check_title_not_empty',
        'tasks',
        'length(trim(title)) > 0'
    )

def downgrade():
    op.drop_index('idx_tasks_owner_id', table_name='tasks')
    op.drop_constraint('check_title_not_empty', 'tasks', type_='check')
    op.rename_table('tasks', 'todos')
```

### Verification Queries

**After migration, verify schema**:

```sql
-- Check table exists
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'tasks';

-- Check columns
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_name = 'tasks'
ORDER BY ordinal_position;

-- Check constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'tasks';

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'tasks';

-- Check foreign key
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'tasks';
```

## Pydantic Schemas (API Layer)

### TaskCreate (Request Body for POST)

```python
from pydantic import Field
from sqlmodel import SQLModel

class TaskCreate(SQLModel):
    """Schema for creating a new task"""
    title: str = Field(min_length=1, max_length=1000, description="Task title")
    description: Optional[str] = Field(default=None, max_length=5000, description="Optional task description")

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Complete project documentation",
                "description": "Write comprehensive API documentation for the todo backend"
            }
        }
```

### TaskUpdate (Request Body for PUT)

```python
class TaskUpdate(SQLModel):
    """Schema for updating an existing task"""
    title: Optional[str] = Field(default=None, min_length=1, max_length=1000, description="Updated task title")
    description: Optional[str] = Field(default=None, max_length=5000, description="Updated task description")

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Complete project documentation (updated)",
                "description": "Write and review comprehensive API documentation"
            }
        }
```

### TaskResponse (Response Body)

```python
from datetime import datetime

class TaskResponse(SQLModel):
    """Schema for task responses (GET, POST, PUT, PATCH)"""
    id: int = Field(description="Unique task identifier")
    title: str = Field(description="Task title")
    description: Optional[str] = Field(description="Task description (nullable)")
    completed: bool = Field(description="Completion status")
    owner_id: int = Field(description="ID of user who owns this task")
    created_at: datetime = Field(description="Task creation timestamp (UTC)")
    updated_at: datetime = Field(description="Last update timestamp (UTC)")

    class Config:
        json_schema_extra = {
            "example": {
                "id": 42,
                "title": "Complete project documentation",
                "description": "Write comprehensive API documentation for the todo backend",
                "completed": false,
                "owner_id": 1,
                "created_at": "2026-01-23T10:30:00Z",
                "updated_at": "2026-01-23T10:30:00Z"
            }
        }
```

## Data Validation Examples

### Valid Task Creation

```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread, coffee"
}
```

**Result**: ✅ Task created successfully

---

### Invalid: Empty Title

```json
{
  "title": "",
  "description": "This will fail"
}
```

**Result**: ❌ 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "ensure this value has at least 1 characters",
      "type": "value_error.any_str.min_length"
    }
  ]
}
```

---

### Invalid: Title Too Long

```json
{
  "title": "A".repeat(1001),
  "description": "This title exceeds 1000 characters"
}
```

**Result**: ❌ 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "ensure this value has at most 1000 characters",
      "type": "value_error.any_str.max_length"
    }
  ]
}
```

---

### Valid: No Description

```json
{
  "title": "Quick task"
}
```

**Result**: ✅ Task created with description=null

---

### Valid: Description as Empty String

```json
{
  "title": "Task with empty description",
  "description": ""
}
```

**Result**: ✅ Task created with description="" (empty string, not null)

## Query Patterns

### Get All Tasks for User

```python
async def get_user_tasks(session: AsyncSession, user_id: int) -> List[Task]:
    result = await session.execute(
        select(Task)
        .where(Task.owner_id == user_id)
        .order_by(Task.created_at.desc())
    )
    return result.scalars().all()
```

**SQL Generated**:
```sql
SELECT * FROM tasks
WHERE owner_id = $1
ORDER BY created_at DESC;
```

**Index Used**: `idx_tasks_owner_id` (fast lookup)

---

### Get Single Task with Ownership Validation

```python
async def get_task_by_id(session: AsyncSession, task_id: int, user_id: int) -> Task:
    result = await session.execute(
        select(Task)
        .where(Task.id == task_id, Task.owner_id == user_id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task
```

**SQL Generated**:
```sql
SELECT * FROM tasks
WHERE id = $1 AND owner_id = $2;
```

**Security**: Ensures user can only access their own tasks

---

### Update Task

```python
async def update_task(session: AsyncSession, task_id: int, data: TaskUpdate, user_id: int) -> Task:
    task = await get_task_by_id(session, task_id, user_id)  # Validates ownership

    if data.title is not None:
        task.title = data.title
    if data.description is not None:
        task.description = data.description

    task.updated_at = datetime.utcnow()
    session.add(task)
    await session.commit()
    await session.refresh(task)
    return task
```

**SQL Generated**:
```sql
UPDATE tasks
SET title = $1, description = $2, updated_at = $3
WHERE id = $4;
```

---

### Toggle Completion Status

```python
async def toggle_task_completion(session: AsyncSession, task_id: int, user_id: int) -> Task:
    task = await get_task_by_id(session, task_id, user_id)  # Validates ownership

    task.completed = not task.completed
    task.updated_at = datetime.utcnow()

    session.add(task)
    await session.commit()
    await session.refresh(task)
    return task
```

**SQL Generated**:
```sql
UPDATE tasks
SET completed = NOT completed, updated_at = $1
WHERE id = $2;
```

---

### Delete Task

```python
async def delete_task(session: AsyncSession, task_id: int, user_id: int) -> None:
    task = await get_task_by_id(session, task_id, user_id)  # Validates ownership

    await session.delete(task)
    await session.commit()
```

**SQL Generated**:
```sql
DELETE FROM tasks WHERE id = $1;
```

## Performance Considerations

### Index Strategy

**Primary Index** (`idx_tasks_owner_id`):
- Used by: All user-scoped queries
- Benefit: O(log n) lookup instead of O(n) table scan
- Critical for: Multi-user scalability

**Optional Compound Index** (`idx_tasks_owner_completed`):
- Used by: Filtered queries (e.g., "show only incomplete tasks")
- Benefit: Faster filtering on completed status
- Trade-off: Increases storage, slower writes

**Recommendation**: Start with owner_id index only. Add compound index if filtering queries become common.

### Query Optimization

**Always Filter by owner_id**:
```python
# ✅ GOOD: Scoped to user
select(Task).where(Task.owner_id == user_id)

# ❌ BAD: Full table scan
select(Task).where(Task.id == task_id)  # Missing owner_id check
```

**Use Limits for Large Result Sets** (future enhancement):
```python
# Pagination pattern (not in v1)
select(Task).where(Task.owner_id == user_id).limit(50).offset(page * 50)
```

## Data Integrity

### Referential Integrity

**Foreign Key Enforcement**:
- Database enforces owner_id references users.id
- Cannot create task with non-existent user_id
- Prevents orphaned tasks (unless user deleted)

**No Cascade Delete**:
- Deleting a user does NOT automatically delete their tasks
- Application-level handling required if user deletion is supported
- Specification does not require user deletion, so this is acceptable

### Consistency Guarantees

**Timestamps**:
- created_at: Set once, never modified
- updated_at: Auto-updated on every modification
- Both stored in UTC, converted to ISO 8601 for API responses

**State Consistency**:
- completed field is boolean-only (no null, no other values)
- Validation prevents invalid state transitions

## Summary

**Entity**: Task (primary), User (referenced)
**Relationships**: Task → User (many-to-one)
**Constraints**: Foreign key, indexes, check constraints
**Validation**: Pydantic schemas enforce spec requirements
**Security**: All queries scoped to authenticated user
**Performance**: Indexed on owner_id for fast lookups

Data model aligns with specification requirements (FR-001 through FR-025) and supports all user stories (P1-P3).
