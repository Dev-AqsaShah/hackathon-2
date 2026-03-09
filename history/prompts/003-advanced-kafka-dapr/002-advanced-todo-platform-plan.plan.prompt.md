---
id: "002"
title: Advanced Todo Platform Architecture Plan
stage: plan
date: 2026-03-02
surface: agent
model: claude-sonnet-4-6
feature: 003-advanced-kafka-dapr
branch: 003-advanced-kafka-dapr
user: Aqsa Shah
command: /sp.plan
labels: ["plan", "architecture", "kafka", "dapr", "microservices", "recurring-tasks", "notifications", "search", "adr"]
links:
  spec: specs/003-advanced-kafka-dapr/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/003-advanced-kafka-dapr/plan.md
  - specs/003-advanced-kafka-dapr/research.md
  - specs/003-advanced-kafka-dapr/data-model.md
  - specs/003-advanced-kafka-dapr/quickstart.md
  - specs/003-advanced-kafka-dapr/contracts/api-contracts.md
  - phase-v/specs/003-advanced-kafka-dapr/plan.md
  - phase-v/specs/003-advanced-kafka-dapr/research.md
  - phase-v/specs/003-advanced-kafka-dapr/data-model.md
  - phase-v/specs/003-advanced-kafka-dapr/quickstart.md
  - phase-v/specs/003-advanced-kafka-dapr/contracts/api-contracts.md
tests:
  - Constitution Check: all 5 principles PASS
  - Complexity Tracking: 3 justified additions documented
---

## Prompt

/sp.plan

## Response snapshot

Generated complete architectural plan for `003-advanced-kafka-dapr` including:

**Phase 0 — Research (research.md)**: 10 research decisions resolved:
1. iCalendar RRULE structured DB fields (not raw string)
2. Scheduler Service polling (60s) over real-time WebSocket
3. Dapr pub/sub abstraction over direct Kafka SDK
4. Redis Dapr state store for coordination (not PostgreSQL)
5. PostgreSQL full-text search (GIN/tsvector) over Elasticsearch
6. Frontend polling every 20s for notifications (not WebSocket/SSE)
7. 3 application services (backend, notification-service, scheduler-service)
8. Alembic migration strategy (9 migrations, backward-compatible)
9. Dapr self-hosted (local) + Kubernetes Helm (production)
10. Case-insensitive tags via functional unique index

**Phase 1 — Design (data-model.md, contracts/, quickstart.md)**:
- 7 tables: tasks (extended), recurrence_rules, tags, task_tags, reminders, notifications, domain_events
- 9 Alembic migrations with ordering
- Full API contracts for tasks/tags/reminders/notifications (REST + Dapr pub/sub schemas)
- Quickstart guide with Dapr init, Docker Compose, service startup commands

**plan.md**:
- 4 ADRs: Dapr abstraction, PostgreSQL FTS, polling notifications, dedicated scheduler service
- 6 implementation phases with agent delegation
- Constitution Check: all 5 principles PASS
- Performance targets, reliability guarantees, security, risk analysis

## Outcome

- ✅ Impact: Complete Phase V architectural plan — 5 artifacts generated covering research, data model, contracts, quickstart, and main plan
- 🧪 Tests: Constitution Check gates — all 5 PASS; Complexity Tracking — 3 justified additions
- 📁 Files: 5 artifacts in specs/003-advanced-kafka-dapr/ (synced to phase-v/specs/)
- 🔁 Next prompts: `/sp.tasks` — break plan into actionable, testable implementation tasks
- 🧠 Reflection: Kafka + Dapr introduces infra complexity but Dapr abstraction keeps application code clean. Polling strategy simplifies architecture while meeting all success criteria.

## Evaluation notes (flywheel)

- Failure modes observed: update-agent-context.ps1 looks for templates at git root (D:/hackathon-2/.specify) instead of phase-v/.specify — minor, non-blocking
- Graders run and results (PASS/FAIL): Constitution Check — PASS (5/5); Complexity Tracking — PASS (3 justified entries)
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Run sp.tasks to validate phase breakdown granularity
