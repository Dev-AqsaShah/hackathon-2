# Implementation Plan: Todo Full-Stack Web Application (Phase-2)

**Branch**: `001-todo-fullstack-web` | **Date**: 2026-01-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-todo-fullstack-web/spec.md`

---

## Summary

This implementation plan transforms a console-based todo application into a secure, multi-user web application with persistent storage. The architecture follows a clear separation of concerns with Next.js 16 (App Router) frontend, FastAPI backend, Neon Serverless PostgreSQL database, and Better Auth + JWT for authentication.

**Primary Requirement**: Build a full-stack web application that allows multiple users to manage their personal todo lists with complete CRUD operations, ensuring data persistence and strict user isolation through JWT-based authentication.

**Technical Approach**:
- Frontend handles authentication (Better Auth) and issues JWT tokens
- Backend verifies JWT on every request and enforces user isolation at query level
- Database uses foreign key constraints and indexes for data integrity and performance
- Stateless backend architecture with connection pooling for serverless scalability

---

## Technical Context

**Language/Version**:
- **Frontend**: TypeScript with Node.js 20+
- **Backend**: Python 3.13+

**Primary Dependencies**:
- **Frontend**: Next.js 16+, Better Auth, TypeScript, React 19
- **Backend**: FastAPI, SQLModel, python-jose, asyncpg, Alembic

**Storage**: Neon Serverless PostgreSQL with connection pooling

**Testing**:
- **Frontend**: Jest + React Testing Library (future phase)
- **Backend**: pytest + httpx (future phase)

**Target Platform**:
- **Frontend**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Backend**: Linux server / containerized environment

**Project Type**: Web application (frontend + backend separation)

**Performance Goals**:
- API response time: < 3 seconds for CRUD operations
- Frontend page load: < 5 seconds on standard broadband
- Support 50 concurrent authenticated users

**Constraints**:
- JWT token verification required on every protected endpoint
- All queries must filter by authenticated user_id (user isolation)
- No manual coding - all implementation via Claude Code + Spec-Kit Plus
- Follow Agentic Dev Stack workflow strictly: Specify → Plan → Tasks → Implement

**Scale/Scope**:
- Multi-user system with isolated data per user
- 5 core operations: Create, Read, Update, Delete, Mark Complete
- 6 user stories (P1-P6) from authentication to responsive UI
- RESTful API with 5 main endpoints

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Security ✅ PASS

- [x] All API endpoints require JWT authentication via `Authorization: Bearer <token>` header
- [x] Unauthorized requests return HTTP 401 status code
- [x] User data isolation enforced: users can only access their own tasks (query-level filtering)
- [x] JWT shared secret stored in `BETTER_AUTH_SECRET` environment variable (never hardcoded)
- [x] Authentication flows use Better Auth with JWT plugin

**Rationale**: All security requirements from constitution are addressed in the architecture.

---

### Accuracy ✅ PASS

- [x] REST API endpoints return correct HTTP status codes (2xx, 4xx, 5xx)
- [x] API responses validated as JSON structures matching Pydantic schemas
- [x] Database queries enforce user isolation (`WHERE user_id = authenticated_user_id`)
- [x] Frontend state reflects backend data after each API response
- [x] All CRUD operations produce predictable, consistent results

**Rationale**: Deterministic behavior ensured through schema validation and explicit query patterns.

---

### Clarity ✅ PASS

- [x] Code follows clean code principles with descriptive naming (enforced by agents)
- [x] API contracts documented in OpenAPI spec (`contracts/api-spec.yaml`)
- [x] Frontend components have explicit TypeScript prop interfaces
- [x] Error messages are informative and actionable (structured error responses)
- [x] Implementation traceable to specifications via spec-driven development

**Rationale**: All clarity requirements met through documentation and type safety.

---

### Reproducibility ✅ PASS

- [x] Configuration is environment-based (development, staging, production via `.env` files)
- [x] All environment-specific values use environment variables
- [x] Database connections use Neon serverless connection pooling
- [x] Build and deployment processes are deterministic
- [x] Tests will pass consistently in all environments (to be implemented in /sp.implement)

**Rationale**: Environment variables and connection pooling ensure consistent behavior across environments.

---

### Modularity ✅ PASS

- [x] Frontend (Next.js) is a separate application from backend (FastAPI)
- [x] Database operations go through SQLModel ORM layer
- [x] Authentication handled by Better Auth (frontend) with JWT verification (backend)
- [x] Each component has well-defined interfaces and responsibilities
- [x] Implementation follows Agentic Dev Stack workflow: Spec → Plan → Tasks → Implement

**Rationale**: Clear separation of concerns with four distinct layers (frontend, backend, database, auth).

---

### Technical Standards Compliance ✅ PASS

**API Standards**:
- [x] REST endpoints return validated JSON (Pydantic schemas)
- [x] HTTP status codes follow semantics (200, 201, 400, 401, 404, 500)
- [x] Request validation uses Pydantic schemas
- [x] Proper error handling with structured error responses

**Database Standards**:
- [x] All queries enforce user isolation (query-level filtering)
- [x] Data integrity via database constraints (PK, FK, UNIQUE, NOT NULL)
- [x] Timestamps use TIMESTAMPTZ for timezone awareness
- [x] Parameterized queries prevent SQL injection (SQLModel ORM)

**Frontend Standards**:
- [x] Responsive UI across desktop, tablet, mobile viewports
- [x] WCAG 2.1 AA minimum requirements (semantic HTML)
- [x] Error states handled properly
- [x] Loading states displayed during async operations
- [x] JWT token attached to every API request

**Authentication Standards**:
- [x] Better Auth issues JWT tokens upon successful login
- [x] JWT tokens contain user identification claims
- [x] Backend verifies JWT signature using shared secret
- [x] Session management handles token expiration gracefully

**Development Process Standards**:
- [x] Implementation via Claude Code + Spec-Kit Plus (no manual coding)
- [x] Following Agentic Dev Stack: /sp.specify → /sp.plan → /sp.tasks → /sp.implement
- [x] Code traceable to specifications
- [x] Each task independently testable

---

### Technology Constraints Compliance ✅ PASS

- [x] Backend: Python 3.13+, FastAPI, SQLModel
- [x] Database: Neon Serverless PostgreSQL with connection pooling
- [x] Frontend: Next.js 16+ with App Router, TypeScript required
- [x] Server components by default, client components only when necessary
- [x] Authentication: Better Auth with JWT plugin
- [x] Shared secret in BETTER_AUTH_SECRET environment variable
- [x] API endpoints match specified patterns (see constitution table)

---

**Constitution Check Result**: ✅ ALL GATES PASSED

All core principles (Security, Accuracy, Clarity, Reproducibility, Modularity) are satisfied. Technical standards and technology constraints are fully compliant. Ready to proceed with implementation.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-fullstack-web/
├── spec.md                  # Feature specification (/sp.specify output)
├── plan.md                  # This file (/sp.plan output)
├── research.md              # Phase 0: Technical research and decisions
├── data-model.md            # Phase 1: Database schema and entities
├── quickstart.md            # Phase 1: Developer setup guide
├── contracts/               # Phase 1: API contracts
│   └── api-spec.yaml        # OpenAPI 3.1 specification
├── checklists/              # Quality validation
│   └── requirements.md      # Spec quality checklist
└── tasks.md                 # Phase 2: Implementation tasks (/sp.tasks - NOT YET CREATED)
```

