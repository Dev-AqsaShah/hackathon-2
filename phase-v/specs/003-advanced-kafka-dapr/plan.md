# Implementation Plan: Advanced Todo Platform — Recurring Tasks, Reminders, Priorities, Tags, Search/Filter/Sort, Kafka + Dapr

**Branch**: `003-advanced-kafka-dapr` | **Date**: 2026-03-02 | **Spec**: [spec.md](./spec.md)

---

## Summary

Extend the existing Phase IV Todo full-stack application with advanced task management features (recurring tasks, due dates, reminders, priorities, tags, search/filter/sort) and introduce an event-driven distributed architecture using Apache Kafka (via Dapr pub/sub) and Dapr as the distributed application runtime. Two new microservices — a Notification Service and a Scheduler Service — join the existing Backend API and Frontend, all coordinated through Dapr sidecars.

---

## Technical Context

**Language/Version**: Python 3.13+ (backend services), TypeScript / Node 20+ (frontend)
**Primary Dependencies**: FastAPI, SQLModel, Alembic, APScheduler, Dapr Python SDK, Next.js 16, React 19, Tailwind CSS, better-auth
**Storage**: Neon Serverless PostgreSQL (primary), Redis (Dapr state store — idempotency keys, scheduler heartbeats)
**Message Broker**: Apache Kafka 3.x (via Dapr pub/sub component)
**Testing**: pytest + pytest-asyncio (backend), Jest + React Testing Library (frontend)
**Target Platform**: Docker Compose (local dev), Kubernetes + Helm (production)
**Performance Goals**: Search results < 1s / 10k tasks; task API response < 500ms; reminder delivery within 60s
**Constraints**: Dapr abstracts broker — zero Kafka SDK in application code; no WebSocket (polling-based notifications); Neon Serverless compatible (no pg_cron)
**Scale/Scope**: Single-tenant per user, up to 10k tasks/user, 3 application services

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked post-design.*

| Principle | Status | Notes |
|---|---|---|
| **I. Security & User Isolation** | ✅ PASS | All new endpoints include `user_id` validation. MCP tools extended with priority/tag params. All new DB queries filter by `user_id`. |
| **II. Tool-First Accuracy** | ✅ PASS | MCP `update_task` and `add_task` extended with priority, tags, due_date. New `search_tasks` MCP tool. |
| **III. Agent Behavior Clarity** | ✅ PASS | Agent can interpret "remind me 1 hour before", "tag this as work", "show high priority tasks" via updated tools. |
| **IV. Stateless Reproducibility** | ✅ PASS | Backend remains stateless. Notification and Scheduler services are also stateless — all state in DB and Dapr state store. |
| **V. MCP-Centric Modularity** | ✅ PASS | New services communicate only through Dapr pub/sub — no direct coupling. Frontend remains thin presentation layer. |

**Post-design re-check**: ✅ All gates pass.

**Complexity Tracking** (justified additions):

| Addition | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| 2 new services (notification, scheduler) | Independent scaling of event processing (FR-033) | Background threads in backend violate single-responsibility and FR-033 |
| Dapr sidecar per service | Broker abstraction + service discovery (FR-031, FR-032) | Direct Kafka SDK creates hard broker coupling |
| Redis (Dapr state store) | Idempotency keys + scheduler heartbeats (FR-028, FR-034) | PostgreSQL for coordination data adds unnecessary load to primary DB |

---

## Project Structure

### Documentation (this feature)

```
specs/003-advanced-kafka-dapr/
├── spec.md              ✅ complete
├── plan.md              ✅ this file
├── research.md          ✅ Phase 0 complete
├── data-model.md        ✅ Phase 1 complete
├── quickstart.md        ✅ Phase 1 complete
├── contracts/
│   └── api-contracts.md ✅ Phase 1 complete
└── tasks.md             🔜 /sp.tasks output
```

### Source Code Structure

