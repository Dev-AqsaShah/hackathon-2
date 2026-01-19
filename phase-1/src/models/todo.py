"""Todo model - represents a single task to be tracked."""

from dataclasses import dataclass


@dataclass
class Todo:
    """Represents a single task to be tracked by the user.

    Attributes:
        id: Unique sequential integer identifier (assigned by system)
        description: User-provided text describing the task
        completed: Whether the task has been marked as done (default: False)
    """
    id: int
    description: str
    completed: bool = False