### Source Code (repository root)

```text
phase-ii/
├── backend/                 # FastAPI application
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI app entry point, CORS config
│   │   ├── models/          # SQLModel database models
│   │   │   ├── __init__.py
│   │   │   ├── user.py      # User model
│   │   │   └── todo.py      # Todo model
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   │   ├── __init__.py
│   │   │   ├── todo.py      # TodoCreate, TodoUpdate, TodoResponse
│   │   │   └── auth.py      # JWTPayload, UserContext
│   │   ├── api/             # API route handlers
│   │   │   ├── __init__.py
│   │   │   ├── deps.py      # Dependencies (JWT verification, DB session)
│   │   │   └── routes/
│   │   │       ├── __init__.py
│   │   │       └── todos.py # Todo CRUD endpoints
│   │   └── core/            # Configuration and utilities
│   │       ├── __init__.py
│   │       ├── config.py    # Environment config with Pydantic Settings
│   │       ├── database.py  # Database engine and session management
│   │       └── security.py  # JWT verification logic
│   ├── alembic/             # Database migrations
│   │   ├── versions/        # Migration files
│   │   │   └── 001_create_tables.py
│   │   ├── env.py           # Alembic environment config
│   │   └── alembic.ini      # Alembic configuration
│   ├── tests/               # Backend tests (future phase)
│   │   ├── __init__.py
│   │   ├── conftest.py      # Pytest fixtures
│   │   ├── test_todos.py    # Todo endpoint tests
│   │   └── test_auth.py     # Auth middleware tests
│   ├── .env                 # Environment variables (gitignored)
│   ├── .env.example         # Example environment file
│   ├── requirements.txt     # Python dependencies
│   └── README.md            # Backend setup instructions
│
├── frontend/                # Next.js 16+ application
│   ├── app/                 # App Router
│   │   ├── layout.tsx       # Root layout with Better Auth provider
│   │   ├── page.tsx         # Home/landing page
│   │   ├── (auth)/          # Auth route group
│   │   │   ├── login/       # Login page
│   │   │   │   └── page.tsx
│   │   │   └── signup/      # Signup page
│   │   │       └── page.tsx
│   │   ├── (dashboard)/     # Protected dashboard routes
│   │   │   ├── layout.tsx   # Dashboard layout with auth check
│   │   │   ├── page.tsx     # Main dashboard (todo list)
│   │   │   └── todos/       # Todo management pages
│   │   │       ├── [id]/    # Dynamic todo detail page
│   │   │       │   └── page.tsx
│   │   │       └── new/     # Create new todo page
│   │   │           └── page.tsx
│   │   └── api/             # API route handlers
│   │       └── auth/        # Better Auth routes
│   │           └── [...all]/
│   │               └── route.ts  # Better Auth catch-all handler
│   ├── components/          # Reusable UI components
│   │   ├── auth/            # Authentication components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── LogoutButton.tsx
│   │   ├── todos/           # Todo-related components
│   │   │   ├── TodoList.tsx         # Server component (data fetching)
│   │   │   ├── TodoListClient.tsx   # Client component (interactivity)
│   │   │   ├── TodoItem.tsx         # Individual todo display
│   │   │   ├── TodoForm.tsx         # Create/edit todo form
│   │   │   └── TodoActions.tsx      # Complete/delete buttons
│   │   └── ui/              # Generic UI components
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Card.tsx
│   │       └── Loading.tsx
│   ├── lib/                 # Utilities and helpers
│   │   ├── api-client.ts    # Centralized API client with JWT
│   │   ├── auth.ts          # Better Auth configuration
│   │   └── types.ts         # TypeScript type definitions
│   ├── styles/              # Global styles
│   │   └── globals.css      # Tailwind CSS base styles
│   ├── tests/               # Frontend tests (future phase)
│   │   ├── components/      # Component tests
│   │   └── integration/     # Integration tests
│   ├── .env.local           # Environment variables (gitignored)
│   ├── .env.example         # Example environment file
│   ├── next.config.js       # Next.js configuration
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   ├── tsconfig.json        # TypeScript configuration
│   ├── package.json         # Node dependencies
│   └── README.md            # Frontend setup instructions
│
├── specs/                   # Feature specifications
│   └── 001-todo-fullstack-web/  # This feature
│
├── history/                 # Prompt History Records and ADRs
│   ├── prompts/
│   │   └── 001-todo-fullstack-web/
│   └── adr/
│
├── .specify/                # Spec-Kit Plus templates and scripts
│   ├── templates/
│   ├── scripts/
│   └── memory/
│       └── constitution.md  # Project constitution
│
├── CLAUDE.md                # Agent delegation rules
└── README.md                # Project overview
```

