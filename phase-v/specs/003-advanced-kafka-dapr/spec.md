# Feature Specification: Advanced Todo Platform — Recurring Tasks, Reminders, Priorities, Tags, Search/Filter/Sort, Event-Driven (Kafka + Dapr)

**Feature Branch**: `003-advanced-kafka-dapr`
**Created**: 2026-03-01
**Status**: Draft
**Phase**: Phase V

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Recurring Tasks (Priority: P1)

A user wants to create tasks that repeat automatically on a schedule — daily standups, weekly reports, monthly billing reviews — without having to re-enter them manually each time.

**Why this priority**: Recurring tasks are the most-requested advanced feature. They directly reduce repetitive user effort and form the backbone of habit-tracking and routine workflows.

**Independent Test**: Can be fully tested by creating a recurring task, marking it complete, and verifying the next occurrence is automatically generated with the correct due date.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they create a task with recurrence set to "Daily", **Then** the task reappears every day at the same time after completion.
2. **Given** a recurring task with "Weekly on Monday" recurrence, **When** the user completes it, **Then** a new instance is created for the next Monday.
3. **Given** a recurring task, **When** the user edits the recurrence rule, **Then** all future occurrences update but past completed tasks remain unchanged.
4. **Given** a recurring task with an end date, **When** that end date passes, **Then** no new occurrences are generated.
5. **Given** a user who deletes a recurring task, **When** they choose "delete this and all future", **Then** all upcoming instances are removed but completed instances remain in history.

---

### User Story 2 — Due Dates & Reminders (Priority: P1)

A user wants to assign a due date to a task and receive a notification/reminder before it is due, so they never miss an important deadline.

**Why this priority**: Due dates and reminders are essential to any task management system. Without them, tasks lack urgency and accountability.

**Independent Test**: Can be tested by creating a task with a due date 1 minute in the future, verifying a reminder notification appears at the right time, and confirming the task is visually marked overdue after the deadline passes.

**Acceptance Scenarios**:

1. **Given** a task, **When** a user assigns a due date and reminder time, **Then** a reminder event is scheduled.
2. **Given** a scheduled reminder, **When** the reminder time arrives, **Then** the user receives a notification in the application.
3. **Given** a task past its due date, **When** a user views their task list, **Then** the overdue task is visually distinguished (e.g., highlighted in red or with an overdue badge).
4. **Given** a user updates a task's due date, **When** the new due date is saved, **Then** any existing reminder is rescheduled to reflect the new date.
5. **Given** a completed task, **When** the due date passes, **Then** no reminder notification is sent.

---

### User Story 3 — Priorities (Priority: P2)

A user wants to mark tasks as High, Medium, or Low priority so they can focus on what matters most.

**Why this priority**: Priority tagging helps users triage their workload. It is a quick-win intermediate feature that integrates naturally with sorting and filtering.

**Independent Test**: Can be tested by creating three tasks with different priorities, then sorting by priority and verifying the order: High → Medium → Low.

**Acceptance Scenarios**:

1. **Given** a new task, **When** a user sets its priority to "High", **Then** the task displays a High-priority indicator.
2. **Given** a list of tasks with mixed priorities, **When** the user sorts by priority descending, **Then** tasks appear in order: High, Medium, Low, None.
3. **Given** a filter applied for "High priority only", **When** the user views the task list, **Then** only High-priority tasks are visible.
4. **Given** a task with priority "Low", **When** the user edits it to "High", **Then** the change is immediately reflected in the list.

---

### User Story 4 — Tags & Labels (Priority: P2)

A user wants to organize tasks using custom tags (e.g., "work", "personal", "urgent") to group and filter related tasks across different projects.

**Why this priority**: Tags provide flexible, user-defined categorization without rigid folder structures. They complement priorities and power the filtering system.

**Independent Test**: Can be tested by creating tasks with overlapping tags, applying a tag filter, and confirming only tagged tasks appear.

**Acceptance Scenarios**:

1. **Given** a task, **When** a user adds a tag "work", **Then** the tag appears on the task card.
2. **Given** a task, **When** a user adds multiple tags ("work", "urgent"), **Then** all tags are stored and displayed.
3. **Given** a tag filter set to "personal", **When** the user views the task list, **Then** only tasks with the "personal" tag are shown.
4. **Given** an existing tag, **When** a user renames the tag globally, **Then** all tasks with that tag reflect the new name.
5. **Given** a tag with no associated tasks, **When** the user views the tag list, **Then** the empty tag is still visible and manageable.

---

### User Story 5 — Search, Filter & Sort (Priority: P2)

A user wants to search tasks by keyword, filter by status/priority/tag/due date, and sort results by different criteria to quickly find the tasks they need.

**Why this priority**: Search, filter, and sort are the primary discoverability tools. As task volume grows, they become essential for usability.

**Independent Test**: Can be tested independently by running a keyword search, applying a multi-criterion filter, and verifying sort order — each without the other features being required.

