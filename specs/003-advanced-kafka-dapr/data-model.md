# Data Model: Advanced Todo Platform

**Branch**: `003-advanced-kafka-dapr` | **Phase**: Phase 1 | **Date**: 2026-03-02

---

## Entity Relationship Overview

```
User ──────────────────────────────────────────────────────────┐
  │                                                             │
  ├──< Task >──────── RecurrenceRule (one-to-one)              │
  │     │                                                       │
  │     ├──< Reminder (one-to-many)                            │
  │     │                                                       │
  │     ├──< TaskTag >──< Tag (many-to-many, per user)         │
  │     │                                                       │
  │     └──< Notification (via task_id FK, nullable)           │
  │                                                             │
  ├──< Tag (one user owns many tags)                           │
  │                                                             │
  ├──< Notification (one user receives many)                   │
  │                                                             │
  └──< Conversation ──< Message                                │
                                                               │
DomainEvent (audit log, no FK to User — stores user_id in payload)
```

---

## Tables

### Existing: `users`
No changes. Used as reference via `user_id` (string/UUID) in all new tables.

---

### Modified: `tasks`

New columns added via Alembic migration (all nullable, backward-compatible):

| Column | Type | Default | Description |
|---|---|---|---|
| `due_date` | `TIMESTAMPTZ` | NULL | Task deadline with timezone |
| `priority` | `VARCHAR(10)` | `'none'` | Enum: `high`, `medium`, `low`, `none` |
| `recurrence_rule_id` | `UUID` FK | NULL | Points to `recurrence_rules.id` |
| `parent_task_id` | `UUID` FK (self-ref) | NULL | Parent of a recurring instance |
| `search_vector` | `TSVECTOR` | auto | Full-text search index (title + description) |

**Updated indexes**:
```sql
CREATE INDEX idx_tasks_user_due     ON tasks(user_id, due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_tasks_user_priority ON tasks(user_id, priority);
CREATE INDEX idx_tasks_user_status  ON tasks(user_id, completed);
CREATE INDEX idx_tasks_search       ON tasks USING GIN(search_vector);
```

**Trigger for search_vector**:
```sql
CREATE OR REPLACE FUNCTION tasks_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_search_vector_trigger
BEFORE INSERT OR UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION tasks_search_vector_update();
```

---

### New: `recurrence_rules`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, default gen | Primary key |
| `frequency` | `VARCHAR(10)` | NOT NULL | `daily`, `weekly`, `monthly`, `custom` |
| `interval` | `INTEGER` | NOT NULL, default 1 | Every N periods |
| `days_of_week` | `INTEGER[]` | NULL | 0=Mon…6=Sun (for weekly) |
| `end_type` | `VARCHAR(10)` | NOT NULL, default `never` | `never`, `on_date`, `after_n` |
| `end_date` | `TIMESTAMPTZ` | NULL | When `end_type = on_date` |
| `end_count` | `INTEGER` | NULL | When `end_type = after_n` |
| `occurrences_generated` | `INTEGER` | default 0 | Counter for `after_n` end type |
| `created_at` | `TIMESTAMPTZ` | default NOW() | Creation timestamp |

**SQLModel class** (Python):
```python
class RecurrenceRule(SQLModel, table=True):
    __tablename__ = "recurrence_rules"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    frequency: str  # daily | weekly | monthly | custom
    interval: int = 1
    days_of_week: Optional[List[int]] = Field(default=None, sa_column=Column(ARRAY(Integer)))
    end_type: str = "never"  # never | on_date | after_n
    end_date: Optional[datetime] = None
    end_count: Optional[int] = None
    occurrences_generated: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

---

### New: `tags`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK | Primary key |
| `user_id` | `VARCHAR` | NOT NULL, FK users | Tag owner |
| `name` | `VARCHAR(50)` | NOT NULL | Tag label (stored lowercase) |
| `color` | `VARCHAR(7)` | default `#6B7280` | Hex color code |
| `created_at` | `TIMESTAMPTZ` | default NOW() | Creation timestamp |

**Unique constraint**: `UNIQUE (user_id, LOWER(name))` — enforced via partial unique index.

```sql
CREATE UNIQUE INDEX idx_tags_user_name ON tags(user_id, LOWER(name));
```

---

### New: `task_tags` (junction)

| Column | Type | Constraints | Description |
|---|---|---|---|
| `task_id` | `UUID` | PK part, FK tasks(id) CASCADE DELETE | Task reference |
| `tag_id` | `UUID` | PK part, FK tags(id) CASCADE DELETE | Tag reference |

**Composite primary key**: `(task_id, tag_id)`

---

### New: `reminders`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK | Primary key |
| `task_id` | `UUID` | FK tasks(id) CASCADE DELETE | Associated task |
| `user_id` | `VARCHAR` | NOT NULL | Reminder recipient |
| `remind_at` | `TIMESTAMPTZ` | NOT NULL | Absolute scheduled time |
| `offset_minutes` | `INTEGER` | NULL | Relative offset from due_date (for display) |
| `delivered` | `BOOLEAN` | default FALSE | Delivery status |
| `created_at` | `TIMESTAMPTZ` | default NOW() | Creation timestamp |

