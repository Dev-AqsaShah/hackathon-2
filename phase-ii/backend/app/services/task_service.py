"""Service layer for task business logic and database operations."""

from datetime import datetime
from typing import List, Optional
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from fastapi import HTTPException, status

from app.models.todo import Task
from app.schemas.task import TaskCreate, TaskUpdate


async def validate_task_ownership(
    session: AsyncSession,
    task_id: int,
    owner_id: int
) -> Task:
    """
    Validate that a task exists and belongs to the specified owner.

    Args:
        session: Database session
        task_id: Task ID to validate
        owner_id: Expected owner user ID

    Returns:
        Task object if validation passes

    Raises:
        HTTPException: 404 if task not found, 403 if ownership mismatch
    """
    # Fetch task from database
    result = await session.execute(
        select(Task).where(Task.id == task_id)
    )
    task = result.scalar_one_or_none()

    # Task not found
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Ownership validation
    if task.owner_id != owner_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access another user's tasks"
        )

    return task


async def get_user_tasks(
    session: AsyncSession,
    owner_id: int
) -> List[Task]:
    """
    Retrieve all tasks belonging to a specific user.

    Args:
        session: Database session
        owner_id: User ID to filter tasks

    Returns:
        List of Task objects (may be empty)
    """
    result = await session.execute(
        select(Task)
        .where(Task.owner_id == owner_id)
        .order_by(Task.created_at.desc())
    )
    tasks = result.scalars().all()
    return list(tasks)


async def create_task(
    session: AsyncSession,
    task_data: TaskCreate,
    owner_id: int
) -> Task:
    """
    Create a new task for the specified user.

    Args:
        session: Database session
        task_data: Task creation data (title, description)
        owner_id: User ID who owns this task

    Returns:
        Newly created Task object with auto-generated ID
    """
    # Create task instance
    task = Task(
        title=task_data.title,
        description=task_data.description,
        completed=False,
        owner_id=owner_id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    # Persist to database
    session.add(task)
    await session.commit()
    await session.refresh(task)

    return task


async def get_task_by_id(
    session: AsyncSession,
    task_id: int,
    owner_id: int
) -> Task:
    """
    Retrieve a single task by ID with ownership validation.

    Args:
        session: Database session
        task_id: Task ID to retrieve
        owner_id: Expected owner user ID

    Returns:
        Task object

    Raises:
        HTTPException: 404 if task not found, 403 if ownership mismatch
    """
    return await validate_task_ownership(session, task_id, owner_id)


async def update_task(
    session: AsyncSession,
    task_id: int,
    task_data: TaskUpdate,
    owner_id: int
) -> Task:
    """
    Update an existing task's title and/or description.

    Args:
        session: Database session
        task_id: Task ID to update
        task_data: Updated data (title and/or description)
        owner_id: Expected owner user ID

    Returns:
        Updated Task object

    Raises:
        HTTPException: 404 if task not found, 403 if ownership mismatch
    """
    # Validate ownership and retrieve task
    task = await validate_task_ownership(session, task_id, owner_id)

    # Apply partial updates
    if task_data.title is not None:
        task.title = task_data.title

    if task_data.description is not None:
        task.description = task_data.description

    # Update timestamp
    task.updated_at = datetime.utcnow()

    # Persist changes
    session.add(task)
    await session.commit()
    await session.refresh(task)

    return task


async def toggle_task_completion(
    session: AsyncSession,
    task_id: int,
    owner_id: int
) -> Task:
    """
    Toggle a task's completion status (true ↔ false).

    Args:
        session: Database session
        task_id: Task ID to toggle
        owner_id: Expected owner user ID

    Returns:
        Updated Task object with toggled completion status

    Raises:
        HTTPException: 404 if task not found, 403 if ownership mismatch
    """
    # Validate ownership and retrieve task
    task = await validate_task_ownership(session, task_id, owner_id)

    # Toggle completion status
    task.completed = not task.completed

    # Update timestamp
    task.updated_at = datetime.utcnow()

    # Persist changes
    session.add(task)
    await session.commit()
    await session.refresh(task)

    return task


async def delete_task(
    session: AsyncSession,
    task_id: int,
    owner_id: int
) -> None:
    """
    Permanently delete a task.

    Args:
        session: Database session
        task_id: Task ID to delete
        owner_id: Expected owner user ID

    Raises:
        HTTPException: 404 if task not found, 403 if ownership mismatch
    """
    # Validate ownership and retrieve task
    task = await validate_task_ownership(session, task_id, owner_id)

    # Delete from database
    await session.delete(task)
    await session.commit()