```
phase-v/
│
├── backend/                            # MODIFIED — existing FastAPI
│   └── app/
│       ├── models/
│       │   ├── todo.py                 # MODIFY — add due_date, priority, recurrence_rule_id, parent_task_id, search_vector
│       │   ├── recurrence.py           # NEW — RecurrenceRule model
│       │   ├── tag.py                  # NEW — Tag + TaskTag models
│       │   ├── reminder.py             # NEW — Reminder model
│       │   ├── notification.py         # NEW — Notification model
│       │   └── domain_event.py         # NEW — DomainEvent audit model
│       ├── api/routes/
│       │   ├── tasks.py                # MODIFY — extended CRUD + search/filter/sort
│       │   ├── tags.py                 # NEW — tag CRUD
│       │   ├── reminders.py            # NEW — reminder CRUD per task
│       │   └── notifications.py        # NEW — list + mark-read
│       ├── services/
│       │   ├── task_service.py         # MODIFY — add priority, tags, recurrence logic
│       │   ├── recurrence_service.py   # NEW — next occurrence calculation
│       │   ├── event_publisher.py      # NEW — Dapr pub/sub publish helper
│       │   └── search_service.py       # NEW — full-text search + filter builder
│       ├── mcp/tools/
│       │   ├── update_task.py          # MODIFY — add priority, tags, due_date params
│       │   ├── add_task.py             # MODIFY — add priority, tags, due_date params
│       │   └── search_tasks.py         # NEW — MCP tool for search/filter
│       └── main.py                     # MODIFY — register new routers
│
├── notification-service/               # NEW microservice
│   ├── app/
│   │   ├── main.py                     # FastAPI app + Dapr subscription endpoint
│   │   ├── subscribers/
│   │   │   └── task_events.py          # Handle task.overdue, reminder.due events
│   │   └── services/
│   │       └── notification_writer.py  # Write to notifications table
│   ├── requirements.txt
│   └── Dockerfile
│
├── scheduler-service/                  # NEW microservice
│   ├── app/
│   │   ├── main.py                     # FastAPI app + APScheduler
│   │   ├── jobs/
│   │   │   ├── overdue_checker.py      # Poll tasks WHERE due_date < NOW() AND NOT completed
│   │   │   └── reminder_dispatcher.py  # Poll reminders WHERE remind_at <= NOW() AND NOT delivered
│   │   └── services/
│   │       └── event_publisher.py      # Dapr pub/sub publish
│   ├── requirements.txt
│   └── Dockerfile
│
├── dapr/
│   └── components/
│       ├── pubsub.yaml                 # Kafka broker via Dapr
│       ├── statestore.yaml             # Redis via Dapr
│       └── subscription.yaml           # notification-service topic subscription
│
├── frontend/                           # MODIFIED — existing Next.js
│   └── app/
│       ├── components/
│       │   ├── todos/
│       │   │   ├── TaskItem.tsx        # MODIFY — priority badge, tags, due date, overdue state
│       │   │   ├── TaskForm.tsx        # MODIFY — priority picker, tag selector, due date, recurrence
│       │   │   └── TaskFilters.tsx     # NEW — search bar, filter panel, sort dropdown
│       │   └── notifications/
│       │       ├── NotificationBell.tsx # NEW — bell icon with unread count badge
│       │       └── NotificationList.tsx # NEW — dropdown with notification items
│       ├── dashboard/page.tsx          # MODIFY — add filters + notification bell
│       ├── tasks/create/page.tsx       # MODIFY — extended form fields
│       └── notifications/page.tsx      # NEW — full notifications page
│
├── helm/todo-app/
│   └── templates/
│       ├── notification-service-deployment.yaml  # NEW
│       ├── notification-service-service.yaml      # NEW
│       ├── scheduler-service-deployment.yaml      # NEW
│       └── scheduler-service-service.yaml         # NEW
│
├── docker-compose.yml                  # MODIFY — add Kafka, Zookeeper, Redis, new services + Dapr sidecars
└── docker-compose.infra.yml            # NEW — infra only (Kafka, Redis, Dapr placement)
```

