---
description: "Implementation tasks for Todo Backend API"
---

# Tasks: Todo Full-Stack Web Application — Backend & API

**Input**: Design documents from `/specs/001-todo-api-backend/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/todo-api.yaml

**Tests**: This feature does NOT explicitly request tests in the specification. Test tasks are excluded per workflow guidelines.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- **File paths**: All paths relative to `backend/` directory

## Path Conventions

- **Backend**: `backend/app/` (existing FastAPI application)
- **Models**: `backend/app/models/`
- **Schemas**: `backend/app/schemas/`
- **Services**: `backend/app/services/`
- **Routes**: `backend/app/api/routes/`
- **Migrations**: `backend/alembic/versions/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify existing infrastructure and prepare for task implementation

**Status**: ✅ Partially complete - backend exists with auth infrastructure

- [ ] T001 Verify backend dependencies installed (requirements.txt: FastAPI, SQLModel, python-jose, asyncpg, alembic)
- [ ] T002 [P] Verify database connection to Neon PostgreSQL (test DATABASE_URL from .env)
- [ ] T003 [P] Verify JWT authentication infrastructure exists (core/security.py, api/deps.py)
- [ ] T004 Review existing User model in backend/app/models/user.py for compatibility

**Checkpoint**: Infrastructure verified - ready for schema and service implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core schema and infrastructure that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Schema

- [ ] T005 Review existing Todo model in backend/app/models/todo.py against spec requirements
- [ ] T006 Create Alembic migration 002 to rename `todos` table to `tasks` in backend/alembic/versions/002_rename_todos_to_tasks.py
- [ ] T007 Update model class name from Todo to Task in backend/app/models/todo.py (rename file to task.py)
- [ ] T008 Verify Task model fields match spec: id, title(1000), description(5000), completed, owner_id, created_at, updated_at
- [ ] T009 Add check constraint for non-empty title in migration 002
- [ ] T010 Verify index on owner_id exists in migration 002
- [ ] T011 Run migration: `alembic upgrade head` and verify tasks table created

### Request/Response Schemas

- [ ] T012 [P] Create TaskCreate schema in backend/app/schemas/task.py with title (required, 1-1000 chars) and description (optional, 0-5000 chars)
- [ ] T013 [P] Create TaskUpdate schema in backend/app/schemas/task.py with optional title and description
- [ ] T014 [P] Create TaskResponse schema in backend/app/schemas/task.py with all fields (id, title, description, completed, owner_id, created_at, updated_at)
- [ ] T015 Add Pydantic field validators to TaskCreate: min_length=1, max_length=1000 for title
- [ ] T016 Add Config examples to all schemas for OpenAPI documentation

### Service Layer Foundation

- [ ] T017 Create services directory: backend/app/services/
- [ ] T018 Create task_service.py in backend/app/services/ with async function stubs
- [ ] T019 Implement validate_ownership(task: Task, user_id: int) -> None in task_service.py (raises 403 if mismatch)

**Checkpoint**: Foundation ready - user stories can now be implemented independently

---

## Phase 3: User Story 1 - Secure Task Retrieval with User Isolation (Priority: P1) 🎯 MVP

**Goal**: Enable authenticated users to retrieve only their own tasks through the API with strict user isolation

**Independent Test**: Create users with different JWT tokens, add tasks for each user, verify GET /api/{user_id}/tasks returns only authenticated user's tasks and rejects unauthorized access

**Acceptance Criteria**:
- GET /api/{user_id}/tasks with valid JWT and matching user_id returns 200 with user's tasks only
- GET /api/{user_id}/tasks with mismatched user_id returns 403 Forbidden
- GET /api/{user_id}/tasks without JWT returns 401 Unauthorized
- GET /api/{user_id}/tasks with invalid JWT returns 401 Unauthorized

### Implementation for User Story 1

- [ ] T020 [US1] Implement get_user_tasks(session, user_id) in backend/app/services/task_service.py to query tasks filtered by owner_id
- [ ] T021 [US1] Create tasks router in backend/app/api/routes/tasks.py with APIRouter()
- [ ] T022 [US1] Implement GET /api/{user_id}/tasks endpoint in backend/app/api/routes/tasks.py
- [ ] T023 [US1] Inject CurrentUser dependency in GET endpoint (from api/deps.py)
- [ ] T024 [US1] Add path user_id validation: raise 403 if path user_id != JWT user_id
- [ ] T025 [US1] Call task_service.get_user_tasks() and return List[TaskResponse]
- [ ] T026 [US1] Add OpenAPI documentation to GET endpoint (summary, description, responses)
- [ ] T027 [US1] Register tasks router in backend/app/main.py with prefix "/api/{user_id}"

