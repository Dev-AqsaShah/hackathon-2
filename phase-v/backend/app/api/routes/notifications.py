"""Notification endpoints — in-app notification inbox."""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select, func

from app.api.deps import get_current_user, get_db
from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification import NotificationListResponse, NotificationRead

router = APIRouter(prefix="/api/{user_id}/notifications", tags=["Notifications"])


@router.get("", response_model=NotificationListResponse)
def list_notifications(
    user_id: str,
    unread: Optional[bool] = Query(None),
    limit: int = Query(default=20, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(Notification).where(Notification.user_id == user_id)
    if unread is True:
        stmt = stmt.where(Notification.is_read == False)
    total = db.exec(select(func.count()).select_from(stmt.subquery())).one()
    unread_count = db.exec(
        select(func.count()).where(
            Notification.user_id == user_id, Notification.is_read == False
        )
    ).one()
    items = db.exec(
        stmt.order_by(Notification.created_at.desc()).offset(offset).limit(limit)
    ).all()
    return NotificationListResponse(items=items, total=total, unread_count=unread_count)


@router.put("/{notification_id}/read", response_model=NotificationRead)
def mark_read(
    user_id: str,
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notif = db.exec(
        select(Notification).where(
            Notification.id == notification_id, Notification.user_id == user_id
        )
    ).first()
    if not notif:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif


@router.put("/read-all")
def mark_all_read(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    unread = db.exec(
        select(Notification).where(
            Notification.user_id == user_id, Notification.is_read == False
        )
    ).all()
    for n in unread:
        n.is_read = True
    db.commit()
    return {"updated": len(unread)}