**Structure Decision**:

The **web application structure** (Option 2 from template) was selected because this is a full-stack web application with distinct frontend and backend concerns. The separation provides:

1. **Independent Development**: Frontend and backend can be developed, tested, and deployed independently
2. **Technology Isolation**: Different tech stacks (TypeScript/Next.js vs Python/FastAPI) cleanly separated
3. **Scalability**: Each layer can scale independently based on load patterns
4. **Agent Delegation**: Matches the agent architecture defined in CLAUDE.md:
   - `nextjs-ui-builder` works on `frontend/`
   - `fastapi-backend-owner` works on `backend/`
   - `neon-db-ops` handles database schema in `backend/app/models/` and migrations in `backend/alembic/`
   - `auth-architect` coordinates authentication across both layers

This structure aligns with the constitution's Modularity principle and enables the Agentic Dev Stack workflow where specialized agents implement their respective layers independently.

---

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations detected**. All constitution gates passed. No additional complexity tracking required.

---

## Architecture Decisions

### Decision 1: Authentication Strategy - Better Auth + JWT

**Options Considered**:
1. NextAuth.js with session-based auth
2. Better Auth with JWT tokens (SELECTED)
3. Auth0 (third-party service)
4. Custom JWT implementation

**Rationale for Selection**:
- Better Auth provides native Next.js App Router support
- JWT tokens enable stateless backend (no session storage needed)
- Shared secret architecture allows backend JWT verification without database lookup
- TypeScript-first with full type safety
- Flexible enough to support both httpOnly cookies and bearer tokens