**Acceptance Scenarios**:

1. **Given** a search term entered by the user, **When** the search executes, **Then** only tasks whose title or description contain the term are displayed.
2. **Given** a filter by status "Completed", **When** applied, **Then** only completed tasks appear.
3. **Given** filters for both "High priority" AND "work tag", **When** combined, **Then** only tasks matching ALL criteria are shown.
4. **Given** tasks with different due dates, **When** sorted by "Due Date (Earliest first)", **Then** tasks appear in ascending due date order.
5. **Given** an active search or filter, **When** the user clears it, **Then** the full unfiltered task list is restored.
6. **Given** a search with no matching results, **When** displayed, **Then** an empty state message guides the user.

---

### User Story 6 — Event-Driven Notifications via Kafka (Priority: P3)

A user's action (create, complete, or overdue task) automatically triggers downstream events — such as email reminders, push notifications, or audit logs — without slowing down the main application response.

**Why this priority**: Event-driven architecture decouples the core todo operations from side-effects. Users get a faster, more reliable experience while the system handles notifications and integrations asynchronously.

**Independent Test**: Can be tested by creating a task with a due date, verifying that a reminder notification is delivered asynchronously without blocking the task creation response.

**Acceptance Scenarios**:

1. **Given** a task is created, **When** the task creation completes, **Then** a "task.created" event is published and the response is returned immediately (not waiting for notification delivery).
2. **Given** a task is marked complete, **When** the completion is saved, **Then** a "task.completed" event is published for downstream consumers.
3. **Given** a task's due date has passed and it is still incomplete, **When** the system checks, **Then** a "task.overdue" event is published and the user receives a notification.
4. **Given** an event consumer is temporarily unavailable, **When** it recovers, **Then** it processes all queued events without loss.
5. **Given** a high volume of simultaneous task events, **When** published, **Then** the system queues and processes them without data loss or degraded main-app performance.

---

### User Story 7 — Distributed Runtime with Dapr (Priority: P3)

The system runs as multiple cooperating services (API, notification service, scheduler) where each service can be developed, deployed, and scaled independently without tight coupling.

**Why this priority**: Dapr provides service-to-service discovery, state management, and pub/sub abstraction. It future-proofs the platform for horizontal scaling and makes swapping infrastructure components (e.g., switching from Kafka to another broker) possible without rewriting application logic.

**Independent Test**: Can be tested by stopping one service and verifying that other services continue operating, and that the stopped service reconnects and catches up when restarted.

**Acceptance Scenarios**:

1. **Given** multiple services running, **When** the notification service is restarted, **Then** the API service continues to function and pending notifications are eventually delivered.
2. **Given** a service-to-service call between API and notification service, **When** it occurs, **Then** it uses the distributed runtime's service invocation (no hardcoded URLs or direct HTTP coupling).
3. **Given** a pub/sub event published by the API service, **When** received by the scheduler service, **Then** it triggers the appropriate action (e.g., schedule a reminder).
4. **Given** distributed state for task metadata, **When** read by different service instances, **Then** all instances see consistent state.

---

### Edge Cases

- What happens when a recurring task's schedule conflicts with a user-defined time zone offset?
- How does the system handle a reminder notification when the user's session is offline?
- What if a user adds 50+ tags to a single task?
- What happens to reminders when a task due date is set in the past?
- How does the system behave when Kafka is temporarily unavailable — does the application degrade gracefully or halt?
- What if the same event is delivered twice (duplicate event) — does the consumer handle idempotency?
- What happens if a recurring task is edited while an instance is already past due?

---

## Requirements *(mandatory)*

### Functional Requirements

#### Recurring Tasks

- **FR-001**: System MUST allow users to create tasks with a recurrence rule (Daily, Weekly, Monthly, Custom interval).
- **FR-002**: System MUST automatically generate the next task occurrence upon completion of a recurring task.
- **FR-003**: System MUST allow users to edit recurrence rules; changes MUST apply to future occurrences only.
- **FR-004**: System MUST allow users to delete a single occurrence or all future occurrences of a recurring task.
- **FR-005**: System MUST support a recurrence end condition (never, on a specific date, or after N occurrences).
- **FR-006**: System MUST preserve completed instances in task history even after the parent recurrence rule is deleted.

#### Due Dates & Reminders

- **FR-007**: System MUST allow users to assign a due date and optional time to any task.
- **FR-008**: System MUST allow users to set one or more reminder offsets before the due date (e.g., 1 hour before, 1 day before).
- **FR-009**: System MUST deliver reminder notifications to the user at the scheduled time via in-app notification.
- **FR-010**: System MUST visually mark tasks as "Overdue" when the due date has passed and the task is incomplete.
- **FR-011**: System MUST NOT send reminders for tasks that have already been completed.
- **FR-012**: System MUST reschedule reminders automatically when the task due date is updated.

#### Priorities

- **FR-013**: System MUST support four priority levels: High, Medium, Low, and None (default).
- **FR-014**: System MUST allow users to set or change priority on any task at any time.
- **FR-015**: System MUST display a priority indicator on each task card.

