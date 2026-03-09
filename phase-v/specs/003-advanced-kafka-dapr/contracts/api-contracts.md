# API Contracts: Advanced Todo Platform (Phase V)

**Branch**: `003-advanced-kafka-dapr` | **Date**: 2026-03-02

---

## Base URL

```
http://localhost:8000
```

All endpoints require `Authorization: Bearer <jwt_token>` header unless noted.

---

## Extended Task Endpoints

### Create Task (Extended)

```
POST /api/{user_id}/tasks
```

**Request Body**:
```json
{
  "title": "Daily standup",
  "description": "Team sync at 9am",
  "priority": "high",
  "due_date": "2026-03-03T09:00:00Z",
  "recurrence": {
    "frequency": "daily",
    "interval": 1,
    "days_of_week": null,
    "end_type": "never",
    "end_date": null,
    "end_count": null
  },
  "tag_ids": ["uuid-1", "uuid-2"],
  "reminders": [
    { "offset_minutes": 60 },
    { "offset_minutes": 1440 }
  ]
}
```

**Response `201`**:
```json
{
  "id": "task-uuid",
  "title": "Daily standup",
  "description": "Team sync at 9am",
  "completed": false,
  "priority": "high",
  "due_date": "2026-03-03T09:00:00Z",
  "is_overdue": false,
  "recurrence_rule": {
    "id": "rule-uuid",
    "frequency": "daily",
    "interval": 1,
    "end_type": "never"
  },
  "tags": [
    { "id": "uuid-1", "name": "work", "color": "#3B82F6" }
  ],
  "reminders": [
    { "id": "reminder-uuid-1", "remind_at": "2026-03-03T08:00:00Z", "delivered": false }
  ],
  "owner_id": "user-uuid",
  "created_at": "2026-03-02T10:00:00Z",
  "updated_at": "2026-03-02T10:00:00Z"
}
```

**Errors**:
- `400` — invalid priority value, invalid recurrence frequency, tag_id not owned by user
- `401` — invalid/expired JWT
- `403` — user_id in path does not match token subject

---

### List Tasks (Search / Filter / Sort)

```
GET /api/{user_id}/tasks
```

**Query Parameters**:

| Param | Type | Description | Example |
|---|---|---|---|
| `q` | string | Full-text search | `q=standup` |
| `status` | string | `open`, `completed`, `overdue` | `status=open` |
| `priority` | string | `high`, `medium`, `low`, `none` | `priority=high` |
| `tag` | string (multi) | Tag name (repeatable) | `tag=work&tag=urgent` |
| `due_before` | ISO datetime | Due date upper bound | `due_before=2026-03-10T00:00:00Z` |
| `due_after` | ISO datetime | Due date lower bound | `due_after=2026-03-01T00:00:00Z` |
| `recurring` | boolean | Filter recurring only | `recurring=true` |
| `sort` | string | `due_date`, `priority`, `created_at`, `title` | `sort=due_date` |
| `order` | string | `asc`, `desc` | `order=asc` |
| `limit` | int | Page size (default 50, max 200) | `limit=20` |
| `offset` | int | Pagination offset | `offset=40` |

