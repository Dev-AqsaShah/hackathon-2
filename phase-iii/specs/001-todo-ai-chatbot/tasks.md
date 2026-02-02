# Tasks: Todo AI Chatbot

**Input**: Design documents from `/specs/001-todo-ai-chatbot/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested - implementation tasks only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/app/` for Python FastAPI code
- **Frontend**: `frontend/` for Next.js code
- **Specs**: `specs/001-todo-ai-chatbot/` for documentation

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create backend project structure with directories: backend/app/{models,api/routes,mcp/tools,agent,db}
- [x] T002 Create backend/requirements.txt with dependencies: fastapi, uvicorn, sqlmodel, psycopg2-binary, mcp, openai-agents, python-jose, python-dotenv
- [x] T003 [P] Create backend/app/__init__.py and all subpackage __init__.py files
- [x] T004 [P] Create frontend project structure using Next.js 16+ App Router in frontend/
- [x] T005 [P] Create frontend/package.json with dependencies: next, react, better-auth
- [x] T006 Create backend/app/config.py with environment variable configuration (DATABASE_URL, OPENAI_API_KEY, BETTER_AUTH_SECRET)
- [x] T007 [P] Create backend/.env.example with required environment variable templates
- [x] T008 [P] Create frontend/.env.local.example with NEXT_PUBLIC_API_URL and BETTER_AUTH_SECRET

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Foundation

- [x] T009 Create backend/app/models/task.py with Task SQLModel (id, user_id, title, is_completed, created_at, updated_at)
- [x] T010 [P] Create backend/app/models/conversation.py with Conversation SQLModel (id, user_id unique, created_at, updated_at)
- [x] T011 [P] Create backend/app/models/message.py with Message SQLModel (id, conversation_id, role, content, created_at)
- [x] T012 Create backend/app/models/__init__.py exporting all models
- [x] T013 Create backend/app/db/session.py with SQLModel engine and get_session dependency
- [x] T014 Create backend/migrations/001_create_tables.sql with CREATE TABLE statements for tasks, conversations, messages

### MCP Server Foundation

- [x] T015 Create backend/app/mcp/server.py with MCP server setup using mcp SDK
- [x] T016 Create backend/app/mcp/tools/__init__.py exporting all MCP tools

### Agent Foundation

- [x] T017 Create backend/app/agent/todo_agent.py with Agent configuration, instructions, and MCPServerStdio integration

### API Foundation

- [x] T018 Create backend/app/main.py with FastAPI app, CORS, and router inclusion
- [x] T019 Create backend/app/api/deps.py with get_db and verify_jwt dependencies
- [x] T020 Create backend/app/api/routes/__init__.py with router setup

### Frontend Foundation

- [x] T021 Create frontend/lib/types.ts with TypeScript interfaces (ChatRequest, ChatResponse, Message, Conversation)
- [x] T022 Create frontend/lib/auth.ts with Better Auth client configuration
- [x] T023 Create frontend/lib/api.ts with sendMessage and getHistory API client functions
- [x] T024 Create frontend/app/layout.tsx with root layout and auth provider
- [x] T025 [P] Create frontend/app/(auth)/login/page.tsx with login form
- [x] T026 [P] Create frontend/app/(auth)/signup/page.tsx with signup form

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Add Task via Chat (Priority: P1) 🎯 MVP

**Goal**: Users can add tasks by typing natural language messages like "Add buy groceries to my list"

**Independent Test**: Send "Add buy groceries" via chat, verify task created in DB and confirmation returned

### MCP Tool Implementation

- [x] T027 [US1] Create backend/app/mcp/tools/add_task.py with add_task MCP tool (user_id, title params, returns created task) - Implemented in backend/app/mcp/server.py as consolidated tools

### Agent Integration

- [x] T028 [US1] Update backend/app/agent/todo_agent.py AGENT_INSTRUCTIONS with add task intent mapping ("add", "remember", "I need to")

### Chat Endpoint (Partial - Add Flow)

- [x] T029 [US1] Create backend/app/api/routes/chat.py with POST /api/{user_id}/chat endpoint implementing 6-step stateless flow
- [x] T030 [US1] Implement conversation get_or_create in backend/app/api/routes/chat.py
- [x] T031 [US1] Implement message storage (user + assistant) in backend/app/api/routes/chat.py
- [x] T032 [US1] Implement agent invocation with MCP server in backend/app/api/routes/chat.py

### Frontend Chat UI

- [x] T033 [US1] Create frontend/components/chat/Message.tsx with message bubble component (user/assistant styling)
- [x] T034 [P] [US1] Create frontend/components/chat/MessageInput.tsx with text input and send button
- [x] T035 [US1] Create frontend/components/chat/MessageList.tsx with scrollable message list
- [x] T036 [US1] Create frontend/components/chat/ChatContainer.tsx managing state and API calls
- [x] T037 [US1] Create frontend/app/chat/page.tsx with ChatContainer and auth protection

**Checkpoint**: User Story 1 complete - can add tasks via chat

---

## Phase 4: User Story 2 - List Tasks via Chat (Priority: P1)

