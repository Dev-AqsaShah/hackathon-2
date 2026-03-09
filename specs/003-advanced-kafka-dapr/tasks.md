# Tasks: Advanced Todo Platform — Recurring Tasks, Reminders, Priorities, Tags, Search/Filter/Sort, Kafka + Dapr

**Input**: Design documents from `/specs/003-advanced-kafka-dapr/`
**Branch**: `003-advanced-kafka-dapr` | **Date**: 2026-03-02
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅ | quickstart.md ✅

**Total Tasks**: 92 | **User Stories**: 7 | **Phases**: 10

---

## Format: `[ID] [P?] [Story?] Description — file/path`

- **[P]**: Parallelizable (different files, no unmet dependencies)
- **[US#]**: Maps to User Story number from spec.md
- No [P] = sequential dependency on prior task in same block

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold all new directories, install new dependencies, create Dapr component directory, extend Docker Compose with infrastructure services.

- [ ] T001 Create `phase-v/dapr/components/` directory structure (pubsub, statestore, subscription slots)
- [ ] T002 [P] Create `phase-v/notification-service/app/` directory structure with `subscribers/` and `services/` subdirs
- [ ] T003 [P] Create `phase-v/scheduler-service/app/` directory structure with `jobs/` and `services/` subdirs
- [ ] T004 Add Dapr Python SDK + APScheduler to `phase-v/backend/requirements.txt`: `dapr>=1.13.0`, `apscheduler>=3.10.0`
- [ ] T005 [P] Create `phase-v/notification-service/requirements.txt`: `fastapi`, `uvicorn`, `sqlmodel`, `asyncpg`, `psycopg2-binary`, `dapr>=1.13.0`, `pydantic-settings`, `python-dotenv`
- [ ] T006 [P] Create `phase-v/scheduler-service/requirements.txt`: `fastapi`, `uvicorn`, `sqlmodel`, `asyncpg`, `psycopg2-binary`, `dapr>=1.13.0`, `apscheduler>=3.10.0`, `pydantic-settings`, `python-dotenv`
- [ ] T007 Create `phase-v/docker-compose.infra.yml` with services: `zookeeper` (port 2181), `kafka` (port 9092, depends on zookeeper), `redis` (port 6379), `dapr-placement` (port 50006)

**Checkpoint**: New service directories exist, dependencies listed, infra compose file ready.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: All database migrations, base SQLModel classes, and the shared EventPublisher service. MUST complete before any user story implementation.

**⚠️ CRITICAL**: No user story work begins until all T008–T029 are complete.

### Database Migrations

- [ ] T008 Write Alembic migration `migration_001_add_task_columns.py` — add nullable columns `due_date TIMESTAMPTZ`, `priority VARCHAR(10) DEFAULT 'none'`, `parent_task_id UUID`, `search_vector TSVECTOR` to `tasks` table in `phase-v/backend/alembic/versions/`
- [ ] T009 Write Alembic migration `migration_002_create_recurrence_rules.py` — create `recurrence_rules` table (id, frequency, interval, days_of_week, end_type, end_date, end_count, occurrences_generated, created_at) in `phase-v/backend/alembic/versions/`
- [ ] T010 Write Alembic migration `migration_003_add_recurrence_fk.py` — add `recurrence_rule_id UUID FK → recurrence_rules(id) SET NULL` to tasks, add self-ref FK `parent_task_id → tasks(id) SET NULL` in `phase-v/backend/alembic/versions/`
- [ ] T011 [P] Write Alembic migration `migration_004_create_tags.py` — create `tags` table (id, user_id, name VARCHAR(50), color VARCHAR(7) default '#6B7280', created_at), add `CREATE UNIQUE INDEX idx_tags_user_name ON tags(user_id, LOWER(name))` in `phase-v/backend/alembic/versions/`
- [ ] T012 [P] Write Alembic migration `migration_005_create_task_tags.py` — create `task_tags` junction table (task_id UUID FK CASCADE, tag_id UUID FK CASCADE, composite PK) in `phase-v/backend/alembic/versions/`
- [ ] T013 [P] Write Alembic migration `migration_006_create_reminders.py` — create `reminders` table (id, task_id FK CASCADE, user_id, remind_at TIMESTAMPTZ, offset_minutes, delivered BOOLEAN default false, created_at), add `CREATE INDEX idx_reminders_pending ON reminders(remind_at) WHERE delivered = FALSE` in `phase-v/backend/alembic/versions/`
- [ ] T014 [P] Write Alembic migration `migration_007_create_notifications.py` — create `notifications` table (id, user_id, task_id FK SET NULL nullable, content TEXT, notification_type VARCHAR(30), is_read BOOLEAN default false, created_at), add `CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC)` in `phase-v/backend/alembic/versions/`
- [ ] T015 [P] Write Alembic migration `migration_008_create_domain_events.py` — create `domain_events` table (id, event_type VARCHAR(50), payload JSONB, correlation_id UUID nullable, producer_service VARCHAR(50), published_at, processed BOOLEAN default false) in `phase-v/backend/alembic/versions/`
- [ ] T016 Write Alembic migration `migration_009_search_indexes.py` — create GIN index `CREATE INDEX idx_tasks_search ON tasks USING GIN(search_vector)`, create trigger function `tasks_search_vector_update()` (setweight title A, description B), create composite indexes `idx_tasks_user_due ON tasks(user_id, due_date)`, `idx_tasks_user_priority ON tasks(user_id, priority)`, `idx_tasks_user_status ON tasks(user_id, completed)` in `phase-v/backend/alembic/versions/`
- [ ] T017 Run all migrations: `alembic upgrade head` from `phase-v/backend/` — verify all 9 migration files apply cleanly with no errors

### Base SQLModel Classes

- [ ] T018 [P] Create `RecurrenceRule` SQLModel class in `phase-v/backend/app/models/recurrence.py` — fields: id (UUID PK), frequency, interval, days_of_week (ARRAY Integer), end_type, end_date, end_count, occurrences_generated, created_at
- [ ] T019 [P] Create `Tag` and `TaskTag` SQLModel classes in `phase-v/backend/app/models/tag.py` — Tag fields: id, user_id, name, color, created_at; TaskTag fields: task_id FK, tag_id FK, composite PK
- [ ] T020 [P] Create `Reminder` SQLModel class in `phase-v/backend/app/models/reminder.py` — fields: id, task_id FK, user_id, remind_at, offset_minutes, delivered, created_at
- [ ] T021 [P] Create `Notification` SQLModel class in `phase-v/backend/app/models/notification.py` — fields: id, user_id, task_id FK nullable, content, notification_type, is_read, created_at
- [ ] T022 [P] Create `DomainEvent` SQLModel class in `phase-v/backend/app/models/domain_event.py` — fields: id, event_type, payload (JSON), correlation_id, producer_service, published_at, processed
- [ ] T023 Update `phase-v/backend/app/models/__init__.py` — import and export all new models: RecurrenceRule, Tag, TaskTag, Reminder, Notification, DomainEvent

### Shared Infrastructure Services

- [ ] T024 Create `EventPublisher` service class in `phase-v/backend/app/services/event_publisher.py` — method `async publish(event_type: str, payload: dict, correlation_id: str = None)` that: (1) POSTs to Dapr HTTP `http://localhost:3500/v1.0/publish/task-pubsub/task-events`, (2) writes to `domain_events` table as outbox, (3) handles Dapr unavailability gracefully (logs warning, does not raise exception)
- [ ] T025 Create `phase-v/backend/app/core/dapr_config.py` — Dapr HTTP port config from env (`DAPR_HTTP_PORT`, default 3500), pub/sub component name (`DAPR_PUBSUB_NAME`, default `task-pubsub`), topic name (`DAPR_TASK_TOPIC`, default `task-events`)

**Checkpoint**: All migrations applied, all models importable, EventPublisher tested with `dapr run` locally. All user stories can now begin.

---

## Phase 3: User Story 1 — Recurring Tasks (Priority: P1) 🎯 MVP

**Goal**: Users can create tasks with a recurrence rule. On completing a recurring task, the next occurrence is automatically generated with the correct due date.

**Independent Test**: Create a recurring task (daily), mark it complete via `PATCH /api/{user_id}/tasks/{id}` with `completed: true`, then `GET /api/{user_id}/tasks` and verify a new task exists with `parent_task_id` pointing to the original and `due_date` advanced by 1 day.

### Implementation

- [ ] T026 [US1] Extend `Task` SQLModel in `phase-v/backend/app/models/todo.py` — add fields: `recurrence_rule_id: Optional[UUID]` (FK), `parent_task_id: Optional[UUID]` (self-ref FK), relationship `recurrence_rule: Optional[RecurrenceRule]`
- [ ] T027 [US1] Create `RecurrenceService` in `phase-v/backend/app/services/recurrence_service.py` — implement `calculate_next_due(rule: RecurrenceRule, current_due: datetime) -> Optional[datetime]` handling: daily (add interval days), weekly (find next matching weekday), monthly (add interval months), end conditions (never/on_date/after_n)
- [ ] T028 [US1] Create recurrence Pydantic schemas in `phase-v/backend/app/schemas/recurrence.py` — `RecurrenceRuleCreate` (frequency, interval, days_of_week, end_type, end_date, end_count), `RecurrenceRuleRead` (all fields + id)
- [ ] T029 [US1] Extend `TaskCreate` and `TaskRead` Pydantic schemas in `phase-v/backend/app/schemas/task.py` — add `recurrence: Optional[RecurrenceRuleCreate]` to create; add `recurrence_rule: Optional[RecurrenceRuleRead]`, `has_recurrence: bool`, `parent_task_id: Optional[UUID]` to read
- [ ] T030 [US1] Extend `POST /api/{user_id}/tasks` in `phase-v/backend/app/api/routes/tasks.py` — if `recurrence` param present: create `RecurrenceRule` row, set `task.recurrence_rule_id`; publish `task.created` event via EventPublisher
- [ ] T031 [US1] Extend `PATCH /api/{user_id}/tasks/{task_id}` in `phase-v/backend/app/api/routes/tasks.py` — handle `completed: true` trigger: call `RecurrenceService.should_generate_next(rule)`, if true: call `calculate_next_due`, create new Task (parent_task_id = current id, same recurrence_rule_id, due_date = next_due, completed = false), increment `rule.occurrences_generated`; publish `task.completed` event
- [ ] T032 [US1] Add `DELETE /api/{user_id}/tasks/{task_id}?scope=this|all_future` in `phase-v/backend/app/api/routes/tasks.py` — `scope=this`: delete single task; `scope=all_future`: delete all tasks WHERE `recurrence_rule_id = same AND completed = false`; preserve completed instances regardless
- [ ] T033 [US1] Extend `PATCH /api/{user_id}/tasks/{task_id}` recurrence update path — if `recurrence` object included in PATCH body: update existing `RecurrenceRule` row (applies to future only); do NOT modify already-completed instances
- [ ] T034 [P] [US1] Add recurrence UI to `TaskForm.tsx` in `phase-v/frontend/components/todos/TaskForm.tsx` — recurrence toggle, frequency selector (Daily/Weekly/Monthly), interval input, days-of-week checkboxes (for Weekly), end condition radio (Never/On date/After N), end date picker / count input
- [ ] T035 [P] [US1] Update `TaskItem.tsx` in `phase-v/frontend/components/todos/TaskItem.tsx` — show recurrence badge (e.g. "↻ Daily") when `has_recurrence: true`; show `parent_task_id` link as "(recurring instance)"

**Checkpoint**: Create daily recurring task via UI → complete it → verify new instance appears in dashboard with correct next due date.

---

## Phase 4: User Story 2 — Due Dates & Reminders (Priority: P1)

**Goal**: Users can assign a due date and reminder offset(s) to any task. Reminders are scheduled; overdue tasks are visually distinguished.

**Independent Test**: Create a task with `due_date = now() + 2min` and `reminders: [{offset_minutes: 1}]`. After 1 minute, `GET /api/{user_id}/tasks/{id}` should still show `is_overdue: false`. After 2 minutes, it should show `is_overdue: true`. A `notifications` row should exist.

### Implementation

- [ ] T036 [US2] Extend `Task` SQLModel in `phase-v/backend/app/models/todo.py` — add `due_date: Optional[datetime]` field (TIMESTAMPTZ)
- [ ] T037 [US2] Add `is_overdue` computed property to `TaskRead` Pydantic schema in `phase-v/backend/app/schemas/task.py` — `is_overdue: bool = False`; compute in service layer as `due_date < utcnow() AND NOT completed`
- [ ] T038 [US2] Create Reminder Pydantic schemas in `phase-v/backend/app/schemas/reminder.py` — `ReminderCreate` (offset_minutes: int), `ReminderRead` (id, remind_at, offset_minutes, delivered), `ReminderListResponse`
- [ ] T039 [US2] Create `reminders` router in `phase-v/backend/app/api/routes/reminders.py` — `GET /api/{user_id}/tasks/{task_id}/reminders` (list), `POST /api/{user_id}/tasks/{task_id}/reminders` (create — compute `remind_at = task.due_date - offset_minutes`, validate task has due_date, validate remind_at is future), `DELETE /api/{user_id}/tasks/{task_id}/reminders/{reminder_id}`
- [ ] T040 [US2] Extend `POST /api/{user_id}/tasks` in `phase-v/backend/app/api/routes/tasks.py` — accept `due_date: Optional[datetime]` and `reminders: Optional[List[ReminderCreate]]`; create Reminder rows after task creation; validate: if reminders provided, due_date must be set
- [ ] T041 [US2] Extend `PATCH /api/{user_id}/tasks/{task_id}` in `phase-v/backend/app/api/routes/tasks.py` — if `due_date` changes: delete existing undelivered reminders, recreate from stored offsets; if task completed: skip future reminders (do not delete, just mark delivered=true)
- [ ] T042 [US2] Register reminders router in `phase-v/backend/app/main.py` — `app.include_router(reminders_router)`
- [ ] T043 [P] [US2] Extend `TaskForm.tsx` in `phase-v/frontend/components/todos/TaskForm.tsx` — add date+time picker for due date (HTML `<input type="datetime-local">`), reminder offset selector (None / 30 min / 1 hour / 1 day / 2 days before)
- [ ] T044 [P] [US2] Extend `TaskItem.tsx` in `phase-v/frontend/components/todos/TaskItem.tsx` — display due date in human-readable format ("Due Mar 5 at 9:00 AM"); apply red/warning styling class when `is_overdue: true`; show overdue badge

**Checkpoint**: Create task with due_date + reminder via UI → verify task card shows due date → manually set due_date to past → verify overdue badge appears on next page load.

---

## Phase 5: User Story 3 — Priorities (Priority: P2)

**Goal**: Users can set High / Medium / Low / None priority on any task; priority is displayed as a color-coded badge; tasks can be sorted by priority.

**Independent Test**: Create 3 tasks with priority High, Medium, Low. `GET /api/{user_id}/tasks?sort=priority&order=asc` returns them in order High → Medium → Low.

### Implementation

- [ ] T045 [US3] Extend `Task` SQLModel in `phase-v/backend/app/models/todo.py` — add `priority: str = "none"` field with CHECK constraint (`high`, `medium`, `low`, `none`)
- [ ] T046 [US3] Add `priority` validation to `TaskCreate` and `TaskUpdate` Pydantic schemas in `phase-v/backend/app/schemas/task.py` — use `Literal["high", "medium", "low", "none"]` type; default `"none"`
- [ ] T047 [US3] Update `task_service.py` in `phase-v/backend/app/services/task_service.py` — include `priority` in create/update operations; add priority sort mapping: `{"high": 1, "medium": 2, "low": 3, "none": 4}`
- [ ] T048 [P] [US3] Add priority picker to `TaskForm.tsx` in `phase-v/frontend/components/todos/TaskForm.tsx` — `<select>` or button group with 4 options; color-coded: High=red, Medium=yellow, Low=green, None=gray
- [ ] T049 [P] [US3] Add priority badge to `TaskItem.tsx` in `phase-v/frontend/components/todos/TaskItem.tsx` — small colored dot/chip showing priority; hidden when `priority = "none"`

**Checkpoint**: Create tasks with each priority level → verify badges render correctly → sort by priority → verify order is High/Medium/Low/None.

---

## Phase 6: User Story 4 — Tags & Labels (Priority: P2)

**Goal**: Users can create custom tags, assign multiple tags to tasks, filter by tag, rename/delete tags globally.

**Independent Test**: Create tag "work" → assign to 2 tasks → `GET /api/{user_id}/tasks?tag=work` returns only those 2 tasks → rename tag to "work-project" → verify tasks now show "work-project" tag.

### Implementation

- [ ] T050 [US4] Create `tag_service.py` in `phase-v/backend/app/services/tag_service.py` — `create_tag(user_id, name, color)` (normalize name to lowercase), `list_tags(user_id)` with task_count via JOIN, `update_tag(tag_id, user_id, name, color)`, `delete_tag(tag_id, user_id)` (cascades via FK)
- [ ] T051 [US4] Create Tag Pydantic schemas in `phase-v/backend/app/schemas/tag.py` — `TagCreate` (name, color), `TagUpdate` (name, color), `TagRead` (id, name, color, task_count, created_at), `TagListResponse`
- [ ] T052 [US4] Create tags router in `phase-v/backend/app/api/routes/tags.py` — `GET /api/{user_id}/tags`, `POST /api/{user_id}/tags` (handle 409 on duplicate name), `PUT /api/{user_id}/tags/{tag_id}`, `DELETE /api/{user_id}/tags/{tag_id}` (returns 204)
- [ ] T053 [US4] Extend `POST /api/{user_id}/tasks` and `PATCH /api/{user_id}/tasks/{task_id}` in `phase-v/backend/app/api/routes/tasks.py` — accept `tag_ids: Optional[List[UUID]]`; validate all tag_ids owned by user; sync `task_tags` junction rows (delete-then-insert for PATCH)
- [ ] T054 [US4] Extend `TaskRead` schema in `phase-v/backend/app/schemas/task.py` — add `tags: List[TagRead] = []`; update task query to JOIN task_tags + tags and populate
- [ ] T055 [US4] Register tags router in `phase-v/backend/app/main.py` — `app.include_router(tags_router)`
- [ ] T056 [P] [US4] Create `useTags()` hook in `phase-v/frontend/lib/hooks/useTags.ts` — fetches `GET /api/{user_id}/tags`, exposes `tags`, `createTag(name, color)`, `deleteTag(id)`, `renameTag(id, name)` with optimistic updates
- [ ] T057 [P] [US4] Add multi-tag selector to `TaskForm.tsx` in `phase-v/frontend/components/todos/TaskForm.tsx` — autocomplete input showing existing user tags, create-on-type for new tags, selected tags as removable chips
- [ ] T058 [P] [US4] Add tag chips to `TaskItem.tsx` in `phase-v/frontend/components/todos/TaskItem.tsx` — render each tag as a small colored pill with tag name; max 3 visible, "+N more" overflow

**Checkpoint**: Create tag via UI → assign to task → verify chip renders on card → delete tag → verify chip disappears from all tasks.

---

## Phase 7: User Story 5 — Search, Filter & Sort (Priority: P2)

**Goal**: Users can search by keyword, apply multi-criterion filters (status/priority/tag/due date range), and sort results — all combined simultaneously.

**Independent Test**: Create 10 tasks with mixed priorities and tags. `GET /api/{user_id}/tasks?q=standup&priority=high&tag=work&sort=due_date&order=asc` returns only tasks matching all criteria, in ascending due date order.

### Implementation

- [ ] T059 [US5] Create `SearchService` in `phase-v/backend/app/services/search_service.py` — `build_query(user_id, q, status, priority, tags, due_before, due_after, sort, order, limit, offset) -> Select` that: constructs base query, applies FTS `task.search_vector @@ to_tsquery('english', q)` if q present, applies AND filters for each non-None param, adds ORDER BY clause mapping sort param to column, adds pagination
- [ ] T060 [US5] Extend `GET /api/{user_id}/tasks` in `phase-v/backend/app/api/routes/tasks.py` — add query params: `q: str = None`, `status: Literal["open","completed","overdue"] = None`, `priority: str = None`, `tag: List[str] = Query(None)`, `due_before: datetime = None`, `due_after: datetime = None`, `sort: str = "created_at"`, `order: str = "desc"`, `limit: int = 50`, `offset: int = 0`; delegate to `SearchService.build_query()`
- [ ] T061 [US5] Update `TaskListResponse` Pydantic schema in `phase-v/backend/app/schemas/task.py` — add `total: int`, `limit: int`, `offset: int` pagination fields alongside `items: List[TaskRead]`
- [ ] T062 [P] [US5] Create `TaskFilters.tsx` in `phase-v/frontend/components/todos/TaskFilters.tsx` — search bar (debounced 300ms), collapsible filter panel with: status dropdown, priority multi-select, tag multi-select (using useTags()), due date range inputs, sort dropdown + order toggle; "Clear all" button
- [ ] T063 [P] [US5] Create `useTaskSearch()` hook in `phase-v/frontend/lib/hooks/useTaskSearch.ts` — accepts filter state object, builds query string, fetches `/api/{user_id}/tasks` with params, returns `{ tasks, total, isLoading, error }`; persists last filter state in `sessionStorage`
- [ ] T064 [US5] Update `phase-v/frontend/app/dashboard/page.tsx` — integrate `<TaskFilters>` above task list; pass filter state to `useTaskSearch()`; show `total` count and empty state when `items.length === 0`

**Checkpoint**: Apply 3 simultaneous filters in UI → verify task list updates correctly → clear filters → verify full list restores → refresh page → verify filters persist from sessionStorage.

---

## Phase 8: User Story 6 — Event-Driven via Kafka (Priority: P3)

**Goal**: All task lifecycle transitions publish domain events asynchronously via Kafka (through Dapr). Notification Service consumes events and writes in-app notifications. Task API responses do not block on event delivery.

**Independent Test**: Create a task with `due_date = past` → within 30 seconds, `GET /api/{user_id}/notifications` returns a `task.overdue` notification. The task creation API response must return in < 500ms (does not wait for Kafka).

### Implementation

- [ ] T065 [US6] Create `phase-v/dapr/components/pubsub.yaml` — Dapr Component `type: pubsub.kafka`, `name: task-pubsub`, metadata: `brokers: kafka:9092`, `consumerGroup: todo-app`, `initialOffset: newest`
- [ ] T066 [US6] Create `phase-v/dapr/components/subscription.yaml` — Dapr Subscription: `pubsubname: task-pubsub`, `topic: task-events`, `route: /subscribe/task-events`, `scopes: [notification-service]`
- [ ] T067 [US6] Integrate `EventPublisher.publish()` into task routes in `phase-v/backend/app/api/routes/tasks.py` — fire-and-forget after: task create (`task.created`), task complete (`task.completed`), task delete (`task.deleted`), task update with due_date change (`task.updated`); use `asyncio.create_task()` to avoid blocking response
- [ ] T068 [US6] Create `phase-v/notification-service/app/main.py` — FastAPI app, lifespan: connect to DB on startup; route `POST /subscribe/task-events` that reads Dapr CloudEvent envelope, dispatches to handler based on `event_type`, returns `{"status": "SUCCESS"}` or `{"status": "RETRY"}` on error
- [ ] T069 [US6] Create `phase-v/notification-service/app/subscribers/task_events.py` — handler functions: `handle_task_overdue(event_data)` writes notification (type=`overdue`, content="Task '{title}' is overdue"), `handle_reminder_due(event_data)` writes notification (type=`reminder`, content="Reminder: '{title}' due in {offset} minutes"); both check for duplicate `(user_id, task_id, notification_type, date_trunc('day', NOW()))` before inserting
- [ ] T070 [US6] Create `phase-v/notification-service/app/services/notification_writer.py` — `async write_notification(user_id, task_id, content, notification_type)` — inserts into `notifications` table using shared DB session
- [ ] T071 [US6] Create `phase-v/notification-service/app/core/` — config.py (DATABASE_URL, DAPR_HTTP_PORT), database.py (SQLModel engine + session), shared with same Neon DB as backend
- [ ] T072 [US6] Create `phase-v/notification-service/Dockerfile` — multi-stage build, `uvicorn app.main:app --host 0.0.0.0 --port 8001`
- [ ] T073 [US6] Create Notifications API router in `phase-v/backend/app/api/routes/notifications.py` — `GET /api/{user_id}/notifications` (query params: `unread: bool = False`, `limit: int = 20`, `offset: int = 0`; returns `NotificationListResponse` with `items`, `total`, `unread_count`), `PUT /api/{user_id}/notifications/{notification_id}/read` (set `is_read=true`), `PUT /api/{user_id}/notifications/read-all` (bulk update)
- [ ] T074 [US6] Create Notification Pydantic schemas in `phase-v/backend/app/schemas/notification.py` — `NotificationRead` (id, content, notification_type, is_read, task_id, created_at), `NotificationListResponse` (items, total, unread_count)
- [ ] T075 [US6] Register notifications router in `phase-v/backend/app/main.py` — `app.include_router(notifications_router)`
- [ ] T076 [US6] Update `phase-v/docker-compose.yml` — add: `zookeeper` service, `kafka` service (depends on zookeeper, KAFKA_ADVERTISED_LISTENERS), `redis` service; add Dapr sidecar (`daprd`) container for `backend` service with `--app-id backend --app-port 8000 --dapr-http-port 3500 --components-path /dapr/components`; add `notification-service` container with its Dapr sidecar; mount `./dapr/components` as volume
- [ ] T077 [P] [US6] Create `NotificationBell.tsx` in `phase-v/frontend/components/notifications/NotificationBell.tsx` — bell SVG icon with unread count badge (red dot with number); polls `GET /api/{user_id}/notifications?unread=true` every 20 seconds using `setInterval`; opens `<NotificationList>` dropdown on click
- [ ] T078 [P] [US6] Create `NotificationList.tsx` in `phase-v/frontend/components/notifications/NotificationList.tsx` — dropdown list of recent notifications (max 10); each item shows content, relative time ("2 min ago"), task link; click marks as read via `PUT .../read`; "Mark all read" button at top
- [ ] T079 [US6] Create `useNotifications()` hook in `phase-v/frontend/lib/hooks/useNotifications.ts` — fetches notifications, exposes `notifications`, `unreadCount`, `markRead(id)`, `markAllRead()`; auto-polls every 20s via `useEffect` + `setInterval`
- [ ] T080 [US6] Add `<NotificationBell>` to dashboard header in `phase-v/frontend/app/dashboard/page.tsx` — place in top-right of header bar next to user menu
- [ ] T081 [US6] Create `phase-v/frontend/app/notifications/page.tsx` — full-page notification history with pagination; "Mark all read" button; empty state when no notifications

**Checkpoint**: Start all services with `docker compose up`. Create task with past due_date. Within 30s, bell icon shows unread count > 0. Click bell → see overdue notification. Click notification → mark read → unread count decreases.

---

## Phase 9: User Story 7 — Distributed Runtime with Dapr (Priority: P3)

**Goal**: All three services run with Dapr sidecars. Scheduler Service detects overdue tasks and publishes events. Services operate independently — restarting one does not affect others.

**Independent Test**: `docker compose stop notification-service` → create 3 tasks → `docker compose start notification-service` → verify within 60 seconds all 3 notifications appear (at-least-once delivery via Kafka retry).

### Implementation

- [ ] T082 [US7] Create `phase-v/dapr/components/statestore.yaml` — Dapr Component `type: state.redis`, `name: task-statestore`, metadata: `redisHost: redis:6379`, `redisPassword: ""`, `actorStateStore: false`
- [ ] T083 [US7] Create `phase-v/scheduler-service/app/main.py` — FastAPI app with lifespan: initialize APScheduler (`BackgroundScheduler`) on startup, add jobs: `overdue_checker` every 30 seconds, `reminder_dispatcher` every 30 seconds; `scheduler.start()` on lifespan enter, `scheduler.shutdown()` on exit; single health route `GET /health`
- [ ] T084 [US7] Create `phase-v/scheduler-service/app/jobs/overdue_checker.py` — `check_overdue_tasks()`: query tasks WHERE `due_date < utcnow() AND completed = false AND due_date IS NOT NULL`; for each: publish `task.overdue` event via EventPublisher; use Dapr state store to record `last_notified_{task_id}` key (prevent duplicate overdue events within 24h window)
- [ ] T085 [US7] Create `phase-v/scheduler-service/app/jobs/reminder_dispatcher.py` — `dispatch_pending_reminders()`: query reminders WHERE `remind_at <= utcnow() AND delivered = false`; for each: publish `reminder.due` event via EventPublisher, update `reminder.delivered = true` in DB; use `misfire_grace_time=60` on APScheduler job
- [ ] T086 [US7] Create `phase-v/scheduler-service/app/services/event_publisher.py` — same pattern as backend EventPublisher: POST to `http://localhost:{DAPR_HTTP_PORT}/v1.0/publish/task-pubsub/task-events`, handle unavailability gracefully (log + continue, do not crash scheduler)
- [ ] T087 [US7] Create `phase-v/scheduler-service/app/core/` — config.py (DATABASE_URL, DAPR_HTTP_PORT, DAPR_STATESTORE_NAME), database.py (sync SQLModel session for APScheduler context)
- [ ] T088 [US7] Create `phase-v/scheduler-service/Dockerfile` — `uvicorn app.main:app --host 0.0.0.0 --port 8002`
- [ ] T089 [US7] Add `scheduler-service` to `phase-v/docker-compose.yml` with Dapr sidecar container — same pattern as notification-service sidecar (--app-id scheduler-service --app-port 8002 --dapr-http-port 3502)
- [ ] T090 [US7] Add Dapr sidecar container for `notification-service` in `phase-v/docker-compose.yml` — `daprd --app-id notification-service --app-port 8001 --dapr-http-port 3501 --components-path /dapr/components`; ensure `subscription.yaml` loaded so notification-service auto-subscribes to `task-events` topic on startup
- [ ] T091 [US7] Extend Phase IV Helm chart — create `phase-v/helm/todo-app/templates/notification-service-deployment.yaml` with Dapr annotations (`dapr.io/enabled: "true"`, `dapr.io/app-id: notification-service`, `dapr.io/app-port: "8001"`); create matching `notification-service-service.yaml` (ClusterIP)
- [ ] T092 [US7] Create `phase-v/helm/todo-app/templates/scheduler-service-deployment.yaml` with Dapr annotations (`dapr.io/app-id: scheduler-service`, `dapr.io/app-port: "8002"`); create matching `scheduler-service-service.yaml` (ClusterIP)
- [ ] T093 [US7] Update `phase-v/helm/todo-app/values.yaml` — add `notificationService` block (image, replicaCount, env: DATABASE_URL, DAPR_HTTP_PORT), `schedulerService` block (same pattern), `kafka.brokers`, `redis.host`

**Checkpoint**: `docker compose up` all services. `docker compose stop notification-service`. Create 5 tasks. `docker compose start notification-service`. Wait 60s. `GET /notifications` returns 5+ notifications. API was responsive during notification-service downtime.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: MCP tool updates, final integration validation, documentation sync.

- [ ] T094 [P] Update `add_task` MCP tool in `phase-v/backend/app/mcp/tools/add_task.py` — add params: `priority: Optional[str]` (default "none"), `due_date: Optional[str]` (ISO format), `tag_ids: Optional[List[str]]`; update tool description with natural language examples: "remind me to...", "high priority", "tag as work"
- [ ] T095 [P] Update `update_task` MCP tool in `phase-v/backend/app/mcp/tools/update_task.py` — add same new params: `priority`, `due_date`, `tag_ids`; update description to handle "mark high priority", "due tomorrow", "add tag personal"
- [ ] T096 [P] Create `search_tasks` MCP tool in `phase-v/backend/app/mcp/tools/search_tasks.py` — params: `query: Optional[str]`, `priority: Optional[str]`, `tag: Optional[str]`, `status: Optional[str]`; calls `GET /api/{user_id}/tasks` with filter params; description: "use when user asks 'show me...', 'find...', 'what are my high priority...', 'list overdue...'"
- [ ] T097 Register `search_tasks` MCP tool in `phase-v/backend/app/mcp/server.py` — add to MCP tool registry alongside add_task, list_tasks
- [ ] T098 Update `phase-v/docker-compose.yml` — final: add health checks for kafka (`kafka-topics.sh --list`), redis (`redis-cli ping`), notification-service, scheduler-service; ensure `depends_on` chain is correct (notification-service depends on kafka + backend; scheduler-service depends on kafka + backend)
- [ ] T099 [P] Sync all spec artifacts to `phase-v/specs/003-advanced-kafka-dapr/` — copy plan.md, research.md, data-model.md, contracts/, quickstart.md, tasks.md from `specs/003-advanced-kafka-dapr/`
- [ ] T100 Run quickstart.md end-to-end validation: start all services, create recurring task with reminder, verify all 5 event types flow through Kafka, verify notifications appear in UI within 60s

**Checkpoint**: All 7 user stories working end-to-end. MCP agent can set priority, tag, due date via chat. Overdue tasks trigger notifications. Service restart resilience verified.

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)          → no dependencies, start immediately
       ↓