**Checkpoint**: User Story 1 complete - users can retrieve their task lists securely

---

## Phase 4: User Story 2 - Task Creation and Validation (Priority: P1)

**Goal**: Enable authenticated users to create new tasks with proper validation

**Independent Test**: Authenticate as a user, submit POST /api/{user_id}/tasks with valid and invalid payloads, verify task persistence in database

**Acceptance Criteria**:
- POST /api/{user_id}/tasks with valid title returns 201 Created with full task object
- POST /api/{user_id}/tasks without title returns 422 Unprocessable Entity
- POST /api/{user_id}/tasks with mismatched user_id returns 403 Forbidden
- Created task appears in GET /api/{user_id}/tasks list

### Implementation for User Story 2

- [ ] T028 [P] [US2] Implement create_task(session, data: TaskCreate, owner_id: int) in backend/app/services/task_service.py
- [ ] T029 [P] [US2] Set created_at and updated_at timestamps automatically in create_task()
- [ ] T030 [P] [US2] Set completed=False by default in create_task()
- [ ] T031 [US2] Implement POST /api/{user_id}/tasks endpoint in backend/app/api/routes/tasks.py
- [ ] T032 [US2] Inject CurrentUser dependency and validate path user_id matches JWT
- [ ] T033 [US2] Accept TaskCreate request body and validate with Pydantic
- [ ] T034 [US2] Call task_service.create_task() with authenticated owner_id
- [ ] T035 [US2] Return 201 Created status code with TaskResponse body
- [ ] T036 [US2] Add OpenAPI documentation to POST endpoint

**Checkpoint**: User Story 2 complete - users can create tasks with validation

---

## Phase 5: User Story 5 - Individual Task Retrieval (Priority: P3)

**Goal**: Enable authenticated users to retrieve a single task by ID

**Note**: Implemented before US3/US4 because it's a prerequisite for update/delete operations

**Independent Test**: Create a task and retrieve it via GET /api/{user_id}/tasks/{id}

**Acceptance Criteria**:
- GET /api/{user_id}/tasks/{id} with owned task returns 200 with task details
- GET /api/{user_id}/tasks/{id} for another user's task returns 403 Forbidden
- GET /api/{user_id}/tasks/{id} for non-existent task returns 404 Not Found

### Implementation for User Story 5

- [ ] T037 [P] [US5] Implement get_task_by_id(session, task_id: int, user_id: int) in backend/app/services/task_service.py
- [ ] T038 [P] [US5] Add ownership validation in get_task_by_id: raise 404 if not found, 403 if wrong owner
- [ ] T039 [US5] Implement GET /api/{user_id}/tasks/{id} endpoint in backend/app/api/routes/tasks.py
- [ ] T040 [US5] Inject CurrentUser dependency and validate path user_id
- [ ] T041 [US5] Call task_service.get_task_by_id() with task_id and authenticated user_id
- [ ] T042 [US5] Return 200 OK with TaskResponse body
- [ ] T043 [US5] Add OpenAPI documentation to GET single task endpoint

**Checkpoint**: User Story 5 complete - users can retrieve individual task details

---

## Phase 6: User Story 3 - Task Updates and Completion Toggle (Priority: P2)

**Goal**: Enable authenticated users to update tasks and toggle completion status

**Independent Test**: Create a task, use PUT /api/{user_id}/tasks/{id} and PATCH /api/{user_id}/tasks/{id}/complete endpoints, verify changes persist

**Acceptance Criteria**:
- PUT /api/{user_id}/tasks/{id} with updated data returns 200 with updated task
- PATCH /api/{user_id}/tasks/{id}/complete toggles completed status and returns 200
- PUT/PATCH on another user's task returns 403 Forbidden
- PUT/PATCH on non-existent task returns 404 Not Found

### Implementation for User Story 3

