"""Reminder endpoints — manage scheduled notifications for tasks."""

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.api.deps import get_current_user, get_db
from app.models.reminder import Reminder
from app.models.todo import Task
from app.models.user import User
from app.schemas.reminder import ReminderCreate, ReminderListResponse, ReminderRead

router = APIRouter(prefix="/api/{user_id}/tasks/{task_id}/reminders", tags=["Reminders"])


def _get_task(db: Session, task_id: int, user_id: str) -> Task:
    task = db.exec(
        select(Task).where(Task.id == task_id, Task.owner_id == user_id)
    ).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@router.get("", response_model=ReminderListResponse)
def list_reminders(
    user_id: str,
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _get_task(db, task_id, user_id)
    reminders = db.exec(
        select(Reminder).where(Reminder.task_id == task_id)
    ).all()
    return ReminderListResponse(items=reminders)


@router.post("", response_model=ReminderRead, status_code=status.HTTP_201_CREATED)
def create_reminder(
    user_id: str,
    task_id: int,
    data: ReminderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = _get_task(db, task_id, user_id)
    if not task.due_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task must have a due_date before creating a reminder"
        )
    remind_at = task.due_date - timedelta(minutes=data.offset_minutes)
    from datetime import datetime, timezone
    if remind_at <= datetime.now(timezone.utc).replace(tzinfo=None):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Computed remind_at is in the past"
        )
    reminder = Reminder(
        task_id=task_id,
        user_id=user_id,
        remind_at=remind_at,
        offset_minutes=data.offset_minutes,
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return reminder


@router.delete("/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reminder(
    user_id: str,
    task_id: int,
    reminder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _get_task(db, task_id, user_id)
    reminder = db.exec(
        select(Reminder).where(
            Reminder.id == reminder_id, Reminder.task_id == task_id
        )
    ).first()
    if not reminder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")
    db.delete(reminder)
    db.commit()