**Goal**: Users can view their tasks by asking "What are my tasks?" or "Show my list"

**Independent Test**: Add tasks, then send "Show my tasks" and verify all tasks listed

### MCP Tool Implementation

- [x] T038 [US2] Create backend/app/mcp/tools/list_tasks.py with list_tasks MCP tool (user_id, filter params, returns task array) - Implemented in backend/app/mcp/server.py

### Agent Integration

- [x] T039 [US2] Update backend/app/agent/todo_agent.py AGENT_INSTRUCTIONS with list task intent mapping ("show", "what's on", "my tasks", "pending")

### Frontend Enhancement

- [x] T040 [US2] Update frontend/components/chat/Message.tsx to format task list responses with numbered items

**Checkpoint**: User Stories 1 & 2 complete - can add and list tasks

---

## Phase 5: User Story 3 - Complete Task via Chat (Priority: P2)

**Goal**: Users can mark tasks complete by saying "Done with buy groceries" or "I finished calling mom"

**Independent Test**: Add task, then send "Mark buy groceries as done" and verify is_completed=true

### MCP Tool Implementation

- [x] T041 [US3] Create backend/app/mcp/tools/complete_task.py with complete_task MCP tool (user_id, task_id params, validates ownership, returns updated task) - Implemented in backend/app/mcp/server.py

### Agent Integration

- [x] T042 [US3] Update backend/app/agent/todo_agent.py AGENT_INSTRUCTIONS with complete intent mapping ("done", "finished", "complete", "mark")
- [x] T043 [US3] Update AGENT_INSTRUCTIONS to use list_tasks before complete if task_id unknown

**Checkpoint**: User Stories 1-3 complete - can add, list, complete tasks

---

## Phase 6: User Story 4 - Delete Task via Chat (Priority: P2)

**Goal**: Users can delete tasks by saying "Remove buy groceries" or "Delete the call mom task"

**Independent Test**: Add task, then send "Remove buy groceries" and verify task deleted from DB

### MCP Tool Implementation

- [x] T044 [US4] Create backend/app/mcp/tools/delete_task.py with delete_task MCP tool (user_id, task_id params, validates ownership, returns deleted task info) - Implemented in backend/app/mcp/server.py

### Agent Integration

- [x] T045 [US4] Update backend/app/agent/todo_agent.py AGENT_INSTRUCTIONS with delete intent mapping ("remove", "delete", "cancel")
- [x] T046 [US4] Update AGENT_INSTRUCTIONS to use list_tasks before delete if task_id unknown

**Checkpoint**: User Stories 1-4 complete - can add, list, complete, delete tasks

---

## Phase 7: User Story 5 - Update Task via Chat (Priority: P3)

**Goal**: Users can update task titles by saying "Change buy groceries to buy organic groceries"

**Independent Test**: Add task, then send "Change buy groceries to buy organic groceries" and verify title updated

### MCP Tool Implementation

- [x] T047 [US5] Create backend/app/mcp/tools/update_task.py with update_task MCP tool (user_id, task_id, new_title params, validates ownership, returns updated task) - Implemented in backend/app/mcp/server.py

### Agent Integration

- [x] T048 [US5] Update backend/app/agent/todo_agent.py AGENT_INSTRUCTIONS with update intent mapping ("change", "update", "rename", "modify")
- [x] T049 [US5] Update AGENT_INSTRUCTIONS to use list_tasks before update if task_id unknown

**Checkpoint**: User Stories 1-5 complete - all task CRUD operations via chat

---

## Phase 8: User Story 6 - Conversation Persistence (Priority: P2)

**Goal**: Conversation history persists across browser sessions and server restarts

**Independent Test**: Have conversation, refresh page, verify history loads; restart server, verify history intact

### Backend History Endpoint

- [x] T050 [US6] Create GET /api/{user_id}/chat/history endpoint in backend/app/api/routes/chat.py returning message history

### Frontend History Loading

- [x] T051 [US6] Update frontend/components/chat/ChatContainer.tsx to fetch and display history on mount
- [x] T052 [US6] Update frontend/lib/api.ts with getHistory function - Implemented in frontend/lib/chat-api.ts

### Stateless Verification

- [x] T053 [US6] Verify backend/app/api/routes/chat.py has no global state variables; all state from DB

**Checkpoint**: User Story 6 complete - full conversation persistence

---

## Phase 9: Authentication Integration

**Purpose**: Secure the chat endpoint with JWT verification

- [x] T054 Implement JWT verification in backend/app/api/deps.py using python-jose and BETTER_AUTH_SECRET - Already implemented in Phase 2
- [x] T055 Update backend/app/api/routes/chat.py to use verify_jwt dependency and validate user_id matches token
- [x] T056 Update frontend/lib/api.ts to attach JWT token from Better Auth to all requests - Implemented in frontend/lib/chat-api.ts
- [x] T057 Create frontend/app/page.tsx with redirect logic (authenticated → /chat, unauthenticated → /login)

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, UX improvements, and validation

### Error Handling