- [ ] T044 [P] [US3] Implement update_task(session, task_id, data: TaskUpdate, user_id) in backend/app/services/task_service.py
- [ ] T045 [P] [US3] Auto-update updated_at timestamp in update_task()
- [ ] T046 [P] [US3] Handle partial updates (title-only, description-only, or both) in update_task()
- [ ] T047 [P] [US3] Implement toggle_task_completion(session, task_id, user_id) in backend/app/services/task_service.py
- [ ] T048 [P] [US3] Flip completed boolean and update updated_at in toggle_task_completion()
- [ ] T049 [US3] Implement PUT /api/{user_id}/tasks/{id} endpoint in backend/app/api/routes/tasks.py
- [ ] T050 [US3] Inject CurrentUser, validate path user_id, accept TaskUpdate body
- [ ] T051 [US3] Call task_service.update_task() and return 200 with TaskResponse
- [ ] T052 [US3] Implement PATCH /api/{user_id}/tasks/{id}/complete endpoint in backend/app/api/routes/tasks.py
- [ ] T053 [US3] PATCH endpoint takes no request body, only toggles state
- [ ] T054 [US3] Call task_service.toggle_task_completion() and return 200 with TaskResponse
- [ ] T055 [US3] Add OpenAPI documentation to both PUT and PATCH endpoints

**Checkpoint**: User Story 3 complete - users can update and complete tasks

---

## Phase 7: User Story 4 - Task Deletion (Priority: P2)

**Goal**: Enable authenticated users to delete their tasks

**Independent Test**: Create a task, delete it via DELETE /api/{user_id}/tasks/{id}, verify it no longer appears in task list

**Acceptance Criteria**:
- DELETE /api/{user_id}/tasks/{id} for owned task returns 204 No Content
- DELETE /api/{user_id}/tasks/{id} for another user's task returns 403 Forbidden
- DELETE /api/{user_id}/tasks/{id} for non-existent task returns 404 Not Found
- Deleted task does not appear in GET /api/{user_id}/tasks list

### Implementation for User Story 4

- [ ] T056 [US4] Implement delete_task(session, task_id, user_id) in backend/app/services/task_service.py
- [ ] T057 [US4] Verify ownership before deletion in delete_task() (raise 403/404)
- [ ] T058 [US4] Implement DELETE /api/{user_id}/tasks/{id} endpoint in backend/app/api/routes/tasks.py
- [ ] T059 [US4] Inject CurrentUser and validate path user_id
- [ ] T060 [US4] Call task_service.delete_task()
- [ ] T061 [US4] Return 204 No Content status (no response body)
- [ ] T062 [US4] Add OpenAPI documentation to DELETE endpoint

**Checkpoint**: User Story 4 complete - users can delete tasks

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements, documentation, and production readiness

**Dependencies**: All user stories (US1-US5) must be complete before this phase

### Error Handling

- [ ] T063 [P] Review all HTTPException usages for consistent error messages
- [ ] T064 [P] Verify all error responses include `detail` field
- [ ] T065 [P] Add 500 Internal Server Error handler in backend/app/main.py
- [ ] T066 [P] Add database connection error handler (return 503 Service Unavailable)
- [ ] T067 Verify Pydantic validation errors return 422 with field-level details

### OpenAPI Documentation

- [ ] T068 [P] Configure OpenAPI metadata in backend/app/main.py (title, description, version)
- [ ] T069 [P] Add OpenAPI tags to group endpoints ("Tasks")
- [ ] T070 [P] Verify all endpoints have response_model and status_code decorators
- [ ] T071 [P] Add security scheme documentation (Bearer JWT) to OpenAPI
- [ ] T072 Test /docs endpoint renders correctly with all endpoints visible
- [ ] T073 Test /redoc endpoint renders documentation
- [ ] T074 Export OpenAPI schema: `curl http://localhost:8000/openapi.json > specs/001-todo-api-backend/contracts/todo-api-generated.json`

### Performance & Configuration

- [ ] T075 [P] Verify connection pooling settings in backend/app/core/database.py (pool_size=5, max_overflow=10)
- [ ] T076 [P] Add pool_pre_ping=True and pool_recycle=3600 to async engine config
- [ ] T077 [P] Verify all environment variables loaded from .env (no hardcoded values)
- [ ] T078 [P] Add structured logging (JSON format) for production
- [ ] T079 Verify DEBUG=False works correctly (SQL queries not logged)

### Integration Verification

- [ ] T080 Manual test: Create user 1 JWT token, create tasks, verify retrieval
- [ ] T081 Manual test: Create user 2 JWT token, verify cannot see user 1's tasks (403)
- [ ] T082 Manual test: Test all CRUD operations for single user (create, read, update, toggle, delete)
- [ ] T083 Manual test: Test missing JWT returns 401 on all endpoints
- [ ] T084 Manual test: Test invalid JWT returns 401 on all endpoints
- [ ] T085 Manual test: Test validation errors (empty title, oversized strings) return 422
- [ ] T086 Verify all tasks persist to Neon database (query directly via psql)

### Documentation

