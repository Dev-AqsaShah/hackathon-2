"""Tag management endpoints."""

from typing import List
from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.tag import TagCreate, TagListResponse, TagRead, TagUpdate
from app.services import tag_service

router = APIRouter(prefix="/api/{user_id}/tags", tags=["Tags"])


def _verify_user(user_id: str, current_user: User) -> None:
    if current_user.id != user_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Forbidden")


@router.get("", response_model=TagListResponse)
def list_tags(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _verify_user(user_id, current_user)
    tags = tag_service.list_tags(db, user_id)
    return TagListResponse(items=[TagRead(**t) for t in tags], total=len(tags))


@router.post("", response_model=TagRead, status_code=status.HTTP_201_CREATED)
def create_tag(
    user_id: str,
    data: TagCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _verify_user(user_id, current_user)
    tag = tag_service.create_tag(db, user_id, data)
    return TagRead(id=tag.id, name=tag.name, color=tag.color,
                   task_count=0, created_at=tag.created_at)


@router.put("/{tag_id}", response_model=TagRead)
def update_tag(
    user_id: str,
    tag_id: int,
    data: TagUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _verify_user(user_id, current_user)
    tag = tag_service.update_tag(db, tag_id, user_id, data)
    return TagRead(id=tag.id, name=tag.name, color=tag.color,
                   task_count=0, created_at=tag.created_at)


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tag(
    user_id: str,
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _verify_user(user_id, current_user)
    tag_service.delete_tag(db, tag_id, user_id)