- [x] T058 Add error handling to all MCP tools in backend/app/mcp/tools/*.py (task not found, DB errors) - Implemented in backend/app/mcp/server.py
- [x] T059 Update backend/app/api/routes/chat.py with structured error responses (400, 401, 403, 500)
- [x] T060 [P] Update frontend/components/chat/ChatContainer.tsx with error display and retry logic
- [x] T061 [P] Add loading state to frontend/components/chat/MessageInput.tsx during message processing

### Agent Refinement

- [x] T062 Refine backend/app/agent/todo_agent.py instructions for ambiguous task handling (ask clarification)
- [x] T063 Refine backend/app/agent/todo_agent.py instructions to never expose raw errors

### Validation

- [x] T064 Add input validation to backend/app/api/routes/chat.py (non-empty message, max length) - Pydantic model with min_length=1, max_length=2000
- [ ] T065 Run quickstart.md validation: verify all setup steps work and E2E flow succeeds

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup
    ↓
Phase 2: Foundational (BLOCKS all user stories)
    ↓
Phase 3: US1 - Add Task (MVP) ────────────────────┐
    ↓                                              │
Phase 4: US2 - List Tasks ←────────────────────────┤ Can run in parallel
    ↓                                              │ after Foundation
Phase 5: US3 - Complete Task ←─────────────────────┤
    ↓                                              │
Phase 6: US4 - Delete Task ←───────────────────────┤
    ↓                                              │
Phase 7: US5 - Update Task ←───────────────────────┘
    ↓
Phase 8: US6 - Persistence (builds on all task ops)
    ↓
Phase 9: Authentication (can run after Phase 2)
    ↓
Phase 10: Polish (after all features)
```

### User Story Dependencies

| Story | Depends On | Can Run After |
|-------|------------|---------------|
| US1 - Add Task | Foundation | Phase 2 |
| US2 - List Tasks | Foundation | Phase 2 (parallel with US1) |
| US3 - Complete Task | US1 (needs tasks to complete) | Phase 3 |
| US4 - Delete Task | US1 (needs tasks to delete) | Phase 3 |
| US5 - Update Task | US1 (needs tasks to update) | Phase 3 |
| US6 - Persistence | US1 (needs conversation) | Phase 3 |

### Within Each User Story

1. MCP tool implementation first
2. Agent instruction update second
3. Frontend enhancement third
4. Integration testing last

### Parallel Opportunities

**Phase 1 Parallel**:
```
T003 (init files) || T004 (frontend structure) || T005 (package.json) || T007 (.env.example) || T008 (frontend .env)
```

**Phase 2 Parallel**:
```
T009 (Task model) || T010 (Conversation model) || T011 (Message model)
T025 (login page) || T026 (signup page)
```

**After Foundation (User Stories can run in parallel)**:
```
US1 (Add) + US2 (List) can start simultaneously
US3, US4, US5 can start after US1 creates test data
US6 can start after US1 establishes conversation flow
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 - Add Task
4. Complete Phase 4: User Story 2 - List Tasks
5. **STOP and VALIDATE**: Can add and view tasks via chat
6. Demo: Basic chatbot managing tasks

### Full Feature Set

1. Continue with US3, US4, US5 (complete, delete, update)
2. Add US6 (persistence verification)
3. Add Phase 9 (authentication)
4. Complete Phase 10 (polish)

### Suggested MVP Scope

**Minimal Viable Product**: Phases 1-4 (Setup + Foundation + Add + List)
- User can add tasks via natural language
- User can view task list via natural language
- ~37 tasks to MVP

---

## Task Summary

| Phase | Description | Task Count |
|-------|-------------|------------|
| Phase 1 | Setup | 8 |
| Phase 2 | Foundational | 18 |
| Phase 3 | US1 - Add Task | 11 |
| Phase 4 | US2 - List Tasks | 3 |
| Phase 5 | US3 - Complete Task | 3 |
| Phase 6 | US4 - Delete Task | 3 |
| Phase 7 | US5 - Update Task | 3 |
| Phase 8 | US6 - Persistence | 4 |
| Phase 9 | Authentication | 4 |
| Phase 10 | Polish | 8 |
| **Total** | | **65** |

### Tasks per User Story

| User Story | Task IDs | Count |
|------------|----------|-------|
| US1 - Add Task | T027-T037 | 11 |
| US2 - List Tasks | T038-T040 | 3 |
| US3 - Complete Task | T041-T043 | 3 |
| US4 - Delete Task | T044-T046 | 3 |
| US5 - Update Task | T047-T049 | 3 |
| US6 - Persistence | T050-T053 | 4 |

### Parallel Opportunities

- Phase 1: 5 parallel opportunities
- Phase 2: 4 parallel opportunities
- User Stories: US1+US2 can run in parallel after Foundation
- Within stories: MCP tools for US3-US5 can run in parallel

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [USn] label maps task to specific user story
- Each user story can be validated independently
- Commit after each task or logical group
- All MCP tools require user_id for isolation
- Agent instructions are cumulative (each US adds intent mappings)
- Frontend changes in US2-US5 are minimal (mainly agent-side)