- [ ] T087 [P] Update backend/README.md with API overview
- [ ] T088 [P] Document environment variables in backend/README.md
- [ ] T089 [P] Add deployment instructions to backend/README.md
- [ ] T090 [P] Add example curl commands to backend/README.md

**Checkpoint**: All user stories complete, API production-ready

---

## Dependencies & Execution Strategy

### User Story Dependency Graph

```
Phase 1 (Setup) → Phase 2 (Foundational)
                        ↓
     ┌──────────────────┼──────────────────┐
     ↓                  ↓                  ↓
  Phase 3 (US1)    Phase 4 (US2)    Phase 5 (US5)
  Task Retrieval   Task Creation    Single Task
                                         ↓
                        ┌────────────────┼────────────────┐
                        ↓                                 ↓
                   Phase 6 (US3)                    Phase 7 (US4)
                   Task Updates                     Task Deletion
                        ↓                                 ↓
                        └────────────────┬────────────────┘
                                         ↓
                                   Phase 8 (Polish)
```

**Dependency Rules**:
1. **Phase 1 & 2**: MUST complete before any user story
2. **US1, US2**: Can be implemented in parallel (independent)
3. **US5**: Can be implemented in parallel with US1/US2
4. **US3, US4**: Depend on US5 (need get_task_by_id for ownership validation)
5. **Phase 8**: Requires all user stories complete

### Parallel Execution Opportunities

**After Phase 2 completes, these can run in parallel**:

**Batch 1** (Independent):
- US1: T020-T027 (Task Retrieval)
- US2: T028-T036 (Task Creation)
- US5: T037-T043 (Single Task Retrieval)

**Batch 2** (After Batch 1):
- US3: T044-T055 (Task Updates & Toggle)
- US4: T056-T062 (Task Deletion)

**Batch 3** (After Batch 2):
- Polish: T063-T090 (Error handling, docs, testing)

### Implementation Strategy

**MVP Scope (Minimum Viable Product)**:
- Phase 1: Setup ✅ (Already exists)
- Phase 2: Foundational (T005-T019)
- Phase 3: User Story 1 - Task Retrieval (T020-T027)
- Phase 4: User Story 2 - Task Creation (T028-T036)

**Recommended**: Implement MVP first, verify it works end-to-end, then add US3-US5 incrementally.

**Full Feature Scope**: All phases (T001-T090)

---

## Task Summary

**Total Tasks**: 90
- **Phase 1 (Setup)**: 4 tasks (T001-T004)
- **Phase 2 (Foundational)**: 15 tasks (T005-T019)
- **Phase 3 (US1 - Task Retrieval)**: 8 tasks (T020-T027) - P1
- **Phase 4 (US2 - Task Creation)**: 9 tasks (T028-T036) - P1
- **Phase 5 (US5 - Single Task)**: 7 tasks (T037-T043) - P3
- **Phase 6 (US3 - Updates/Toggle)**: 12 tasks (T044-T055) - P2
- **Phase 7 (US4 - Deletion)**: 7 tasks (T056-T062) - P2
- **Phase 8 (Polish)**: 28 tasks (T063-T090)

**Parallelizable Tasks**: 42 tasks marked with [P]

**MVP Task Count**: 36 tasks (T001-T036 for US1 and US2)

**Independent User Stories**:
- US1 and US2 can be implemented in any order after Phase 2
- US3 and US4 require US5 (dependency on get_task_by_id)
- US5 is independent and can be done early

---

## Validation Checklist

Before marking feature complete, verify:

- [ ] All 6 API endpoints operational (GET list, POST, GET single, PUT, DELETE, PATCH)
- [ ] JWT authentication enforced on every endpoint
- [ ] User data isolation verified (multi-user test with different JWT tokens)
- [ ] Database migrations applied (tasks table exists with correct schema)
- [ ] All error scenarios return correct status codes (401, 403, 404, 422, 500, 503)
- [ ] Pydantic validation rejects invalid payloads
- [ ] OpenAPI documentation accessible at /docs and /redoc
- [ ] All environment variables configured (DATABASE_URL, BETTER_AUTH_SECRET, CORS_ORIGINS)
- [ ] Connection pooling configured for Neon Serverless
- [ ] All functional requirements from spec.md satisfied (FR-001 through FR-025)

---

## Next Steps

1. ✅ Tasks generated (this document)
2. ⏭️ Execute implementation via `/sp.implement`
3. ⏭️ Follow MVP-first strategy (Phase 1-4 first)
4. ⏭️ Validate US1 and US2 work independently
5. ⏭️ Add US3-US5 incrementally
6. ⏭️ Complete Phase 8 polish for production readiness
