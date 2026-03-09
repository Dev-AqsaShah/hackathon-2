"""TagService — CRUD operations for user tags."""

from typing import List, Optional
from fastapi import HTTPException, status
from sqlmodel import Session, select, func

from app.models.tag import Tag, TaskTag
from app.schemas.tag import TagCreate, TagUpdate


def create_tag(db: Session, user_id: str, data: TagCreate) -> Tag:
    # Check for duplicate (case-insensitive)
    existing = db.exec(
        select(Tag).where(
            Tag.user_id == user_id,
            func.lower(Tag.name) == data.name.lower()
        )
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail=f"Tag '{data.name}' already exists")
    tag = Tag(user_id=user_id, name=data.name.lower(), color=data.color)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


def list_tags(db: Session, user_id: str) -> List[dict]:
    tags = db.exec(select(Tag).where(Tag.user_id == user_id)).all()
    result = []
    for tag in tags:
        count = db.exec(
            select(func.count()).where(TaskTag.tag_id == tag.id)
        ).one()
        result.append({**tag.model_dump(), "task_count": count})
    return result


def get_tag(db: Session, tag_id: int, user_id: str) -> Tag:
    tag = db.exec(select(Tag).where(Tag.id == tag_id, Tag.user_id == user_id)).first()
    if not tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found")
    return tag


def update_tag(db: Session, tag_id: int, user_id: str, data: TagUpdate) -> Tag:
    tag = get_tag(db, tag_id, user_id)
    if data.name is not None:
        tag.name = data.name.lower()
    if data.color is not None:
        tag.color = data.color
    db.commit()
    db.refresh(tag)
    return tag


def delete_tag(db: Session, tag_id: int, user_id: str) -> None:
    tag = get_tag(db, tag_id, user_id)
    db.delete(tag)
    db.commit()


def sync_task_tags(db: Session, task_id: int, tag_ids: List[int], user_id: str) -> None:
    """Replace task's tags with the given list of tag_ids. Validates ownership."""
    # Validate all tags belong to user
    for tag_id in tag_ids:
        get_tag(db, tag_id, user_id)
    # Delete existing task_tags
    existing = db.exec(select(TaskTag).where(TaskTag.task_id == task_id)).all()
    for tt in existing:
        db.delete(tt)
    # Insert new ones
    for tag_id in tag_ids:
        db.add(TaskTag(task_id=task_id, tag_id=tag_id))
    db.commit()