---

## Architecture Decision Records

📋 **ADR-001: Dapr as broker abstraction over direct Kafka SDK**
- **Decision**: Use Dapr pub/sub component. Application code never imports `kafka-python`.
- **Rationale**: Zero-code broker swap via `pubsub.yaml` config. Satisfies FR-031.
- **Trade-off**: Adds Dapr runtime dependency; ~50ms added latency on pub/sub (acceptable).

📋 **ADR-002: PostgreSQL full-text search over external engine**
- **Decision**: `tsvector`/`tsquery` with GIN index on existing tasks table.
- **Rationale**: Satisfies SC-003 (< 1s/10k tasks). No new infra.
- **Trade-off**: Less powerful fuzzy matching than Elasticsearch. Acceptable at Phase V scale.

📋 **ADR-003: Polling-based in-app notifications (no WebSocket)**
- **Decision**: Frontend polls `GET /notifications?unread=true` every 20 seconds.
- **Rationale**: Satisfies SC-008 (overdue visible within 30s). Preserves Constitution §IV Stateless Reproducibility.
- **Trade-off**: Up to 20-second notification lag. Acceptable for todo app.

📋 **ADR-004: Dedicated Scheduler Service over in-process APScheduler**
- **Decision**: Separate `scheduler-service` container with its own Dapr sidecar.
- **Rationale**: Satisfies FR-033 (independent deployment). Overdue/reminder detection scales independently.
- **Trade-off**: Additional container overhead. Justified by isolation requirement.

---

## Implementation Phases

### Phase 1 — Database & Model Extensions

*Foundation: all new tables, columns, indexes, triggers.*

| Deliverable | Description |
|---|---|
| 9 Alembic migrations | See `data-model.md` migration order |
| `RecurrenceRule` SQLModel | recurrence_rules table |
| `Tag` + `TaskTag` SQLModel | tags + task_tags tables |
| `Reminder` SQLModel | reminders table + pending index |
| `Notification` SQLModel | notifications table + user/unread index |
| `DomainEvent` SQLModel | domain_events audit table |
| Task model extensions | due_date, priority, recurrence_rule_id, parent_task_id, search_vector |
| GIN index + trigger | Full-text search on tasks (title + description) |

**Agent**: `neon-db-ops`

---

### Phase 2 — Backend API Extensions

*New routes + extended task CRUD with all new fields.*

| Deliverable | Endpoints |
|---|---|
| Tags API | GET/POST `/tags`, PUT/DELETE `/tags/{id}` |
| Reminders API | GET/POST `/tasks/{id}/reminders`, DELETE reminder |
| Notifications API | GET `/notifications`, PUT read/read-all |
| Extended Tasks API | PATCH task with priority/tags/due_date/recurrence |
| Extended Tasks List | GET tasks with `q`, `status`, `priority`, `tag`, `sort` params |
| RecurrenceService | `calculate_next_occurrence(rule, current_due)` |
| EventPublisher | `publish(event_type, payload)` via Dapr HTTP |
| SearchService | Build dynamic SQLModel query from filter params + FTS |

**Agent**: `fastapi-backend-owner`

---

### Phase 3 — MCP Tool Updates

*AI agent tools updated to understand new task fields.*

| Deliverable | Changes |
|---|---|
| `add_task` tool | + `priority`, `due_date`, `tag_ids` params |
| `update_task` tool | + `priority`, `due_date`, `tag_ids` params |
| `search_tasks` tool | NEW — `q`, `priority`, `tag`, `status` params |
| Tool docstrings | Natural language examples for each new param |

**Agent**: `fastapi-backend-owner`

---

### Phase 4 — Dapr Infrastructure + New Services

*Dapr config, Notification Service, Scheduler Service, updated Docker Compose.*