Phase 2 (Foundational)   → depends on Phase 1 ⚠️ BLOCKS all user stories
       ↓
Phase 3  Phase 4         → both depend on Phase 2 only (can run in parallel)
(US1 P1) (US2 P1)        → these two are highest priority, start together
       ↓         ↓
Phase 5  Phase 6  Phase 7 → depend on Phase 2 (can run in parallel after Foundation)
(US3 P2) (US4 P2) (US5 P2)
       ↓
Phase 8 (US6 Kafka)      → depends on Phase 2 + Phase 3/4 (events use task model)
       ↓
Phase 9 (US7 Dapr)       → depends on Phase 8 (scheduler publishes events)
       ↓
Phase 10 (Polish)        → depends on all prior phases
```

### User Story Dependencies

| Story | Depends On | Can Parallelize With |
|---|---|---|
| US1 Recurring Tasks (P1) | Foundation | US2 |
| US2 Due Dates & Reminders (P1) | Foundation | US1 |
| US3 Priorities (P2) | Foundation | US4, US5 |
| US4 Tags (P2) | Foundation | US3, US5 |
| US5 Search/Filter/Sort (P2) | Foundation + US3 (priority sort) + US4 (tag filter) | — |
| US6 Event-Driven Kafka (P3) | Foundation + US1 + US2 | — |
| US7 Dapr Distributed (P3) | US6 (uses same pub/sub) | — |

### Within Each User Story

- Models before Services → Services before Routes → Routes before Frontend
- [P]-marked tasks within a story can be executed simultaneously

---

## Parallel Opportunities

### Phase 2: Run all DB migrations in parallel groups

```bash
# Group A (independent tables):
Task: "T011 migration_004_create_tags.py"
Task: "T012 migration_005_create_task_tags.py"
Task: "T013 migration_006_create_reminders.py"
Task: "T014 migration_007_create_notifications.py"
Task: "T015 migration_008_create_domain_events.py"

