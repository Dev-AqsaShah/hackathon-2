# Data Model: Todo AI Chatbot

**Feature**: 001-todo-ai-chatbot
**Date**: 2026-01-31

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────────┐       ┌─────────────────┐
│      User       │       │    Conversation     │       │     Message     │
├─────────────────┤       ├─────────────────────┤       ├─────────────────┤
│ id (PK)         │──┐    │ id (PK)             │──┐    │ id (PK)         │
│ email           │  │    │ user_id (FK)        │  │    │ conversation_id │
│ name            │  │    │ created_at          │  │    │ role            │
│ created_at      │  │    │ updated_at          │  │    │ content         │
└─────────────────┘  │    └─────────────────────┘  │    │ created_at      │
                     │              │               │    └─────────────────┘
                     │              │               │            │
                     │    1:1 (one conversation    │     1:N (many messages
                     │        per user)            │     per conversation)
                     │              │               │            │
                     │              ▼               └────────────┘
                     │    ┌─────────────────┐
                     │    │      Task       │
                     │    ├─────────────────┤
                     └───▶│ id (PK)         │
                          │ user_id (FK)    │
                          │ title           │
                          │ is_completed    │
                          │ created_at      │
                          │ updated_at      │
                          └─────────────────┘
```

## Entities

### User (Managed by Better Auth)

The user entity is managed by Better Auth and exists in the authentication system. Our application references users by their `user_id` from JWT tokens.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email address |
| name | VARCHAR(255) | | User's display name |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Account creation time |

**Note**: This table is created/managed by Better Auth, not by our application.

### Task

A todo item belonging to a user. Accessed exclusively through MCP tools.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| user_id | VARCHAR(255) | FK → User.id, NOT NULL, INDEX | Task owner |
| title | VARCHAR(500) | NOT NULL | Task description |
| is_completed | BOOLEAN | NOT NULL, DEFAULT FALSE | Completion status |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last modification |

**Indexes**:
- `idx_tasks_user_id` on `user_id` (for user isolation queries)
- `idx_tasks_user_completed` on `(user_id, is_completed)` (for filtered lists)

**SQLModel Definition**:
```python
class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: str = Field(index=True, nullable=False)
    title: str = Field(max_length=500, nullable=False)
    is_completed: bool = Field(default=False, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
```

### Conversation

A chat session belonging to a user. One conversation per user (continuing model).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| user_id | VARCHAR(255) | FK → User.id, NOT NULL, UNIQUE, INDEX | Conversation owner |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Session start time |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last activity |

**Indexes**:
- `idx_conversations_user_id` on `user_id` (UNIQUE - one conversation per user)

**SQLModel Definition**:
```python
class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: str = Field(index=True, unique=True, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
```

### Message

A single message in a conversation. Stores both user and assistant messages.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| conversation_id | UUID | FK → Conversation.id, NOT NULL, INDEX | Parent conversation |
| role | VARCHAR(20) | NOT NULL, CHECK IN ('user', 'assistant') | Message author role |
| content | TEXT | NOT NULL | Message text content |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Message timestamp |

**Indexes**:
- `idx_messages_conversation_id` on `conversation_id` (for history retrieval)
- `idx_messages_conversation_created` on `(conversation_id, created_at)` (for ordered history)

**SQLModel Definition**:
```python
class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    conversation_id: uuid.UUID = Field(foreign_key="conversations.id", index=True, nullable=False)
    role: str = Field(max_length=20, nullable=False)  # 'user' or 'assistant'
    content: str = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
```

## Validation Rules

### Task
- `title`: Required, 1-500 characters, trimmed whitespace
- `user_id`: Required, must match authenticated user
- `is_completed`: Defaults to false

### Conversation
- `user_id`: Required, unique per user (one conversation per user)

### Message
- `role`: Must be exactly 'user' or 'assistant'
- `content`: Required, non-empty after trimming
- `conversation_id`: Must reference existing conversation owned by user

## State Transitions

### Task Lifecycle

```
[Created] ──add_task──▶ [Active] ──complete_task──▶ [Completed]
    │                      │                            │
    │                      │◀──complete_task (toggle)───┘
    │                      │
    └───────delete_task────┴────────delete_task─────▶ [Deleted]
```

### Message Flow

```
[User Input] ──store──▶ [DB: Message(role='user')]
                              │
                              ▼
                    [Agent Processing]
                              │
                              ▼
[Agent Response] ──store──▶ [DB: Message(role='assistant')]
```

## Query Patterns

### MCP Tool Queries

**add_task**:
```sql
INSERT INTO tasks (id, user_id, title, is_completed, created_at, updated_at)
VALUES (gen_random_uuid(), :user_id, :title, false, NOW(), NOW())
RETURNING *;
```

**list_tasks** (all):
```sql
SELECT * FROM tasks
WHERE user_id = :user_id
ORDER BY created_at DESC;
```

**list_tasks** (pending only):
```sql
SELECT * FROM tasks
WHERE user_id = :user_id AND is_completed = false
ORDER BY created_at DESC;
```

**complete_task**:
```sql
UPDATE tasks
SET is_completed = true, updated_at = NOW()
WHERE id = :task_id AND user_id = :user_id
RETURNING *;
```

**delete_task**:
```sql
DELETE FROM tasks
WHERE id = :task_id AND user_id = :user_id
RETURNING id;
```

**update_task**:
```sql
UPDATE tasks
SET title = :new_title, updated_at = NOW()
WHERE id = :task_id AND user_id = :user_id
RETURNING *;
```

### Conversation Queries

**Get or create conversation**:
```sql
INSERT INTO conversations (id, user_id, created_at, updated_at)
VALUES (gen_random_uuid(), :user_id, NOW(), NOW())
ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
RETURNING *;
```

**Get message history**:
```sql
SELECT * FROM messages
WHERE conversation_id = :conversation_id
ORDER BY created_at ASC;
```

**Store message**:
```sql
INSERT INTO messages (id, conversation_id, role, content, created_at)
VALUES (gen_random_uuid(), :conversation_id, :role, :content, NOW())
RETURNING *;
```

## Migration Script

```sql
-- 001_create_tables.sql

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_completed ON tasks(user_id, is_completed);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at);
```
