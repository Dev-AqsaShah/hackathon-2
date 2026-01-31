"""Task API endpoints for CRUD operations."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import CurrentUser, DatabaseSession
from app.models.todo import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.services import task_service

router = APIRouter()


@router.get(
    "/api/{user_id}/tasks",
    response_model=List[TaskResponse],
    status_code=status.HTTP_200_OK,
    summary="List all tasks for authenticated user",
    description="Retrieves all tasks belonging to the authenticated user, ordered by creation date (newest first).",
    responses={
        200: {"description": "List of tasks (may be empty)"},
        401: {"description": "Missing, invalid, or expired JWT token"},
        403: {"description": "Valid JWT but attempting to access another user's resources"}
    }
)
async def list_tasks(
    user_id: str,
    current_user: CurrentUser,
    session: DatabaseSession
) -> List[TaskResponse]:
    """
    List all tasks for the authenticated user.

    **Authorization**: JWT token required. The user_id in the URL must match the authenticated user's ID.

    Returns tasks ordered by creation date (newest first).
    """
    # Validate that URL user_id matches authenticated user
    if user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access another user's tasks"
        )

    # Retrieve all tasks for this user
    tasks = await task_service.get_user_tasks(session, user_id)

    # Convert to response models
    return [TaskResponse.model_validate(task) for task in tasks]


@router.post(
    "/api/{user_id}/tasks",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create new task",
    description="Creates a new task for the authenticated user.",
    responses={
        201: {"description": "Task created successfully"},
        401: {"description": "Missing, invalid, or expired JWT token"},
        403: {"description": "Valid JWT but attempting to create task for another user"},
        422: {"description": "Request payload validation failed"}
    }
)
async def create_task(
    user_id: str,
    task_data: TaskCreate,
    current_user: CurrentUser,
    session: DatabaseSession
) -> TaskResponse:
    """
    Create a new task.

    **Authorization**: JWT token required. The user_id in the URL must match the authenticated user's ID.

    Request body must include:
    - title (required, 1-1000 characters)
    - description (optional, max 5000 characters)

    Returns the newly created task with auto-generated ID and timestamps.
    """
    # Validate that URL user_id matches authenticated user
    if user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access another user's tasks"
        )

    # Create task (pass email for auto-creating user record if needed)
    task = await task_service.create_task(session, task_data, user_id, current_user.email)

    return TaskResponse.model_validate(task)


@router.get(
    "/api/{user_id}/tasks/{id}",
    response_model=TaskResponse,
    status_code=status.HTTP_200_OK,
    summary="Get single task by ID",
    description="Retrieves a specific task by its ID.",
    responses={
        200: {"description": "Task details"},
        401: {"description": "Missing, invalid, or expired JWT token"},
        403: {"description": "Valid JWT but attempting to access another user's task"},
        404: {"description": "Task not found"}
    }
)
async def get_task(
    user_id: str,
    id: int,
    current_user: CurrentUser,
    session: DatabaseSession
) -> TaskResponse:
    """
    Get a single task by ID.

    **Authorization**: JWT token required. The user_id in the URL must match the authenticated user's ID.

    Returns the task if it exists and belongs to the authenticated user.
    """
    # Validate that URL user_id matches authenticated user
    if user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access another user's tasks"
        )

    # Retrieve task with ownership validation
    task = await task_service.get_task_by_id(session, id, user_id)

    return TaskResponse.model_validate(task)


@router.put(
    "/api/{user_id}/tasks/{id}",
    response_model=TaskResponse,
    status_code=status.HTTP_200_OK,
    summary="Update task title and/or description",
    description="Updates an existing task's title and/or description.",
    responses={
        200: {"description": "Task updated successfully"},
        401: {"description": "Missing, invalid, or expired JWT token"},
        403: {"description": "Valid JWT but attempting to update another user's task"},
        404: {"description": "Task not found"},
        422: {"description": "Request payload validation failed"}
    }
)
async def update_task(
    user_id: str,
    id: int,
    task_data: TaskUpdate,
    current_user: CurrentUser,
    session: DatabaseSession
) -> TaskResponse:
    """
    Update an existing task.

    **Authorization**: JWT token required. The user_id in the URL must match the authenticated user's ID.

    Request body supports partial updates:
    - title (optional, 1-1000 characters)
    - description (optional, max 5000 characters)

    Returns the updated task with new updated_at timestamp.
    """
    # Validate that URL user_id matches authenticated user
    if user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access another user's tasks"
        )

    # Update task with ownership validation
    task = await task_service.update_task(session, id, task_data, user_id)

    return TaskResponse.model_validate(task)


@router.delete(
    "/api/{user_id}/tasks/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete task",
    description="Permanently deletes a task.",
    responses={
        204: {"description": "Task deleted successfully (no content)"},
        401: {"description": "Missing, invalid, or expired JWT token"},
        403: {"description": "Valid JWT but attempting to delete another user's task"},
        404: {"description": "Task not found"}
    }
)
async def delete_task(
    user_id: str,
    id: int,
    current_user: CurrentUser,
    session: DatabaseSession
) -> None:
    """
    Delete a task permanently.

    **Authorization**: JWT token required. The user_id in the URL must match the authenticated user's ID.

    Returns HTTP 204 No Content on success (empty response body).
    """
    # Validate that URL user_id matches authenticated user
    if user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access another user's tasks"
        )

    # Delete task with ownership validation
    await task_service.delete_task(session, id, user_id)


@router.patch(
    "/api/{user_id}/tasks/{id}/complete",
    response_model=TaskResponse,
    status_code=status.HTTP_200_OK,
    summary="Toggle task completion status",
    description="Toggles the task's completed status. If currently false, sets to true. If currently true, sets to false.",
    responses={
        200: {"description": "Task completion status toggled"},
        401: {"description": "Missing, invalid, or expired JWT token"},
        403: {"description": "Valid JWT but attempting to toggle another user's task"},
        404: {"description": "Task not found"}
    }
)
async def toggle_task_completion(
    user_id: str,
    id: int,
    current_user: CurrentUser,
    session: DatabaseSession
) -> TaskResponse:
    """
    Toggle task completion status.

    **Authorization**: JWT token required. The user_id in the URL must match the authenticated user's ID.

    No request body required. Always toggles the current state:
    - If completed=false, sets to true
    - If completed=true, sets to false

    Returns the updated task with new updated_at timestamp.
    """
    # Validate that URL user_id matches authenticated user
    if user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access another user's tasks"
        )

    # Toggle completion with ownership validation
    task = await task_service.toggle_task_completion(session, id, user_id)

    return TaskResponse.model_validate(task)