# Group B (new SQLModel classes — all independent files):
Task: "T018 Create RecurrenceRule model"
Task: "T019 Create Tag + TaskTag models"
Task: "T020 Create Reminder model"
Task: "T021 Create Notification model"
Task: "T022 Create DomainEvent model"
```

### Phase 3+4: Run US1 and US2 together after Foundation

```bash
# Stream A (US1):
Task: "T026 Extend Task model with recurrence fields"
Task: "T027 Create RecurrenceService"
...

# Stream B (US2):
Task: "T036 Extend Task model with due_date"
Task: "T037 Add is_overdue computed property"
...
```

### Phase 5+6+7: Run US3, US4, US5 concurrently

```bash
# Stream A (US3 Priorities):
Task: "T045 Extend Task model with priority"
...

# Stream B (US4 Tags):
Task: "T050 Create tag_service.py"
...

# Stream C (US5 Search) — start after US3+US4 model work:
Task: "T059 Create SearchService"
...
```

---

## Implementation Strategy

### MVP: P1 Stories Only (US1 + US2)

1. ✅ Complete Phase 1: Setup
2. ✅ Complete Phase 2: Foundation (all 9 migrations + models + EventPublisher)
3. ✅ Complete Phase 3: US1 Recurring Tasks → **demo recurring task loop**
4. ✅ Complete Phase 4: US2 Due Dates & Reminders → **demo overdue badge**
5. 🛑 Stop & validate P1 scope — fully functional for recurring tasks + reminders

### Full P2 Scope (add after MVP)

6. Phase 5: US3 Priorities
7. Phase 6: US4 Tags
8. Phase 7: US5 Search/Filter/Sort → **full task management UI demo**

### Full P3 Scope (infrastructure)

9. Phase 8: US6 Kafka event-driven → **async notifications demo**
10. Phase 9: US7 Dapr distributed runtime → **service resilience demo**
11. Phase 10: Polish + MCP tools + final validation

### Parallel Team Strategy (3 developers post-Foundation)

| Developer | Stories | Phases |
|---|---|---|
| Dev A | US1 + US2 (P1) | Phases 3 + 4 |
| Dev B | US3 + US4 (P2) | Phases 5 + 6 |
| Dev C | US5 + US6 + US7 (P2/P3) | Phases 7 + 8 + 9 |

---

## Notes

- `[P]` tasks target different files — safe to run in parallel
- `[US#]` label maps each task to its user story for traceability
- Run `alembic upgrade head` after every migration write (T008–T016 → T017)
- Commit after each Phase checkpoint
- Dapr sidecar required for `EventPublisher` to work — use `dapr run` or `docker compose up`
- For unit tests: mock Dapr HTTP port; use `DAPR_HTTP_PORT=0` to skip pub/sub in test mode
- MCP tools (T094–T097) can be implemented in Phase 10 independently of all other work
