"""SearchService — builds dynamic SQLModel queries for task search/filter/sort."""

from datetime import datetime, timezone
from typing import List, Optional

from sqlmodel import Session, select, func, and_
from sqlalchemy import text

from app.models.todo import Task
from app.models.tag import Tag, TaskTag


def build_task_query(
    db: Session,
    user_id: str,
    q: Optional[str] = None,
    status: Optional[str] = None,      # open | completed | overdue
    priority: Optional[str] = None,
    tags: Optional[List[str]] = None,
    due_before: Optional[datetime] = None,
    due_after: Optional[datetime] = None,
    sort: str = "created_at",
    order: str = "desc",
    limit: int = 50,
    offset: int = 0,
):
    """
    Construct and execute a filtered/sorted task query.
    Returns (items, total).
    """
    stmt = select(Task).where(Task.owner_id == user_id)

    # Full-text search
    if q:
        words = " & ".join(q.strip().split())
        stmt = stmt.where(
            text("search_vector @@ to_tsquery('english', :q)").bindparams(q=words)
        )

    # Status filter
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    if status == "completed":
        stmt = stmt.where(Task.completed == True)
    elif status == "open":
        stmt = stmt.where(Task.completed == False, Task.due_date == None)
    elif status == "overdue":
        stmt = stmt.where(Task.completed == False, Task.due_date != None, Task.due_date < now)

    # Priority filter
    if priority:
        stmt = stmt.where(Task.priority == priority)

    # Due date range
    if due_before:
        stmt = stmt.where(Task.due_date <= due_before)
    if due_after:
        stmt = stmt.where(Task.due_date >= due_after)

    # Tag filter — task must have ALL specified tags
    if tags:
        for tag_name in tags:
            tag = db.exec(
                select(Tag).where(
                    Tag.user_id == user_id,
                    func.lower(Tag.name) == tag_name.lower()
                )
            ).first()
            if tag:
                stmt = stmt.where(
                    Task.id.in_(
                        select(TaskTag.task_id).where(TaskTag.tag_id == tag.id)
                    )
                )

    # Count total before pagination
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = db.exec(count_stmt).one()

    # Sort
    sort_map = {
        "due_date": Task.due_date,
        "priority": text(
            "CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END"
        ),
        "created_at": Task.created_at,
        "title": Task.title,
    }
    sort_col = sort_map.get(sort, Task.created_at)
    if order == "asc":
        stmt = stmt.order_by(sort_col.asc() if hasattr(sort_col, 'asc') else sort_col)
    else:
        stmt = stmt.order_by(sort_col.desc() if hasattr(sort_col, 'desc') else sort_col)

    stmt = stmt.offset(offset).limit(limit)
    items = db.exec(stmt).all()
    return items, total