#### Tags

- **FR-016**: System MUST allow users to create, assign, and remove custom tags on tasks.
- **FR-017**: System MUST allow multiple tags per task (no hard upper limit within reason).
- **FR-018**: System MUST allow users to rename or delete tags globally; deletion MUST remove the tag from all associated tasks.
- **FR-019**: System MUST provide a tag management view showing all tags and their task counts.

#### Search, Filter & Sort

- **FR-020**: System MUST provide full-text search across task title and description.
- **FR-021**: System MUST support filtering by: status (open/completed/overdue), priority, tag, due date range, and recurrence type.
- **FR-022**: System MUST support combining multiple filters simultaneously (AND logic).
- **FR-023**: System MUST support sorting by: due date, priority, creation date, and alphabetical title.
- **FR-024**: System MUST display an empty-state message when no tasks match the search or filter criteria.
- **FR-025**: System MUST persist the user's last-used filter and sort preferences within a session.

#### Event-Driven Architecture

- **FR-026**: System MUST publish domain events for all significant task lifecycle transitions: task.created, task.updated, task.completed, task.deleted, task.overdue.
- **FR-027**: System MUST process reminder and overdue notifications asynchronously — the main task API response MUST NOT wait for notification delivery.
- **FR-028**: System MUST guarantee at-least-once delivery of events; consumers MUST be idempotent.
- **FR-029**: System MUST queue events durably so they survive service restarts without data loss.
- **FR-030**: System MUST expose a notification consumer service that subscribes to relevant events and delivers in-app notifications.

#### Distributed Runtime (Dapr)

- **FR-031**: System MUST use the distributed runtime's pub/sub abstraction for all inter-service event publishing and consumption.
- **FR-032**: System MUST use the distributed runtime's service invocation for all synchronous cross-service calls (no hardcoded URLs).
- **FR-033**: System MUST allow individual services (API, notification, scheduler) to be deployed and scaled independently.
- **FR-034**: System MUST use the distributed runtime's state store for any shared state that must be consistent across service instances.
- **FR-035**: System MUST handle partial failures gracefully — if the notification service is down, the API service MUST continue to operate and queue events.

---

### Key Entities

- **Task**: Core entity extended with new fields — due date, reminder offsets, recurrence rule, priority level, and associated tags.
- **RecurrenceRule**: Defines the pattern for repeating tasks — frequency, interval, days of week, end condition. Linked to a parent task.
- **Reminder**: A scheduled notification linked to a task, with delivery time, delivery status, and recipient user.
- **Tag**: A user-defined label with a name and color. Many-to-many relationship with tasks (per user).
- **DomainEvent**: A published message representing a task lifecycle transition — event type, payload, timestamp, producer service, correlation ID.
- **Notification**: An in-app message delivered to a user — content, read status, related task, delivery timestamp.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a recurring task and verify the next occurrence appears automatically within 5 seconds of completing the current one.
- **SC-002**: Users receive reminder notifications within 60 seconds of the scheduled reminder time under normal conditions.
- **SC-003**: Task list search returns results within 1 second for a dataset of up to 10,000 tasks per user.
- **SC-004**: Applying up to 3 simultaneous filters returns results within 1 second.
- **SC-005**: All task lifecycle events (create, complete, delete) are published and consumed asynchronously — the user-facing task operation completes in under 500ms regardless of notification processing time.
- **SC-006**: The system continues to accept and store tasks even when the notification service is unavailable, with zero data loss.
- **SC-007**: 95% of users can assign a due date, priority, and tags to a task within 30 seconds on first use (discoverability standard).
- **SC-008**: Overdue tasks are visually identifiable without any user action within 30 seconds of the deadline passing.
- **SC-009**: Individual services can be restarted independently without causing downtime for other services (measured by uptime during rolling restarts).
- **SC-010**: All published domain events are durably stored and survive a service crash — zero event loss on restart.

---

## Assumptions

- Users are already authenticated via the existing Better Auth/JWT system; no new auth flows are required for this feature set.
- In-app notifications are the primary delivery channel; email/SMS notifications are out of scope for this phase.
- Recurrence rules follow the iCalendar RRULE standard for compatibility.
- Time zones are stored per user and applied when evaluating due dates and reminder times.
- The event broker (Kafka) and distributed runtime (Dapr) are infrastructure concerns managed via configuration; the application code depends only on the abstraction layer provided by Dapr.
- Search is scoped to the authenticated user's own tasks only.
- Tag names are case-insensitive and trimmed of whitespace.

---

## Out of Scope

- Email or SMS reminder delivery (in-app only for this phase).
- Calendar integrations (Google Calendar, Outlook sync).
- Shared/collaborative tasks across multiple users.
- Mobile push notifications (native mobile app not in scope).
- Machine learning-based task suggestions or auto-prioritization.
- Real-time collaborative editing of tasks.