**Tradeoffs**:
- **Pro**: Stateless backend scales horizontally without session storage
- **Pro**: JWT verification is fast (signature check only)
- **Pro**: Frontend and backend loosely coupled via JWT
- **Con**: JWT revocation is harder than session invalidation (mitigated by short expiration)
- **Con**: Requires careful secret management across frontend/backend

**Alternatives Rejected**:
- NextAuth.js: Lacks native JWT plugin architecture; session-based approach couples frontend/backend
- Auth0: External dependency; increases cost; adds latency; overkill for Phase-2
- Custom JWT: Reinventing the wheel; error-prone; no community support

---

### Decision 2: Database ORM - SQLModel

**Options Considered**:
1. SQLModel (SELECTED)
2. Raw SQLAlchemy
3. Django ORM
4. Prisma (Node.js based)

**Rationale for Selection**:
- SQLModel combines Pydantic validation with SQLAlchemy ORM
- Type-safe models with automatic validation
- Async/await support for FastAPI integration
- Single model definition for database and API schemas (reduces duplication)
- Seamless Alembic migration support

**Tradeoffs**:
- **Pro**: Type safety catches errors at development time
- **Pro**: Reduces boilerplate (one model for DB + API)
- **Pro**: Async support matches FastAPI's async architecture
- **Con**: Less mature than pure SQLAlchemy (mitigated by active development)
- **Con**: Smaller community than Django ORM

**Alternatives Rejected**:
- Raw SQLAlchemy: More boilerplate; no built-in Pydantic validation
- Django ORM: Requires Django framework; not compatible with FastAPI
- Prisma: Node.js based; can't be used in Python backend

---

### Decision 3: API Design Pattern - RESTful with Resource Nesting

