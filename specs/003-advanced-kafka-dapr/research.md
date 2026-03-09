# Research: Advanced Todo Platform — Kafka + Dapr + Advanced Features

**Branch**: `003-advanced-kafka-dapr` | **Phase**: Phase 0 | **Date**: 2026-03-02

---

## 1. Recurring Tasks — Recurrence Rule Representation

**Decision**: Use iCalendar RRULE standard fields stored as a structured DB record (not raw RRULE string).

**Rationale**: iCalendar RRULE is the industry standard (RFC 5545) used by Google Calendar, Outlook, and all major calendar systems. Storing as structured fields (frequency, interval, days_of_week, end_type) keeps the data queryable and portable, while a full RRULE string would require parsing at query time.

**Alternatives considered**:
- Raw RRULE string — simpler to store but unqueryable; parsing overhead on every read.
- Cron expression — developer-friendly but not user-facing; hard to translate to natural language.
- Custom JSON field — flexible but no standard; breaks tool interop.

**Conclusion**: Structured `recurrence_rules` table with fields matching iCalendar semantics. UI layer renders human-readable labels from these fields.

---

## 2. Overdue Detection — Polling vs. Event-Driven

**Decision**: Scheduler Service uses a polling loop (configurable interval, default 60s) to detect overdue tasks and publishes `task.overdue` events via Dapr pub/sub. No real-time WebSocket needed.

**Rationale**: Polling every 60 seconds satisfies SC-008 (overdue visible within 30 seconds — frontend polls notifications endpoint every 20s). True real-time WebSocket adds significant complexity for marginal UX gain in a todo app.

**Alternatives considered**:
- Database cron (pg_cron) — tight coupling to PostgreSQL; not portable to Neon Serverless.
- APScheduler inside backend — violates single-responsibility; scheduler and API would share process.
- Dapr built-in scheduler actor — valid option but in beta; polling service is more stable.

**Conclusion**: Dedicated `scheduler-service` (Python FastAPI) with APScheduler, publishing overdue events through Dapr pub/sub every 60 seconds.

---

## 3. Kafka Integration — Direct vs. Dapr Abstraction

**Decision**: Use Dapr pub/sub component backed by Kafka. Application code uses only the Dapr pub/sub API — never the Kafka client library directly.

**Rationale**: Dapr's pub/sub abstraction allows swapping Kafka for another broker (RabbitMQ, Azure Service Bus) with a single YAML config change and zero application code changes. This satisfies FR-031 and the constitution's MCP-Centric Modularity principle.

**Alternatives considered**:
- `kafka-python` or `confluent-kafka` directly — fast to implement but creates direct broker dependency; violates abstraction goal.
- Redis Streams via Dapr — simpler setup but Kafka is explicitly required per spec.
- Dapr in-memory pub/sub (for dev only) — used for local development only; Kafka for production.

**Dapr pub/sub component config**:
```yaml
# dapr/components/pubsub.yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: task-pubsub
spec:
  type: pubsub.kafka
  version: v1
  metadata:
    - name: brokers
      value: "kafka:9092"
    - name: consumerGroup
      value: "todo-app"
    - name: initialOffset
      value: "newest"
```

---

## 4. Dapr State Store — What Needs Shared State?

**Decision**: Use Dapr state store (Redis) for: notification delivery deduplication keys and scheduler last-run timestamps. Do NOT migrate task data from PostgreSQL to Dapr state.

**Rationale**: Task data is relational and requires ACID guarantees — PostgreSQL is the right store. Dapr state store is best for ephemeral coordination data (idempotency keys, distributed locks, scheduler heartbeats) where eventual consistency is acceptable.

**Alternatives considered**:
- Moving all state to Dapr — over-engineering; loses relational query power.
- PostgreSQL for coordination data — possible but adds load to primary DB for non-critical data.

---

## 5. Search & Filter — Database-Level vs. Search Engine

**Decision**: Use PostgreSQL full-text search (`tsvector`/`tsquery`) with GIN indexes for Phase V. No external search engine required at this scale.

**Rationale**: PostgreSQL full-text search handles 10,000 tasks per user (SC-003) easily. Adding Elasticsearch would be premature optimization and a new infrastructure dependency. The existing Neon Serverless PostgreSQL supports full-text search natively.

**Alternatives considered**:
- Elasticsearch / Meilisearch — powerful but significant infra overhead; justified only at 1M+ records.
- ILIKE queries — simple but not indexed; slow on large datasets.
- Application-level search — filtering in Python after DB fetch; does not scale.

**Implementation**: Add `tsvector` column to `tasks` table, updated via trigger or on write. GIN index on `tsvector`. FastAPI route accepts `q=` parameter and constructs `to_tsquery()`.

---

## 6. Notification Delivery — In-App Architecture

**Decision**: In-app notifications stored in `notifications` table. Frontend polls `GET /api/{user_id}/notifications?unread=true` every 20 seconds. No WebSocket in Phase V.

**Rationale**: Polling every 20 seconds delivers notifications within SC-008's 30-second window. WebSocket would require significant frontend and backend changes (connection management, authentication over WS). Polling is sufficient for a todo app.

**Alternatives considered**:
- Server-Sent Events (SSE) — simpler than WebSocket but still adds stateful connection; overkill for Phase V.
- WebSocket — real-time but adds complexity; out of scope.
- Email — out of scope per spec.

---

## 7. Service Architecture — How Many Services?

**Decision**: Three application services, each with a Dapr sidecar:
1. `backend` (existing FastAPI API) — task CRUD, auth, AI chat
2. `notification-service` (new FastAPI) — subscribes to Kafka events, writes notifications to DB
3. `scheduler-service` (new FastAPI) — runs APScheduler, checks overdue tasks, publishes events

**Rationale**: Splitting into 3 services gives clean separation of concerns and allows independent scaling. Each service has a single responsibility. Adding more services (e.g., separate search service) would be over-engineering.

**Alternatives considered**:
- Single monolith with background threads — simpler but violates FR-033 (independent deployment).
- 4+ microservices (separate search, auth, etc.) — over-engineering for current scale.

---

## 8. Database Migration Strategy

**Decision**: Alembic migrations for all new tables and column additions. Existing `tasks` table extended via `ALTER TABLE ADD COLUMN` with nullable defaults to maintain backward compatibility.

**Key migrations needed**:
1. Add columns to `tasks`: `due_date`, `priority`, `recurrence_rule_id`, `parent_task_id`, `search_vector`
2. Create `recurrence_rules` table
3. Create `tags` table (with unique lower-case index per user)
4. Create `task_tags` junction table
5. Create `reminders` table
6. Create `notifications` table
7. Create `domain_events` audit table
8. Add GIN index on `tasks.search_vector`
9. Add composite indexes: `(user_id, due_date)`, `(user_id, priority)`, `(user_id, completed)`

---

## 9. Dapr Self-Hosted vs. Kubernetes

**Decision**: Dapr self-hosted mode for Docker Compose local development; Dapr on Kubernetes (Helm) for production (extending existing Phase IV Helm charts).

**Local dev**: Each service container runs with a Dapr sidecar container (`daprd`). Dapr placement service runs as a separate container.

**Production**: Dapr Helm chart installed in cluster; sidecar injection via annotations on deployment pods.

---

## 10. Tag Naming — Case Sensitivity

**Decision**: Tags are stored in lowercase, normalized on write. Display uses the stored lowercase form. A unique constraint on `LOWER(name)` per user prevents "Work" and "work" being separate tags.

**Rationale**: Case-insensitive matching (spec assumption) is simplest to enforce at the database level with a functional unique index rather than application-level normalization.
