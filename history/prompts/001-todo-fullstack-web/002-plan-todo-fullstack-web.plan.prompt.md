---
id: 002
title: Plan Todo Full-Stack Web Application
stage: plan
date: 2026-01-22
surface: agent
model: claude-sonnet-4-5
feature: 001-todo-fullstack-web
branch: 001-todo-fullstack-web
user: AqsaShah
command: /sp.plan
labels: ["planning", "architecture", "phase-2", "todo-app", "fullstack"]
links:
  spec: ../../../specs/001-todo-fullstack-web/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - ../../../specs/001-todo-fullstack-web/plan.md
  - ../../../specs/001-todo-fullstack-web/research.md
  - ../../../specs/001-todo-fullstack-web/data-model.md
  - ../../../specs/001-todo-fullstack-web/quickstart.md
  - ../../../specs/001-todo-fullstack-web/contracts/api-spec.yaml
tests:
  - Constitution check (all gates passed)
  - Architecture decision analysis (6 decisions documented)
---

## Prompt

/sp.plan
Todo Full-Stack Web Application (Phase-2)

Architecture overview:
- Full-stack, multi-user web application
- Clear separation of concerns:
  - Frontend (Next.js App Router)
  - Backend (FastAPI REST APIs)
  - Database (Neon Serverless PostgreSQL)
  - Authentication (Better Auth + JWT)
- Stateless backend with JWT-based auth
- Persistent storage via PostgreSQL

High-level components:

1. Authentication Layer
   - Better Auth configured on frontend
   - JWT tokens issued on login/signup
   - Shared secret via BETTER_AUTH_SECRET
   - FastAPI middleware verifies JWT and extracts user identity

2. Backend API Layer
   - FastAPI application
   - RESTful endpoints for tasks CRUD + completion toggle
   - Request/response validation via schemas
   - Auth middleware enforced on all routes
   - User isolation enforced at query level

3. Data Layer
   - SQLModel ORM models for User and Task
   - Neon Serverless PostgreSQL as persistent store
   - Migrations to manage schema evolution
   - Queries always scoped to authenticated user

4. Frontend Layer
   - Next.js 16+ App Router
   - Pages for task list, create, update
   - Responsive UI components
   - API client attaches JWT to every request
   - Handles loading, error, and unauthorized states

Execution flow:
- User signs up / signs in via frontend
- Better Auth issues JWT token
- Frontend stores token and sends it with API requests
- Backend verifies JWT, extracts user
- Backend processes request and filters data by user
- Response returned and rendered in UI

Development workflow:
- Follow Agentic Dev Stack strictly:
  Specify → Plan → Tasks → Implement
- Each layer implemented via dedicated sub-agents
- No manual coding outside Claude Code outputs
- Incremental validation after each step

Phase boundary:
- Phase-2 only (no AI, no Kubernetes, no cloud streaming)
- Architecture must allow future expansion without refactor

Completion criteria:
- All API endpoints functional and secure
- Frontend fully integrated with backend
- Persistent storage working correctly
- JWT-based auth enforced everywhere
- Spec-driven implementation fully traceable

## Response snapshot

Created comprehensive architectural plan with Phase 0 (Research) and Phase 1 (Design) artifacts:

**Planning Artifacts Generated**:

1. **research.md** (Phase 0):
   - 10 technical decisions with alternatives analysis
   - Better Auth + JWT integration pattern
   - Neon PostgreSQL connection pooling strategy
   - SQLModel schema design for user isolation
   - RESTful API design patterns
   - Frontend component architecture (Server Components)
   - Environment configuration strategy
   - Database migration with Alembic
   - Error handling and validation with Pydantic
   - All technical unknowns resolved

2. **data-model.md** (Phase 1):
   - User and Todo entity definitions with SQLModel
   - Complete database schema (PostgreSQL DDL)
   - Foreign key constraints and indexes
   - Query patterns with user isolation enforcement
   - Data integrity rules and validation
   - Migration strategy with Alembic
   - Critical security pattern: All queries MUST filter by user_id

3. **contracts/api-spec.yaml** (Phase 1):
   - OpenAPI 3.1 specification
   - 5 REST endpoints with full request/response schemas
   - Authentication via Bearer JWT tokens
   - Error response formats (400, 401, 404, 500)
   - Example requests and responses
   - User isolation enforced in all endpoints

4. **quickstart.md** (Phase 1):
   - Step-by-step developer setup guide
   - Environment configuration for frontend and backend
   - Database setup with Neon
   - JWT secret generation
   - Testing instructions (manual and API)
   - Troubleshooting section with common issues
   - Development workflow guidelines

5. **plan.md** (Main artifact):
   - Technical context and constraints
   - Constitution check (all gates passed)
   - Project structure with detailed file tree
   - 6 architecture decisions with tradeoff analysis
   - Implementation strategy with agent delegation
   - Risk analysis with mitigation strategies
   - Testing strategy (future phase)
   - Integration points (JWT flow, API communication, database isolation)

**Architecture Decisions Documented**:
1. Better Auth + JWT for stateless authentication
2. SQLModel for type-safe ORM with Pydantic validation
3. Nested RESTful endpoints for clear ownership hierarchy
4. Server Components by default for performance
5. Async connection pooling for Neon serverless
6. Pydantic schemas for automatic validation

**Constitution Check Results**: ✅ ALL GATES PASSED
- Security: JWT auth, user isolation, 401 responses ✅
- Accuracy: Schema validation, deterministic behavior ✅
- Clarity: OpenAPI docs, TypeScript interfaces, type safety ✅
- Reproducibility: Environment variables, connection pooling ✅
- Modularity: Frontend/backend separation, agent delegation ✅

**Agent Delegation Strategy Defined**:
- `auth-architect`: Better Auth setup, JWT configuration
- `neon-db-ops`: Database schema, migrations, indexes
- `fastapi-backend-owner`: API endpoints, validation, auth middleware
- `nextjs-ui-builder`: UI components, pages, API client

**Key Integration Points**:
- JWT token flow: Frontend issues → Backend verifies with shared secret
- API communication: Authorization header on all requests
- Database isolation: Every query filters by authenticated user_id
- Error handling: Structured responses with Pydantic schemas

## Outcome

- ✅ Impact: Complete architectural plan with all Phase 0 and Phase 1 artifacts ready for task generation
- 🧪 Tests: Constitution check validation (5/5 principles passed), Architecture decision analysis (6 decisions)
- 📁 Files: Created plan.md, research.md, data-model.md, quickstart.md, api-spec.yaml
- 🔁 Next prompts: `/sp.tasks` to generate implementation tasks mapped to specialized agents
- 🧠 Reflection: Successfully created comprehensive plan following Agentic Dev Stack workflow. All technical unknowns resolved through research phase. Data model enforces security at database level with foreign keys and indexes. API contracts provide clear interface between frontend/backend. Agent delegation strategy aligns with CLAUDE.md rules for specialized implementation.

## Evaluation notes (flywheel)

- Failure modes observed: None. Planning process completed successfully with all required artifacts.
- Graders run and results (PASS/FAIL): Constitution check - PASS (5/5 principles), Architecture decisions - PASS (6 decisions with tradeoffs)
- Prompt variant (if applicable): Standard `/sp.plan` workflow with Phase 0 research and Phase 1 design
- Next experiment (smallest change to try): Proceed to `/sp.tasks` to break plan into atomic, testable tasks mapped to specialized agents
