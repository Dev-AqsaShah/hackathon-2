# CLI Interface Contract: Console Module

**Feature**: 001-console-todo-app
**Date**: 2026-01-18
**Phase**: 1 - Design

## Overview

This document defines the contract for the Console module, which handles all user interaction (display and input). The Console is responsible for presenting the menu, collecting user input, and displaying results.

## Display Functions

### display_menu

Shows the main menu to the user.

**Signature**:
```python
def display_menu() -> None
```

**Output**:
```
=== Todo Application ===

1. Add todo
2. View all todos
3. Update todo
4. Mark todo complete
5. Delete todo
6. Exit

Enter choice (1-6):
```

---

### display_todos

Shows all todos with their status.

**Signature**:
```python
def display_todos(todos: list[Todo]) -> None
```

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| todos | list[Todo] | List of todos to display |

**Output (with todos)**:
```
=== Your Todos ===

[ ] 1. Buy groceries
[X] 2. Call mom
[ ] 3. Finish report
```

**Output (empty)**:
```
=== Your Todos ===

No todos yet. Add one to get started!
```

---

### display_message

Shows a confirmation, error, or info message.

**Signature**:
```python
def display_message(message: str, is_error: bool = False) -> None
```

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| message | str | The message to display |
| is_error | bool | If True, prefix with "Error: " |

**Output (success)**:
```
Added todo #1
```

**Output (error)**:
```
Error: Description cannot be empty
```

---

## Input Functions

### get_menu_choice

Prompts for and validates menu selection.

**Signature**:
```python
def get_menu_choice() -> int | None
```

**Returns**:
- Valid choice (1-6) as int
- None if input is invalid

**Behavior**:
- Reads from stdin
- Returns None for non-numeric or out-of-range input
- Does not display error (caller handles)

---

### get_description

Prompts for todo description.

**Signature**:
```python
def get_description(prompt: str = "Enter description: ") -> str
```

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| prompt | str | The prompt to display |

**Returns**: Raw user input (whitespace preserved, validation elsewhere)

---

### get_todo_id

Prompts for todo ID.

**Signature**:
```python
def get_todo_id(prompt: str = "Enter todo ID: ") -> int | None
```

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| prompt | str | The prompt to display |

**Returns**:
- Positive integer if valid
- None if non-numeric input

---

## Menu Flow Specification

```
┌─────────────────────────────────────────┐
│            display_menu()               │
│         get_menu_choice()               │
└─────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┬───────────┬───────────┬───────────┐
        ▼           ▼           ▼           ▼           ▼           ▼
    [1: Add]    [2: View]   [3: Update] [4: Complete] [5: Delete]  [6: Exit]
        │           │           │           │           │           │
        ▼           ▼           ▼           ▼           ▼           ▼
  get_description  display   get_todo_id  get_todo_id  get_todo_id  exit
        │          _todos         │           │           │
        ▼                   get_description   │           │
  service.add_todo              │           │           │
        │                       ▼           ▼           ▼
        ▼              service.update  service.complete  service.delete
  display_message                │           │           │
        │                       ▼           ▼           ▼
        └───────────────► display_message ◄──┴───────────┘
                                │
                                ▼
                        [Return to Menu]
```

## Error Display Rules

| Scenario | Display |
|----------|---------|
| Invalid menu choice | "Error: Please enter a number between 1 and 6" |
| Invalid todo ID format | "Error: Please enter a valid number" |
| Service returns error | Display service message with "Error: " prefix |
| Service returns success | Display service message without prefix |

## Keyboard Interrupt Handling

When user presses Ctrl+C:
```
^C

Goodbye!
```

Application exits with code 0 (graceful exit).

## Implementation Location

`src/cli/console.py`
