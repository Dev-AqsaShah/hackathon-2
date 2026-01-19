# Quickstart: In-Memory Console Todo Application

**Feature**: 001-console-todo-app
**Date**: 2026-01-18

## Prerequisites

- Python 3.13 or higher
- UV package manager

## Installation

```bash
# Clone or navigate to the project
cd phase-1

# Initialize UV project (if not already done)
uv init

# Sync dependencies (standard library only, so minimal)
uv sync
```

## Running the Application

```bash
uv run python src/main.py
```

## Usage

### Main Menu

When the application starts, you'll see:

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

### Adding a Todo

1. Select option `1`
2. Enter the task description
3. Receive confirmation with assigned ID

```
Enter choice (1-6): 1
Enter description: Buy groceries
Added todo #1
```

### Viewing Todos

Select option `2` to see all todos:

```
Enter choice (1-6): 2

=== Your Todos ===

[ ] 1. Buy groceries
[ ] 2. Call mom
[X] 3. Finish report
```

Legend:
- `[ ]` = Pending
- `[X]` = Completed

### Updating a Todo

1. Select option `3`
2. Enter the todo ID
3. Enter the new description

```
Enter choice (1-6): 3
Enter todo ID: 1
Enter new description: Buy organic groceries
Updated todo #1
```

### Marking Complete

1. Select option `4`
2. Enter the todo ID

```
Enter choice (1-6): 4
Enter todo ID: 1
Completed todo #1
```

### Deleting a Todo

1. Select option `5`
2. Enter the todo ID

```
Enter choice (1-6): 5
Enter todo ID: 1
Deleted todo #1
```

### Exiting

Select option `6` or press `Ctrl+C`:

```
Enter choice (1-6): 6
Goodbye!
```

## Error Handling

The application handles errors gracefully:

| Scenario | Message |
|----------|---------|
| Empty description | "Error: Description cannot be empty" |
| Invalid todo ID | "Error: Todo not found" |
| Non-numeric input | "Error: Please enter a valid number" |
| Invalid menu choice | "Error: Please enter a number between 1 and 6" |

## Example Session

```
=== Todo Application ===

1. Add todo
2. View all todos
3. Update todo
4. Mark todo complete
5. Delete todo
6. Exit

Enter choice (1-6): 1
Enter description: Buy groceries
Added todo #1

Enter choice (1-6): 1
Enter description: Call mom
Added todo #2

Enter choice (1-6): 2

=== Your Todos ===

[ ] 1. Buy groceries
[ ] 2. Call mom

Enter choice (1-6): 4
Enter todo ID: 1
Completed todo #1

Enter choice (1-6): 2

=== Your Todos ===

[X] 1. Buy groceries
[ ] 2. Call mom

Enter choice (1-6): 6
Goodbye!
```

## Project Structure

```
phase-1/
├── src/
│   ├── __init__.py
│   ├── main.py              # Entry point
│   ├── models/
│   │   ├── __init__.py
│   │   └── todo.py          # Todo dataclass
│   ├── services/
│   │   ├── __init__.py
│   │   └── todo_service.py  # Business logic
│   └── cli/
│       ├── __init__.py
│       └── console.py       # User interface
├── specs/
│   └── 001-console-todo-app/
│       ├── spec.md
│       ├── plan.md
│       └── ...
└── pyproject.toml
```

## Limitations (Phase I)

- All data is lost when the application exits
- Single user only
- No file or database persistence
- No web interface

These limitations are by design for Phase I and will be addressed in subsequent phases.
