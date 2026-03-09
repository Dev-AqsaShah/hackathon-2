# Tasks: Todo Full-Stack Web Application (Phase-2)

**Input**: Design documents from `/specs/001-todo-fullstack-web/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-spec.yaml

**Tests**: Tests are NOT included in this task list per feature specification (future phase).

**Organization**: Tasks are grouped by user story (P1-P6) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5, US6)
- All tasks include exact file paths

## Path Conventions

This is a web application with:
- **Backend**: `backend/` (Python FastAPI)
- **Frontend**: `frontend/` (Next.js TypeScript)
- Paths reflect the structure defined in plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for both frontend and backend

### Backend Setup

- [ ] T001 Create backend directory structure per plan.md (backend/app/models, backend/app/schemas, backend/app/api, backend/app/core, backend/alembic)
- [ ] T002 Initialize Python project with requirements.txt (FastAPI, SQLModel, python-jose, asyncpg, Alembic, uvicorn, pydantic-settings, python-dotenv)
- [ ] T003 [P] Create backend/.env.example with DATABASE_URL, BETTER_AUTH_SECRET, CORS_ORIGINS, FRONTEND_URL
- [ ] T004 [P] Configure Alembic for database migrations in backend/alembic/
- [ ] T005 [P] Create backend/app/__init__.py and backend/app/main.py with FastAPI app initialization

### Frontend Setup

- [ ] T006 [P] Create frontend directory structure per plan.md (frontend/app, frontend/components, frontend/lib, frontend/styles)
- [ ] T007 [P] Initialize Next.js 16+ project with TypeScript, Tailwind CSS, and Better Auth dependencies
- [ ] T008 [P] Create frontend/.env.local.example with NEXT_PUBLIC_API_URL, BETTER_AUTH_SECRET, DATABASE_URL
- [ ] T009 [P] Configure Next.js in frontend/next.config.js (CORS, API proxy if needed)
- [ ] T010 [P] Configure Tailwind CSS in frontend/tailwind.config.js and frontend/styles/globals.css

**Checkpoint**: Project structure ready - foundational work can begin

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Configuration

- [ ] T011 Create backend/app/core/config.py with Pydantic Settings for environment variables (DATABASE_URL, BETTER_AUTH_SECRET, CORS_ORIGINS)
- [ ] T012 Create backend/app/core/database.py with async SQLModel engine and session management (connection pooling configured)
- [ ] T013 Create User model in backend/app/models/user.py (id, email, hashed_password, created_at) per data-model.md
- [ ] T014 Create Todo model in backend/app/models/todo.py (id, user_id, title, is_completed, created_at, updated_at) per data-model.md
- [ ] T015 Create initial Alembic migration in backend/alembic/versions/001_create_tables.py (users and todos tables with indexes and constraints)

### Backend Security & Auth

- [ ] T016 Create backend/app/core/security.py with JWT verification function (verify_token, extract_user_id using python-jose)
- [ ] T017 Create backend/app/schemas/auth.py with JWTPayload and UserContext Pydantic schemas
- [ ] T018 Create backend/app/api/deps.py with get_current_user dependency (extracts and verifies JWT from Authorization header)

### Backend API Structure

- [ ] T019 Create backend/app/schemas/todo.py with TodoCreate, TodoUpdate, TodoResponse Pydantic schemas per contracts/api-spec.yaml
- [ ] T020 Configure CORS middleware in backend/app/main.py (allow CORS_ORIGINS from config)
- [ ] T021 Create backend/app/api/routes/__init__.py for route organization

### Frontend Configuration

- [ ] T022 Create frontend/lib/types.ts with TypeScript interfaces (User, Todo, ApiError) matching backend schemas
- [ ] T023 Create frontend/lib/auth.ts with Better Auth configuration (JWT plugin, database connection, email/password provider)
- [ ] T024 Create frontend/app/api/auth/[...all]/route.ts with Better Auth catch-all handler
- [ ] T025 Create frontend/lib/api-client.ts with centralized API client class (automatic JWT attachment, error handling, 401 redirect)

### Frontend Layout & Providers

- [ ] T026 Create frontend/app/layout.tsx with Better Auth provider and root HTML structure
- [ ] T027 [P] Create frontend/components/ui/Button.tsx reusable component
- [ ] T028 [P] Create frontend/components/ui/Input.tsx reusable component
- [ ] T029 [P] Create frontend/components/ui/Card.tsx reusable component
- [ ] T030 [P] Create frontend/components/ui/Loading.tsx reusable component

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Registration and Authentication (Priority: P1) 🎯 MVP

**Goal**: Enable users to create accounts, log in, log out, and access protected routes with JWT authentication

**Independent Test**: Create an account, log out, log back in successfully. Verify protected routes require authentication.

### Implementation for User Story 1

#### Backend Authentication

- [ ] T031 [P] [US1] Run Alembic migration to create users table (alembic upgrade head)
- [ ] T032 [P] [US1] Verify User model works with database (create test user manually via Python shell)

#### Frontend Authentication UI

- [ ] T033 [P] [US1] Create frontend/components/auth/LoginForm.tsx with email/password fields and Better Auth login
- [ ] T034 [P] [US1] Create frontend/components/auth/SignupForm.tsx with email/password fields and Better Auth signup
- [ ] T035 [P] [US1] Create frontend/components/auth/LogoutButton.tsx with Better Auth logout functionality
- [ ] T036 [US1] Create frontend/app/(auth)/login/page.tsx with LoginForm component
- [ ] T037 [US1] Create frontend/app/(auth)/signup/page.tsx with SignupForm component
- [ ] T038 [US1] Create frontend/app/page.tsx home/landing page with links to login/signup

#### Protected Route Setup

- [ ] T039 [US1] Create frontend/app/(dashboard)/layout.tsx with authentication check (redirect to login if not authenticated)
- [ ] T040 [US1] Create frontend/app/(dashboard)/page.tsx basic dashboard placeholder (shows user email, logout button)

#### Integration & Validation

- [ ] T041 [US1] Verify signup flow creates user in database and issues JWT token
- [ ] T042 [US1] Verify login flow authenticates user and issues JWT token
- [ ] T043 [US1] Verify logout flow clears session
- [ ] T044 [US1] Verify protected dashboard route requires authentication (redirects to login if not logged in)
- [ ] T045 [US1] Verify JWT shared secret matches between frontend and backend (.env files)

**Checkpoint**: User Story 1 complete - Users can sign up, log in, log out. Protected routes work. This is a viable MVP.

---

## Phase 4: User Story 2 - Create and View Todos (Priority: P2)

**Goal**: Enable authenticated users to create new todos and view all their own todos (with user isolation)

**Independent Test**: Log in, create several todos, refresh the page, verify todos persist and only show your own todos (not other users')

### Implementation for User Story 2

#### Backend API Endpoints

- [ ] T046 [P] [US2] Run Alembic migration to create todos table (already in 001 migration, verify it ran)
- [ ] T047 [P] [US2] Implement GET /api/users/{user_id}/todos endpoint in backend/app/api/routes/todos.py (list todos with user_id filter)
- [ ] T048 [P] [US2] Implement POST /api/users/{user_id}/todos endpoint in backend/app/api/routes/todos.py (create todo with user_id isolation)
- [ ] T049 [US2] Register todos router in backend/app/main.py with /api prefix
- [ ] T050 [US2] Verify GET endpoint filters by authenticated user_id (test with multiple users)
- [ ] T051 [US2] Verify POST endpoint enforces user_id from JWT (rejects mismatched user_id in path)

#### Frontend Todo Components

- [ ] T052 [P] [US2] Create frontend/components/todos/TodoItem.tsx to display single todo (title, completion status)
- [ ] T053 [P] [US2] Create frontend/components/todos/TodoListClient.tsx client component (interactive list, state management)
- [ ] T054 [US2] Create frontend/components/todos/TodoList.tsx server component (fetches todos from API)
- [ ] T055 [US2] Create frontend/components/todos/TodoForm.tsx with title input and submit button (create new todo)

#### Frontend Pages & Integration

- [ ] T056 [US2] Update frontend/app/(dashboard)/page.tsx to render TodoList and TodoForm components
- [ ] T057 [US2] Implement API calls in frontend/lib/api-client.ts for fetchTodos() and createTodo()
- [ ] T058 [US2] Handle loading states (show Loading component while fetching)
- [ ] T059 [US2] Handle error states (show error message if API fails)
- [ ] T060 [US2] Handle empty state (show "No todos yet" message with prompt to create one)

#### Validation & Testing

- [ ] T061 [US2] Verify todos persist across page refreshes (loaded from database)
- [ ] T062 [US2] Verify user isolation (create second account, verify first user can't see second user's todos)
- [ ] T063 [US2] Verify 401 responses for unauthorized requests (missing/invalid JWT)
- [ ] T064 [US2] Verify title validation (cannot create empty title)

**Checkpoint**: User Story 2 complete - Users can create and view their todos. Combined with US1, this is a functional todo app.

---

## Phase 5: User Story 3 - Update Todo Status (Priority: P3)

**Goal**: Enable authenticated users to mark todos as complete or incomplete (toggle completion status)

**Independent Test**: Create a todo, mark it complete (verify visual indication), mark it incomplete, refresh page (verify state persists)

### Implementation for User Story 3

#### Backend API Endpoint

- [ ] T065 [US3] Implement PATCH /api/users/{user_id}/todos/{todo_id}/complete endpoint in backend/app/api/routes/todos.py (toggle is_completed, verify ownership)
- [ ] T066 [US3] Update updated_at timestamp when toggling completion status
- [ ] T067 [US3] Verify endpoint checks user ownership (returns 404 if todo doesn't belong to user)

#### Frontend UI Components

- [ ] T068 [P] [US3] Create frontend/components/todos/TodoActions.tsx with complete/uncomplete button (checkbox or toggle)
- [ ] T069 [US3] Update frontend/components/todos/TodoItem.tsx to include TodoActions and visual indication of completion (strikethrough, checkmark)
- [ ] T070 [US3] Implement toggleComplete() API call in frontend/lib/api-client.ts

#### Integration & Validation

- [ ] T071 [US3] Wire up TodoActions to call API and update UI optimistically
- [ ] T072 [US3] Handle API errors when toggling (show error message, revert optimistic update)
- [ ] T073 [US3] Verify completion status persists across page refreshes
- [ ] T074 [US3] Verify visual distinction between complete and incomplete todos

**Checkpoint**: User Story 3 complete - Users can toggle todo completion status with visual feedback

---

## Phase 6: User Story 4 - Edit Todo Details (Priority: P4)

**Goal**: Enable authenticated users to edit the title of existing todos

**Independent Test**: Create a todo, click edit, change title, save, verify change persists. Test cancel (original title preserved).

### Implementation for User Story 4

#### Backend API Endpoint

- [ ] T075 [US4] Implement PUT /api/users/{user_id}/todos/{todo_id} endpoint in backend/app/api/routes/todos.py (update title, verify ownership)
- [ ] T076 [US4] Update updated_at timestamp when editing todo
- [ ] T077 [US4] Validate title is not empty (return 400 with validation error)
- [ ] T078 [US4] Verify endpoint checks user ownership (returns 404 if todo doesn't belong to user)

#### Frontend UI Components

- [ ] T079 [P] [US4] Add edit mode state to frontend/components/todos/TodoItem.tsx (toggles between view and edit)
- [ ] T080 [US4] Add inline edit form with input and save/cancel buttons in TodoItem component
- [ ] T081 [US4] Implement updateTodo() API call in frontend/lib/api-client.ts

#### Integration & Validation

- [ ] T082 [US4] Wire up edit form to call API on save
- [ ] T083 [US4] Handle cancel (revert to original title without API call)
- [ ] T084 [US4] Handle validation errors (show error message if title is empty)
- [ ] T085 [US4] Verify updated title persists across page refreshes
- [ ] T086 [US4] Verify updated_at timestamp changes

**Checkpoint**: User Story 4 complete - Users can edit todo titles with validation

---

## Phase 7: User Story 5 - Delete Todos (Priority: P5)

**Goal**: Enable authenticated users to delete todos permanently

**Independent Test**: Create todos, delete one, refresh page, verify it's gone. Verify other todos remain.

### Implementation for User Story 5

#### Backend API Endpoint

- [ ] T087 [US5] Implement DELETE /api/users/{user_id}/todos/{todo_id} endpoint in backend/app/api/routes/todos.py (delete todo, verify ownership)
- [ ] T088 [US5] Return 200 with success message after deletion
- [ ] T089 [US5] Verify endpoint checks user ownership (returns 404 if todo doesn't belong to user)

#### Frontend UI Components

- [ ] T090 [US5] Add delete button to frontend/components/todos/TodoActions.tsx
- [ ] T091 [US5] Implement deleteTodo() API call in frontend/lib/api-client.ts
- [ ] T092 [US5] Add confirmation dialog before deleting (optional but recommended)

#### Integration & Validation

- [ ] T093 [US5] Wire up delete button to call API and remove todo from UI
- [ ] T094 [US5] Handle API errors when deleting (show error message)
- [ ] T095 [US5] Verify deletion persists across page refreshes
- [ ] T096 [US5] Verify only the selected todo is deleted (others remain)

**Checkpoint**: User Story 5 complete - Users can delete todos permanently

---

## Phase 8: User Story 6 - Responsive Interface (Priority: P6)

**Goal**: Ensure the interface works well on mobile, tablet, and desktop devices

**Independent Test**: Access the app on different screen sizes (320px to 1920px) and verify all features remain accessible

### Implementation for User Story 6

#### Responsive Design

- [ ] T097 [P] [US6] Apply responsive Tailwind CSS classes to frontend/app/(auth)/login/page.tsx (mobile-first)
- [ ] T098 [P] [US6] Apply responsive Tailwind CSS classes to frontend/app/(auth)/signup/page.tsx (mobile-first)
- [ ] T099 [P] [US6] Apply responsive Tailwind CSS classes to frontend/app/(dashboard)/page.tsx (mobile-first)
- [ ] T100 [P] [US6] Apply responsive Tailwind CSS classes to frontend/components/todos/TodoList.tsx (mobile-first, stacked on small screens)
- [ ] T101 [P] [US6] Apply responsive Tailwind CSS classes to frontend/components/todos/TodoItem.tsx (mobile-first, touch-friendly buttons)
- [ ] T102 [P] [US6] Apply responsive Tailwind CSS classes to frontend/components/todos/TodoForm.tsx (mobile-first, full-width on small screens)
- [ ] T103 [P] [US6] Apply responsive Tailwind CSS classes to frontend/components/auth/ components (mobile-first)

#### Viewport Testing

- [ ] T104 [US6] Test mobile viewport (320px-480px): verify text is readable, buttons are accessible
- [ ] T105 [US6] Test tablet viewport (481px-1024px): verify layout uses space effectively
- [ ] T106 [US6] Test desktop viewport (1025px-1920px): verify layout is not stretched awkwardly
- [ ] T107 [US6] Test browser resize: verify smooth transitions between breakpoints

**Checkpoint**: User Story 6 complete - App is fully responsive across all device sizes

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final touches, documentation, and cross-cutting improvements that don't belong to a specific user story

### Error Handling & UX Polish

- [ ] T108 [P] Implement global error boundary in frontend/app/layout.tsx
- [ ] T109 [P] Add toast notifications for success/error messages (optional library like react-hot-toast)
- [ ] T110 [P] Improve loading states with skeleton loaders (optional)
- [ ] T111 [P] Add 404 page in frontend/app/not-found.tsx
- [ ] T112 [P] Add favicon and metadata in frontend/app/layout.tsx

### Documentation

- [ ] T113 [P] Create backend/README.md with setup instructions, environment variables, and API docs link
- [ ] T114 [P] Create frontend/README.md with setup instructions, environment variables, and development guide
- [ ] T115 [P] Update root README.md with project overview, architecture, and quickstart reference

### Environment & Configuration

- [ ] T116 [P] Create backend/.gitignore (exclude .env, __pycache__, alembic.ini secrets)
- [ ] T117 [P] Create frontend/.gitignore (exclude .env.local, .next, node_modules)
- [ ] T118 [P] Verify environment variable loading in both frontend and backend (fail fast if missing required vars)

### Final Validation

- [ ] T119 Perform end-to-end manual test of all user stories (signup → login → create todos → complete → edit → delete → logout → login → verify persistence)
- [ ] T120 Verify JWT secret is properly shared between frontend and backend
- [ ] T121 Verify user isolation works (create two accounts, verify users can't access each other's todos)
- [ ] T122 Verify database connection pooling is configured correctly (check logs for connection usage)
- [ ] T123 Verify CORS is configured correctly (frontend can call backend)

**Checkpoint**: All user stories complete and polished. Application ready for deployment.

---

## Dependencies & Execution Strategy

### User Story Dependency Graph

```
Phase 1: Setup
    ↓
