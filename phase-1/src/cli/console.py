"""Console module - handles all user interaction (display and input)."""

from src.models.todo import Todo


def display_menu() -> None:
    """Show the main menu to the user."""
    print("\n=== Todo Application ===\n")
    print("1. Add todo")
    print("2. View all todos")
    print("3. Update todo")
    print("4. Mark todo complete")
    print("5. Delete todo")
    print("6. Exit")
    print()


def display_message(message: str, is_error: bool = False) -> None:
    """Show a confirmation, error, or info message.

    Args:
        message: The message to display
        is_error: If True, prefix with "Error: "
    """
    if is_error:
        print(f"Error: {message}")
    else:
        print(message)


def display_todos(todos: list[Todo]) -> None:
    """Show all todos with their status.

    Args:
        todos: List of todos to display
    """
    print("\n=== Your Todos ===\n")
    if not todos:
        print("No todos yet. Add one to get started!")
    else:
        for todo in todos:
            status = "X" if todo.completed else " "
            print(f"[{status}] {todo.id}. {todo.description}")
    print()


def get_menu_choice() -> int | None:
    """Prompt for and validate menu selection.

    Returns:
        Valid choice (1-6) as int, or None if input is invalid
    """
    try:
        choice = input("Enter choice (1-6): ")
        value = int(choice)
        if 1 <= value <= 6:
            return value
        return None
    except ValueError:
        return None


def get_description(prompt: str = "Enter description: ") -> str:
    """Prompt for todo description.

    Args:
        prompt: The prompt to display

    Returns:
        Raw user input
    """
    return input(prompt)


def get_todo_id(prompt: str = "Enter todo ID: ") -> int | None:
    """Prompt for todo ID.

    Args:
        prompt: The prompt to display

    Returns:
        Positive integer if valid, None if non-numeric input
    """
    try:
        value = int(input(prompt))
        if value > 0:
            return value
        return None
    except ValueError:
        return None
