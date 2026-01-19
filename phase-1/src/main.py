"""Main entry point - Application controller for the Todo CLI."""

from src.services.todo_service import TodoService
from src.cli.console import (
    display_menu,
    display_message,
    display_todos,
    get_menu_choice,
    get_description,
    get_todo_id,
)


def main() -> None:
    """Run the Todo application main loop."""
    service = TodoService()

    print("Welcome to the Todo Application!")

    while True:
        try:
            display_menu()
            choice = get_menu_choice()

            if choice is None:
                display_message("Please enter a number between 1 and 6", is_error=True)
                continue

            if choice == 1:
                # Add todo
                description = get_description()
                success, message, _ = service.add_todo(description)
                display_message(message, is_error=not success)

            elif choice == 2:
                # View all todos
                todos = service.get_all_todos()
                display_todos(todos)

            elif choice == 3:
                # Update todo
                todo_id = get_todo_id()
                if todo_id is None:
                    display_message("Please enter a valid number", is_error=True)
                    continue
                new_description = get_description("Enter new description: ")
                success, message = service.update_todo(todo_id, new_description)
                display_message(message, is_error=not success)

            elif choice == 4:
                # Mark todo complete
                todo_id = get_todo_id()
                if todo_id is None:
                    display_message("Please enter a valid number", is_error=True)
                    continue
                success, message = service.complete_todo(todo_id)
                display_message(message, is_error=not success)

            elif choice == 5:
                # Delete todo
                todo_id = get_todo_id()
                if todo_id is None:
                    display_message("Please enter a valid number", is_error=True)
                    continue
                success, message = service.delete_todo(todo_id)
                display_message(message, is_error=not success)

            elif choice == 6:
                # Exit
                print("Goodbye!")
                break

        except KeyboardInterrupt:
            print("\n\nGoodbye!")
            break


if __name__ == "__main__":
    main()