**Options Considered**:
1. Flat RESTful endpoints (`/api/todos?user_id=123`)
2. Nested RESTful endpoints (`/api/users/{user_id}/todos`) (SELECTED)
3. GraphQL
4. RPC-style endpoints

**Rationale for Selection**:
- Nested URLs explicitly show ownership relationship (todos belong to users)
- RESTful conventions are well-understood and industry-standard
- HTTP method semantics map cleanly to CRUD operations
- Easy to cache and reason about
- Self-documenting API structure

**Tradeoffs**:
- **Pro**: Clear ownership hierarchy in URL structure
- **Pro**: Industry-standard patterns (RESTful)
- **Pro**: HTTP method semantics (GET/POST/PUT/DELETE/PATCH)
- **Con**: Slightly more verbose than flat URLs
- **Con**: Client must construct nested paths

**Alternatives Rejected**:
- Flat endpoints: Less explicit ownership; `user_id` in query params feels like filtering rather than scoping
- GraphQL: Overkill for simple CRUD; adds complexity; requires GraphQL schema and resolvers
- RPC-style: Less RESTful; harder to cache; non-standard

---

### Decision 4: Frontend Component Architecture - Server Components by Default

**Options Considered**:
1. All client components (traditional React SPA)
2. Server components by default, client where needed (SELECTED)
3. Islands architecture (Astro-style)

**Rationale for Selection**:
- Next.js 16 App Router encourages server components for better performance
- Server components reduce JavaScript bundle size
- Data fetching happens on server (faster, more secure)
- Client components only for interactivity (forms, buttons, real-time updates)
- Automatic code splitting and optimization

**Tradeoffs**:
- **Pro**: Smaller JavaScript bundles (faster page loads)
- **Pro**: Automatic data fetching optimization
- **Pro**: Better SEO (server-rendered content)
- **Con**: Learning curve (understanding server/client boundary)
- **Con**: Some restrictions on server components (no useState, no event handlers)

**Alternatives Rejected**:
- All client components: Larger bundles; slower initial load; more client-side data fetching
- Islands architecture: Too complex for Phase-2; requires different mental model

---

### Decision 5: Database Connection Strategy - Async Connection Pooling

**Options Considered**:
1. Synchronous connections (blocking I/O)
2. Async connections with connection pooling (SELECTED)
3. Connection per request (no pooling)

**Rationale for Selection**:
- Neon Serverless PostgreSQL auto-scales connections
- Async/await matches FastAPI's async architecture
- Connection pooling prevents exhaustion in serverless environments
- asyncpg provides performant async PostgreSQL driver
- Pre-ping ensures stale connections are refreshed

**Tradeoffs**:
- **Pro**: Non-blocking I/O improves throughput
- **Pro**: Connection reuse reduces latency
- **Pro**: Scales well in serverless (Neon-optimized)
- **Con**: Async code is slightly more complex than sync
- **Con**: Pool configuration requires tuning (mitigated by sensible defaults)

**Alternatives Rejected**:
- Synchronous connections: Blocking I/O limits concurrency; doesn't match FastAPI async
- No pooling: Every request creates new connection (slow); can exhaust connection limits

---

### Decision 6: Validation Strategy - Pydantic Schemas

**Options Considered**:
1. Manual validation in route handlers
2. Pydantic schemas (SELECTED)
3. JSON Schema
4. Cerberus or Marshmallow

**Rationale for Selection**:
- Pydantic is FastAPI's native validation library
- Automatic request/response validation
- Type-safe with Python type hints
- Clear, actionable error messages
- OpenAPI schema generation for free

**Tradeoffs**:
- **Pro**: Automatic validation (less boilerplate)
- **Pro**: Type safety catches errors early
- **Pro**: OpenAPI documentation auto-generated
- **Con**: Tightly coupled to FastAPI (but that's the framework we're using)

**Alternatives Rejected**:
- Manual validation: Error-prone; inconsistent; lots of boilerplate
- JSON Schema: More verbose; less Pythonic; requires separate schemas
- Cerberus/Marshmallow: Additional dependencies; not FastAPI-native