Phase 2: Foundational (BLOCKS ALL)
    ↓
    ├─→ Phase 3: US1 (Auth) 🎯 MVP ← INDEPENDENT
    │       ↓
    ├─→ Phase 4: US2 (Create/View Todos) ← Depends on US1 (auth required)
    │       ↓
    ├─→ Phase 5: US3 (Toggle Complete) ← Depends on US2 (needs todos to exist)
    │       │
    ├─→ Phase 6: US4 (Edit Todos) ← Depends on US2 (needs todos to exist)
    │       │
    ├─→ Phase 7: US5 (Delete Todos) ← Depends on US2 (needs todos to exist)
    │
    ↓
Phase 8: US6 (Responsive) ← Can be done in parallel with US3-US5 (UI-only changes)
    ↓
Phase 9: Polish ← After all user stories
```

### MVP Scope (Minimum Viable Product)

**MVP = User Story 1 (US1) only**
- Users can sign up, log in, log out
- Protected routes work
- JWT authentication functional
- Delivers: Secure access to application

**Incremental Delivery Strategy**:
1. **v0.1 (MVP)**: US1 - Authentication only
2. **v0.2**: US1 + US2 - Full todo CRUD (create, view)
3. **v0.3**: US1 + US2 + US3 - Add completion toggle
4. **v0.4**: US1 + US2 + US3 + US4 + US5 - Full editing and deletion
5. **v1.0**: All user stories (US1-US6) - Production-ready

### Parallel Execution Opportunities

**Within Foundational Phase (Phase 2):**
- T013-T014 (User/Todo models) can run in parallel
- T017 (schemas), T020 (CORS), T022-T025 (frontend config) can run in parallel with backend
- T027-T030 (UI components) can run in parallel

**Within User Story Phases:**
- US1: T033-T035 (auth components) in parallel, T036-T038 (pages) sequential
- US2: T047-T048 (backend endpoints) in parallel, T052-T054 (frontend components) in parallel
- US3: T065-T067 (backend) sequential, T068 (frontend) can overlap
- US4: T075-T078 (backend) sequential, T079-T081 (frontend) can overlap
- US5: T087-T089 (backend) sequential, T090-T092 (frontend) in parallel
- US6: T097-T103 (all responsive CSS) can run in parallel

**Cross-Story Parallelization:**
- US3, US4, US5 can be implemented in parallel (all depend on US2 but not on each other)
- US6 (responsive) can be done anytime after UI components exist (can overlap with US3-US5)

---

## Task Summary

**Total Tasks**: 123

**Breakdown by Phase**:
- Phase 1 (Setup): 10 tasks
- Phase 2 (Foundational): 20 tasks (BLOCKING)
- Phase 3 (US1 - Auth): 15 tasks 🎯 MVP
- Phase 4 (US2 - Create/View): 19 tasks
- Phase 5 (US3 - Toggle Complete): 10 tasks
- Phase 6 (US4 - Edit Todos): 12 tasks
- Phase 7 (US5 - Delete Todos): 10 tasks
- Phase 8 (US6 - Responsive): 11 tasks
- Phase 9 (Polish): 16 tasks

**Parallel Opportunities Identified**: 42 tasks marked with [P]

**Independent Test Criteria**:
- US1: Create account, logout, login, access protected route
- US2: Login, create todos, refresh, verify persistence
- US3: Create todo, toggle complete, refresh, verify state
- US4: Create todo, edit title, save/cancel, verify persistence
- US5: Create todos, delete one, refresh, verify removal
- US6: Test on mobile/tablet/desktop viewports

**Format Validation**: ✅ All tasks follow strict checklist format with ID, [P] marker (where applicable), [Story] label (where applicable), and file paths

---

## Implementation Notes

### Agent Delegation (per CLAUDE.md)

When executing `/sp.implement`, tasks will be delegated to specialized agents:

- **auth-architect**: T031-T045 (User Story 1 - Authentication)
- **neon-db-ops**: T011-T015 (Database setup), T031-T032, T046 (Database migrations)
- **fastapi-backend-owner**: T016-T021 (Backend API structure), T047-T051 (US2 backend), T065-T067 (US3 backend), T075-T078 (US4 backend), T087-T089 (US5 backend)
- **nextjs-ui-builder**: T022-T030 (Frontend config), T033-T045 (US1 frontend), T052-T064 (US2 frontend), T068-T074 (US3 frontend), T079-T086 (US4 frontend), T090-T096 (US5 frontend), T097-T107 (US6 responsive)

### Critical Success Factors

1. **JWT Secret**: MUST match in frontend and backend .env files (T045, T120)
2. **User Isolation**: ALL database queries MUST filter by user_id (T050, T062, T067, T078, T089, T121)
3. **Environment Variables**: Validate on startup (T118)
4. **CORS**: Configure properly for frontend-backend communication (T020, T123)
5. **Database Migrations**: Run Alembic migrations before starting backend (T031, T046)

### Next Step

Run `/sp.implement` to execute these tasks via specialized agents following the agent delegation strategy.
