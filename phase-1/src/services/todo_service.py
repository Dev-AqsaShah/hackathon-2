"""TodoService - core business logic for todo operations."""

from src.models.todo import Todo


class TodoService:
    """Encapsulates all business logic for todo operations.

    The service maintains an in-memory list of todos and a counter
    for generating sequential IDs.
    """

    def __init__(self) -> None:
        """Initialize the service with empty todos list and ID counter."""
        self._todos: list[Todo] = []
        self._next_id: int = 1

    def add_todo(self, description: str) -> tuple[bool, str, int | None]:
        """Create a new todo item with the given description.

        Args:
            description: The task description

        Returns:
            Tuple of (success, message, id):
            - success: True if todo was created
            - message: Confirmation or error message
            - id: Assigned ID if successful, None otherwise
        """
        if not description or not description.strip():
            return (False, "Description cannot be empty", None)

        todo = Todo(id=self._next_id, description=description.strip())
        self._todos.append(todo)
        todo_id = self._next_id
        self._next_id += 1
        return (True, f"Added todo #{todo_id}", todo_id)

    def get_all_todos(self) -> list[Todo]:
        """Return all todos in the store.

        Returns:
            List of all Todo objects (empty list if none exist)
        """
        return self._todos.copy()

    def update_todo(self, todo_id: int, new_description: str) -> tuple[bool, str]:
        """Update the description of an existing todo.

        Args:
            todo_id: ID of the todo to update
            new_description: New task description

        Returns:
            Tuple of (success, message):
            - success: True if todo was updated
            - message: Confirmation or error message
        """
        if not new_description or not new_description.strip():
            return (False, "Description cannot be empty")

        for todo in self._todos:
            if todo.id == todo_id:
                todo.description = new_description.strip()
                return (True, f"Updated todo #{todo_id}")

        return (False, "Todo not found")

    def complete_todo(self, todo_id: int) -> tuple[bool, str]:
        """Mark a todo as completed.

        Args:
            todo_id: ID of the todo to complete

        Returns:
            Tuple of (success, message):
            - success: True if operation succeeded
            - message: Confirmation or info message
        """
        for todo in self._todos:
            if todo.id == todo_id:
                if todo.completed:
                    return (True, f"Todo #{todo_id} is already completed")
                todo.completed = True
                return (True, f"Completed todo #{todo_id}")

        return (False, "Todo not found")

    def delete_todo(self, todo_id: int) -> tuple[bool, str]:
        """Remove a todo from the store.

        Args:
            todo_id: ID of the todo to delete

        Returns:
            Tuple of (success, message):
            - success: True if todo was deleted
            - message: Confirmation or error message
        """
        for i, todo in enumerate(self._todos):
            if todo.id == todo_id:
                self._todos.pop(i)
                return (True, f"Deleted todo #{todo_id}")

        return (False, "Todo not found")