**Index**: `CREATE INDEX idx_reminders_pending ON reminders(remind_at) WHERE delivered = FALSE;`
This index is used by the scheduler service to efficiently poll undelivered reminders.

---

### New: `notifications`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK | Primary key |
| `user_id` | `VARCHAR` | NOT NULL, indexed | Notification recipient |
| `task_id` | `UUID` | FK tasks(id) SET NULL, nullable | Related task (if any) |
| `content` | `TEXT` | NOT NULL | Human-readable notification message |
| `notification_type` | `VARCHAR(30)` | NOT NULL | `reminder`, `overdue`, `system` |
| `is_read` | `BOOLEAN` | default FALSE | Read status |
| `created_at` | `TIMESTAMPTZ` | default NOW() | Creation timestamp |

**Index**: `CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);`

---

### New: `domain_events`

Append-only audit/outbox table. Never updated or deleted in normal operation.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK | Primary key |
| `event_type` | `VARCHAR(50)` | NOT NULL | `task.created`, `task.completed`, `task.deleted`, `task.updated`, `task.overdue`, `reminder.due` |
| `payload` | `JSONB` | NOT NULL | Full event data including user_id, task_id |
| `correlation_id` | `UUID` | NULL | For tracing related events |
| `producer_service` | `VARCHAR(50)` | NOT NULL | `backend`, `scheduler-service` |
| `published_at` | `TIMESTAMPTZ` | default NOW() | Event publication timestamp |
| `processed` | `BOOLEAN` | default FALSE | Whether Dapr/Kafka has picked this up |

**Index**: `CREATE INDEX idx_domain_events_type_time ON domain_events(event_type, published_at DESC);`

---

## State Transitions

### Task Status Flow

```
OPEN (completed=false, due_date null or future)
  │
  ├── [due_date passes + not completed] → OVERDUE (computed, no DB column)
  │         ↓ scheduler detects
  │         └── publishes task.overdue event
  │
  └── [user marks complete] → COMPLETED (completed=true)
              ↓
              publishes task.completed event
              ↓ (if recurring)
              generates next instance → OPEN
```

### Reminder Delivery Flow

```
Reminder created (delivered=false)
  ↓
Scheduler polls reminders WHERE remind_at <= NOW() AND delivered=false
  ↓
Publishes reminder.due event via Dapr
  ↓
Marks reminder.delivered = true
  ↓
Notification Service consumes event
  ↓
Inserts notification record
  ↓
Frontend polls GET /notifications → user sees notification
```

### Recurring Task Completion Flow

```
User completes Task (instance)
  ↓
Backend marks task.completed = true
  ↓
Checks recurrence_rule:
  - end_type = never → always generate
  - end_type = on_date → check if today < end_date
  - end_type = after_n → check occurrences_generated < end_count
  ↓ (if should generate)
Increments recurrence_rule.occurrences_generated
Calculates next_due_date from rule + current due_date
Creates new Task (completed=false, parent_task_id = original, due_date = next_due_date)
Publishes task.created event
```

---

## Priority Enum Values

| Value | DB String | Display | Sort Weight |
|---|---|---|---|
| High | `high` | 🔴 High | 1 |
| Medium | `medium` | 🟡 Medium | 2 |
| Low | `low` | 🟢 Low | 3 |
| None | `none` | — | 4 |

---

## Search Vector Strategy

Full-text search uses PostgreSQL `tsvector` with weighted terms:
- **Weight A** (highest): Task `title`
- **Weight B**: Task `description`

Query construction in FastAPI:
```python
# Search query construction
search_filter = func.to_tsquery('english', ' & '.join(q.split()))
tasks = session.exec(
    select(Task)
    .where(Task.owner_id == user_id)
    .where(Task.search_vector.op('@@')(search_filter))
    .order_by(func.ts_rank(Task.search_vector, search_filter).desc())
)
```

---

## Alembic Migration Order

```
migration_001_add_task_columns.py
   └── ALTER TABLE tasks ADD COLUMN due_date, priority, recurrence_rule_id, parent_task_id, search_vector

migration_002_create_recurrence_rules.py
   └── CREATE TABLE recurrence_rules

migration_003_add_recurrence_fk.py
   └── ALTER TABLE tasks ADD FOREIGN KEY (recurrence_rule_id) → recurrence_rules(id)
   └── ALTER TABLE tasks ADD FOREIGN KEY (parent_task_id) → tasks(id)

migration_004_create_tags.py
   └── CREATE TABLE tags
   └── CREATE UNIQUE INDEX idx_tags_user_name

migration_005_create_task_tags.py
   └── CREATE TABLE task_tags

migration_006_create_reminders.py
   └── CREATE TABLE reminders
   └── CREATE INDEX idx_reminders_pending

migration_007_create_notifications.py
   └── CREATE TABLE notifications
   └── CREATE INDEX idx_notifications_user_unread

migration_008_create_domain_events.py
   └── CREATE TABLE domain_events

migration_009_search_indexes.py
   └── CREATE INDEX idx_tasks_search (GIN)
   └── CREATE TRIGGER tasks_search_vector_trigger
   └── CREATE INDEX idx_tasks_user_due, idx_tasks_user_priority, idx_tasks_user_status
```
