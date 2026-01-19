# Data Model: In-Memory Console Todo Application

**Feature**: 001-console-todo-app
**Date**: 2026-01-18
**Phase**: 1 - Design

## Entities

### Todo

Represents a single task to be tracked by the user.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | int | Yes | Auto-assigned | Unique sequential identifier (1, 2, 3...) |
| description | str | Yes | - | User-provided text describing the task |
| completed | bool | Yes | False | Whether the task has been marked as done |

**Constraints**:
- `id` MUST be a positive integer
- `id` MUST be unique within the session
- `id` values are never reused (even after deletion)
- `description` MUST NOT be empty or whitespace-only
- `completed` starts as `False` and can only transition to `True`

**State Transitions**:
```
[Created] --> completed=False
     |
     v
[Completed] --> completed=True (terminal state for status)
```

Note: A completed todo can still be updated (description changed) or deleted.

## Collections

### TodoStore (In-Memory)

The application maintains a single collection of todos in memory.

| Property | Value |
|----------|-------|
| Type | List of Todo objects |
| Persistence | Session only (lost on exit) |
| Ordering | By insertion order (reflects ID sequence) |
| Capacity | Unbounded (limited by available memory) |

**Invariants**:
- All todos in the store have unique IDs
- IDs are assigned in strictly increasing order
- The next ID is always `max(existing_ids) + 1` or `1` if empty

## ID Generation

| Property | Value |
|----------|-------|
| Starting value | 1 |
| Increment | 1 |
| Reuse policy | Never reused within session |
| Implementation | Counter variable, incremented on each add |

**Example Sequence**:
```
Add "Task A" → ID 1
Add "Task B" → ID 2
Delete ID 1
Add "Task C" → ID 3 (not 1)
```

## Data Validation Rules

### On Create (Add Todo)

| Field | Rule | Error Message |
|-------|------|---------------|
| description | Must not be empty | "Description cannot be empty" |
| description | Must not be whitespace-only | "Description cannot be empty" |

### On Update

| Field | Rule | Error Message |
|-------|------|---------------|
| id | Must exist in store | "Todo not found" |
| description | Must not be empty | "Description cannot be empty" |
| description | Must not be whitespace-only | "Description cannot be empty" |

### On Complete

| Field | Rule | Error Message |
|-------|------|---------------|
| id | Must exist in store | "Todo not found" |
| completed | Should be False | "Todo is already completed" (info, not error) |

### On Delete

| Field | Rule | Error Message |
|-------|------|---------------|
| id | Must exist in store | "Todo not found" |

## Display Format

### Single Todo Display

```
[{status}] {id}. {description}
```

Where:
- `{status}` = `X` if completed, space if pending
- `{id}` = integer ID
- `{description}` = task text

**Examples**:
```
[ ] 1. Buy groceries
[X] 2. Call mom
[ ] 3. Finish report
```

### Empty State Display

```
No todos yet. Add one to get started!
```

## Python Implementation Sketch

```python
from dataclasses import dataclass

@dataclass
class Todo:
    id: int
    description: str
    completed: bool = False
```

This is the target data structure. Actual implementation will be in `src/models/todo.py`.