---

## Implementation Strategy

### Phase Breakdown

Implementation follows the Agentic Dev Stack workflow with specialized agent delegation:

**Phase 0: Research** ✅ COMPLETED
- Resolved all technical unknowns
- Documented technology decisions with rationale
- Output: `research.md`

**Phase 1: Design** ✅ COMPLETED
- Defined data model with entities, relationships, and validation rules
- Created API contracts (OpenAPI spec)
- Wrote quickstart guide for developers
- Output: `data-model.md`, `contracts/api-spec.yaml`, `quickstart.md`

**Phase 2: Task Generation** → NEXT STEP
- Command: `/sp.tasks`
- Break implementation into atomic, testable tasks
- Map tasks to specialized agents (auth-architect, neon-db-ops, fastapi-backend-owner, nextjs-ui-builder)
- Output: `tasks.md`

**Phase 3: Implementation** → AFTER TASK GENERATION
- Command: `/sp.implement`
- Execute tasks via specialized agents following agent delegation rules (CLAUDE.md)
- Each agent implements their layer independently
- Agents coordinate via defined contracts (API spec, data model)
- Output: Working code in `backend/` and `frontend/`

---

### Agent Delegation Strategy

Based on `CLAUDE.md`, implementation is distributed across specialized agents:

**1. Authentication Setup** → `auth-architect` agent
- Better Auth configuration in Next.js
- JWT token issuance on login/signup
- Shared secret setup (`BETTER_AUTH_SECRET`)
- Frontend auth routes and components

**2. Database Layer** → `neon-db-ops` agent
- SQLModel model definitions (User, Todo)
- Alembic migration scripts
- Database indexes and constraints
- Connection pooling configuration

**3. Backend API** → `fastapi-backend-owner` agent
- FastAPI application setup
- JWT verification dependency
- Todo CRUD route handlers
- Pydantic request/response schemas
- Error handling and validation

**4. Frontend UI** → `nextjs-ui-builder` agent
- Next.js App Router pages and layouts
- React components (TodoList, TodoForm, etc.)
- API client with JWT attachment
- Responsive design and loading states

**Coordination Protocol**:
1. **Database First**: `neon-db-ops` creates schema and models
2. **Contracts as Interface**: API spec defines backend/frontend boundary
3. **Backend Second**: `fastapi-backend-owner` implements API endpoints matching contract
4. **Frontend Third**: `nextjs-ui-builder` consumes API via client matching contract
5. **Auth Integration**: `auth-architect` coordinates auth flow across frontend/backend

---

### Key Integration Points

**1. JWT Token Flow**:
- Frontend (Better Auth) issues JWT on login → Backend verifies JWT on every request
- Shared secret (`BETTER_AUTH_SECRET`) must be identical in both `.env` files

**2. API Communication**:
- Frontend API client attaches `Authorization: Bearer <token>` header
- Backend extracts token, verifies signature, extracts user_id
- All queries filter by authenticated user_id

**3. Database Isolation**:
- Every Todo query includes `WHERE todo.user_id == current_user.id`
- Foreign key constraint ensures todos belong to existing users
- Index on `user_id` ensures fast filtering

**4. Error Handling**:
- Backend returns structured error responses (Pydantic Error schema)
- Frontend parses errors and displays user-friendly messages
- 401 responses trigger re-authentication flow

---

## Risk Analysis

### Risk 1: JWT Secret Mismatch

**Impact**: Authentication fails; all API requests return 401

**Mitigation**:
- Environment variable validation on startup (fail fast if missing)
- Clear documentation in quickstart guide
- Example `.env` files with comments
- Startup health check logs secret presence (not value)

**Contingency**: If detected, error message explicitly states secret mismatch and points to docs

---

### Risk 2: User Isolation Bypass

**Impact**: Critical security vulnerability; users can access others' todos