**Response `200`**:
```json
{
  "items": [
    {
      "id": "task-uuid",
      "title": "Daily standup",
      "completed": false,
      "priority": "high",
      "due_date": "2026-03-03T09:00:00Z",
      "is_overdue": false,
      "tags": [{ "id": "uuid-1", "name": "work", "color": "#3B82F6" }],
      "has_recurrence": true,
      "reminder_count": 2
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

---

### Update Task (Extended)

```
PATCH /api/{user_id}/tasks/{task_id}
```

**Request Body** (all fields optional):
```json
{
  "title": "Updated title",
  "description": "Updated desc",
  "completed": false,
  "priority": "medium",
  "due_date": "2026-03-05T10:00:00Z",
  "tag_ids": ["uuid-1"],
  "recurrence": {
    "frequency": "weekly",
    "interval": 1,
    "days_of_week": [0, 2, 4],
    "end_type": "after_n",
    "end_count": 10
  }
}
```

**Response `200`**: Full task object (same as Create response).

---

## Tags Endpoints

### List Tags

```
GET /api/{user_id}/tags
```

**Response `200`**:
```json
{
  "items": [
    {
      "id": "tag-uuid",
      "name": "work",
      "color": "#3B82F6",
      "task_count": 12,
      "created_at": "2026-03-01T08:00:00Z"
    }
  ],
  "total": 5
}
```

---

### Create Tag

```
POST /api/{user_id}/tags
```

**Request Body**:
```json
{
  "name": "personal",
  "color": "#10B981"
}
```

**Response `201`**:
```json
{
  "id": "tag-uuid",
  "name": "personal",
  "color": "#10B981",
  "task_count": 0,
  "created_at": "2026-03-02T10:00:00Z"
}
```

**Errors**:
- `409` — tag with same name already exists for this user

---

### Update Tag

```
PUT /api/{user_id}/tags/{tag_id}
```

**Request Body**:
```json
{
  "name": "work-project",
  "color": "#EF4444"
}
```

**Response `200`**: Updated tag object.

---

### Delete Tag

```
DELETE /api/{user_id}/tags/{tag_id}
```

**Response `204`**: No content. Tag removed from all associated tasks.

---

## Reminders Endpoints

### List Reminders for Task

```
GET /api/{user_id}/tasks/{task_id}/reminders
```

**Response `200`**:
```json
{
  "items": [
    {
      "id": "reminder-uuid",
      "remind_at": "2026-03-03T08:00:00Z",
      "offset_minutes": 60,
      "delivered": false
    }
  ]
}
```

---

### Create Reminder

```
POST /api/{user_id}/tasks/{task_id}/reminders
```

**Request Body**:
```json
{
  "offset_minutes": 1440
}
```
*(`remind_at` is computed as `task.due_date - offset_minutes`)*

**Response `201`**: Reminder object.

**Errors**:
- `400` — task has no due_date; cannot create offset-based reminder
- `400` — computed remind_at is in the past

---

### Delete Reminder

```
DELETE /api/{user_id}/tasks/{task_id}/reminders/{reminder_id}
```

**Response `204`**: No content.

---

## Notifications Endpoints

### List Notifications

```
GET /api/{user_id}/notifications
```

**Query Parameters**:

| Param | Type | Description |
|---|---|---|
| `unread` | boolean | Filter unread only (`unread=true`) |
| `limit` | int | Page size (default 20) |
| `offset` | int | Pagination offset |

**Response `200`**:
```json
{
  "items": [
    {
      "id": "notif-uuid",
      "content": "Task 'Daily standup' is due in 1 hour",
      "notification_type": "reminder",
      "is_read": false,
      "task_id": "task-uuid",
      "created_at": "2026-03-03T08:00:00Z"
    }
  ],
  "total": 3,
  "unread_count": 2
}
```

---

### Mark Notification as Read

```
PUT /api/{user_id}/notifications/{notification_id}/read
```

**Response `200`**:
```json
{ "id": "notif-uuid", "is_read": true }
```

---

### Mark All as Read

```
PUT /api/{user_id}/notifications/read-all
```

**Response `200`**:
```json
{ "updated": 3 }
```

---

## Dapr Pub/Sub Event Schemas

### Topic: `task-events`

All events published by backend to `task-pubsub` component on topic `task-events`.

#### task.created
```json
{
  "event_type": "task.created",
  "task_id": "task-uuid",
  "user_id": "user-uuid",
  "title": "Daily standup",
  "priority": "high",
  "due_date": "2026-03-03T09:00:00Z",
  "has_reminders": true,
  "correlation_id": "corr-uuid",
  "timestamp": "2026-03-02T10:00:00Z"
}
```

#### task.completed
```json
{
  "event_type": "task.completed",
  "task_id": "task-uuid",
  "user_id": "user-uuid",
  "title": "Daily standup",
  "is_recurring": true,
  "next_occurrence_id": "new-task-uuid",
  "correlation_id": "corr-uuid",
  "timestamp": "2026-03-03T09:05:00Z"
}
```

#### task.overdue
```json
{
  "event_type": "task.overdue",
  "task_id": "task-uuid",
  "user_id": "user-uuid",
  "title": "Daily standup",
  "due_date": "2026-03-03T09:00:00Z",
  "minutes_overdue": 30,
  "correlation_id": "corr-uuid",
  "timestamp": "2026-03-03T09:30:00Z"
}
```

#### reminder.due
```json
{
  "event_type": "reminder.due",
  "reminder_id": "reminder-uuid",
  "task_id": "task-uuid",
  "user_id": "user-uuid",
  "task_title": "Daily standup",
  "due_date": "2026-03-03T09:00:00Z",
  "offset_minutes": 60,
  "correlation_id": "corr-uuid",
  "timestamp": "2026-03-03T08:00:00Z"
}
```

---

## Notification Service Subscription

Dapr subscription config (`dapr/components/subscription.yaml`):

```yaml
apiVersion: dapr.io/v1alpha1
kind: Subscription
metadata:
  name: task-events-subscription
spec:
  pubsubname: task-pubsub
  topic: task-events
  route: /subscribe/task-events
  # Filter: notification-service only handles reminder.due and task.overdue
```

Notification service handles POST to `/subscribe/task-events`:
```json
{
  "topic": "task-events",
  "pubsubname": "task-pubsub",
  "data": { "event_type": "reminder.due", "..." }
}
```
Returns `{ "status": "SUCCESS" }` or `{ "status": "RETRY" }` for Dapr retry logic.