| Deliverable | Description |
|---|---|
| `dapr/components/pubsub.yaml` | Kafka topic `task-events` via Dapr |
| `dapr/components/statestore.yaml` | Redis for Dapr state |
| `dapr/components/subscription.yaml` | notification-service subscribes to `task-events` |
| `notification-service/` | FastAPI + Dapr subscription; writes to notifications table |
| `scheduler-service/` | FastAPI + APScheduler; overdue checker + reminder dispatcher |
| `docker-compose.infra.yml` | Kafka, Zookeeper, Redis, Dapr placement |
| `docker-compose.yml` update | Add new services + Dapr sidecars for all 3 app services |

**Agent**: `fastapi-backend-owner`

---

### Phase 5 — Frontend UI Extensions

*Extend existing UI with all new task fields, search/filter, notifications.*

| Deliverable | Description |
|---|---|
| `TaskItem.tsx` update | Priority badge (color-coded), tag chips, due date, overdue highlight |
| `TaskForm.tsx` update | Priority picker, multi-tag selector (autocomplete), date picker, recurrence UI |
| `TaskFilters.tsx` new | Search input, filter panel (status/priority/tag/date range), sort dropdown |
| `NotificationBell.tsx` new | Header bell icon, poll every 20s, unread count badge |
| `NotificationList.tsx` new | Notification dropdown, mark-read on click |
| `notifications/page.tsx` new | Full notification history with pagination |
| API client hooks | `useTags()`, `useNotifications()`, `useTaskSearch(filters)` |

**Agent**: `nextjs-ui-builder`

---

### Phase 6 — Kubernetes Helm Extension

*Extend Phase IV Helm chart for new services.*

| Deliverable | Description |
|---|---|
| Notification Service Helm templates | Deployment + Service with Dapr annotations |
| Scheduler Service Helm templates | Deployment + Service with Dapr annotations |
| `values.yaml` update | Kafka URL, Redis URL, new service images, Dapr component refs |
| Dapr Helm dependency | Add `dapr/dapr` as chart dependency |

**Agent**: `fastapi-backend-owner`

---

## Non-Functional Requirements

### Performance Targets

| Metric | Target | Mechanism |
|---|---|---|
| Full-text search | < 1s / 10k tasks | GIN index + `ts_rank` ordering |
| Multi-filter queries | < 1s (3 filters) | Composite indexes on (user_id, priority), (user_id, due_date) |
| Task API response | < 500ms | Async Dapr publish (fire-and-forget) |
| Reminder delivery | within 60s | Scheduler polls every 30s + 30s buffer |
| Overdue notification visible | within 30s | Scheduler polls 30s + frontend polls 20s |

### Reliability Guarantees

| Guarantee | Mechanism |
|---|---|
| At-least-once delivery | Dapr `RETRY` response from notification consumer |
| Idempotent consumers | Check duplicate `(user_id, task_id, notification_type, date)` before insert |
| Scheduler crash recovery | APScheduler jobs persisted in Dapr state store (Redis) |
| Zero event loss | Kafka 7-day log retention + `domain_events` outbox table as secondary audit |

### Security

| Concern | Approach |
|---|---|
| User isolation on all new routes | JWT validation + path `user_id` matches token subject |
| Dapr inter-service comms | localhost only (port 3500) — Dapr sidecars not externally exposed |
| Kafka ACLs | Producer: backend only. Consumer: notification-service + scheduler-service |

---

## Risk Analysis

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Dapr Python SDK version incompatibility | Medium | High | Pin `dapr==1.13.*`; test `dapr init` before implementation |
| Kafka flakiness in local dev | Medium | Medium | Health checks on kafka container; in-memory Dapr pub/sub for unit tests |
| Alembic migration conflicts with live data | Low | High | All new columns nullable with defaults; run on dev DB first |
| APScheduler missed jobs on restart | Low | Medium | `misfire_grace_time=60s`; last-run timestamps in Dapr state |
| PostgreSQL FTS insufficient for complex queries | Low | Low | FTS covers Phase V scope; Meilisearch path documented in ADR-002 |