**Mitigation**:
- Code review checklist: Every Todo query MUST include `user_id` filter
- Integration tests verify cross-user access returns 401
- Database foreign key constraints prevent orphaned todos
- Explicit query patterns documented in data-model.md

**Contingency**: Security audit before Phase-2 completion; manual review of all query code

---

### Risk 3: Database Connection Exhaustion

**Impact**: Application becomes unresponsive; connection timeouts

**Mitigation**:
- Connection pooling with conservative pool size (5-10)
- Neon auto-scaling handles burst traffic
- Health check endpoint monitors connection pool status
- Async session context managers ensure connections are released

**Contingency**: Monitor connection usage; adjust pool size if needed; Neon dashboard alerts

---

### Risk 4: CORS Configuration Issues

**Impact**: Frontend cannot communicate with backend; all API calls fail

**Mitigation**:
- CORS origins configured via environment variable
- Development defaults to `http://localhost:3000`
- Clear error messages if CORS fails (browser console)
- Quickstart guide includes troubleshooting section

**Contingency**: FastAPI CORS middleware logs rejected origins for debugging

---

### Risk 5: Token Expiration Handling

**Impact**: Users logged out mid-session; poor user experience

**Mitigation**:
- Better Auth handles token refresh automatically
- Frontend API client detects 401 and redirects to login
- Clear messaging when session expires
- Token expiration set to reasonable duration (e.g., 24 hours)

**Contingency**: Implement token refresh endpoint if needed; extend expiration time

---

## Testing Strategy (Future Phase)

### Backend Testing

**Unit Tests** (pytest):
- JWT verification logic
- Pydantic schema validation
- Query patterns (mocked database)
- Error handling

**Integration Tests** (pytest + TestClient):
- Full API endpoint flows
- Authentication and authorization
- Database operations with test database
- Cross-user isolation verification

**Test Coverage Goal**: 80%+ for backend code

---

### Frontend Testing

**Component Tests** (Jest + React Testing Library):
- Individual component rendering
- Form validation
- Error state handling
- Loading states

**Integration Tests** (Playwright or Cypress):
- Full user flows (signup, login, CRUD operations)
- Authentication flows
- Responsive design on different viewports
- Cross-browser compatibility

**Test Coverage Goal**: 70%+ for frontend code

---

### Manual Testing Checklist

See `quickstart.md` "Testing the Application" section for comprehensive manual test scenarios.

---

## Deployment Considerations (Out of Scope for Phase-2)

Phase-2 focuses on local development. Deployment is planned for future phases but architectural decisions support it:

**Database**: Neon Serverless PostgreSQL (already cloud-based)
**Backend**: Can deploy to Vercel, AWS Lambda, Google Cloud Run, or traditional VPS
**Frontend**: Can deploy to Vercel, Netlify, or static hosting
**Environment Variables**: Production secrets managed via platform secret managers

---

## Documentation Artifacts

All documentation artifacts have been generated:

- ✅ **research.md**: Technology decisions and best practices
- ✅ **data-model.md**: Database schema, entities, and query patterns
- ✅ **contracts/api-spec.yaml**: OpenAPI 3.1 specification for REST API
- ✅ **quickstart.md**: Developer setup guide with troubleshooting
- ✅ **plan.md**: This file (architectural plan)

---

## Next Steps

1. **Generate Tasks**: Run `/sp.tasks` to break implementation into atomic, testable tasks
2. **Review Constitution**: Verify all tasks align with constitution principles
3. **Execute Implementation**: Run `/sp.implement` to delegate tasks to specialized agents
4. **Validate Integration**: Test end-to-end user flows
5. **Create ADR**: If any significant architectural decisions made during implementation, document via `/sp.adr`

---

**Status**: ✅ Phase 0 and Phase 1 complete. Ready for Phase 2 (task generation).

**Planning Date**: 2026-01-22
**Next Command**: `/sp.tasks`
