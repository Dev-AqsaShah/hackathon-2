# Service Interface Contract: TodoService

**Feature**: 001-console-todo-app
**Date**: 2026-01-18
**Phase**: 1 - Design

## Overview

This document defines the contract for the `TodoService` class, which encapsulates all business logic for todo operations. The CLI layer interacts exclusively through this interface.

## Service Methods

### add_todo

Creates a new todo item with the given description.

**Signature**:
```python
def add_todo(self, description: str) -> tuple[bool, str, int | None]
```

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| description | str | The task description |

**Returns**: `(success, message, id)`
| Field | Type | Description |
|-------|------|-------------|
| success | bool | True if todo was created |
| message | str | Confirmation or error message |
| id | int \| None | Assigned ID if successful, None otherwise |

**Behavior**:
- Validates description is non-empty and non-whitespace
- Assigns next sequential ID
- Creates Todo with `completed=False`
- Adds to store

**Examples**:
| Input | Output |
|-------|--------|
| `"Buy groceries"` | `(True, "Added todo #1", 1)` |
| `""` | `(False, "Description cannot be empty", None)` |
| `"   "` | `(False, "Description cannot be empty", None)` |

---

### get_all_todos

Returns all todos in the store.

**Signature**:
```python
def get_all_todos(self) -> list[Todo]
```

**Parameters**: None

**Returns**: List of all Todo objects (empty list if none exist)

**Behavior**:
- Returns todos in insertion order (by ID)
- Does not filter by completion status

---

### update_todo

Updates the description of an existing todo.

**Signature**:
```python
def update_todo(self, todo_id: int, new_description: str) -> tuple[bool, str]
```

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| todo_id | int | ID of the todo to update |
| new_description | str | New task description |

**Returns**: `(success, message)`
| Field | Type | Description |
|-------|------|-------------|
| success | bool | True if todo was updated |
| message | str | Confirmation or error message |

**Behavior**:
- Validates todo_id exists
- Validates new_description is non-empty
- Updates description, preserves completion status

**Examples**:
| Input | Output |
|-------|--------|
| `(1, "Buy organic groceries")` | `(True, "Updated todo #1")` |
| `(999, "Anything")` | `(False, "Todo not found")` |
| `(1, "")` | `(False, "Description cannot be empty")` |

---

### complete_todo

Marks a todo as completed.

**Signature**:
```python
def complete_todo(self, todo_id: int) -> tuple[bool, str]
```

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| todo_id | int | ID of the todo to complete |

**Returns**: `(success, message)`
| Field | Type | Description |
|-------|------|-------------|
| success | bool | True if status changed |
| message | str | Confirmation or info message |

**Behavior**:
- Validates todo_id exists
- If already completed, returns success with info message
- Sets `completed=True`

**Examples**:
| Input | State Before | Output |
|-------|--------------|--------|
| `1` | completed=False | `(True, "Completed todo #1")` |
| `1` | completed=True | `(True, "Todo #1 is already completed")` |
| `999` | N/A | `(False, "Todo not found")` |

---

### delete_todo

Removes a todo from the store.

**Signature**:
```python
def delete_todo(self, todo_id: int) -> tuple[bool, str]
```

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| todo_id | int | ID of the todo to delete |

**Returns**: `(success, message)`
| Field | Type | Description |
|-------|------|-------------|
| success | bool | True if todo was deleted |
| message | str | Confirmation or error message |

**Behavior**:
- Validates todo_id exists
- Removes todo from store
- ID is not reused

**Examples**:
| Input | Output |
|-------|--------|
| `1` (exists) | `(True, "Deleted todo #1")` |
| `999` | `(False, "Todo not found")` |

---

## Error Messages (Standardized)

| Code | Message | When Used |
|------|---------|-----------|
| E001 | "Description cannot be empty" | add_todo, update_todo with empty/whitespace input |
| E002 | "Todo not found" | Any operation with non-existent ID |
| I001 | "Todo #{id} is already completed" | complete_todo on already-completed item |

## Thread Safety

Not required for Phase I (single-process, single-user, synchronous execution).

## Implementation Location

`src/services/todo_service.py`
