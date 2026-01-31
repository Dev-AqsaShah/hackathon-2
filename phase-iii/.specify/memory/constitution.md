<!--
  Sync Impact Report
  ==================
  Version change: 0.0.0 → 1.0.0 (Initial ratification)

  Modified principles: N/A (initial version)

  Added sections:
    - Core Principles (5 principles: Security, Accuracy, Clarity, Reproducibility, Modularity)
    - Technical Standards (API, Database, Frontend, Authentication, Development Process)
    - Technology Constraints (Backend, Database, Frontend, Authentication, API Behavior)
    - Governance

  Removed sections: N/A (initial version)

  Templates requiring updates:
    - .specify/templates/plan-template.md: ✅ Compatible (Constitution Check section exists)
    - .specify/templates/spec-template.md: ✅ Compatible (Requirements section aligns)
    - .specify/templates/tasks-template.md: ✅ Compatible (Phase structure supports modularity)

  Follow-up TODOs: None
-->

# Todo Full-Stack Web Application Constitution

## Core Principles

### I. Security

All user data and authentication flows MUST be implemented and verified according to security best practices.

- All API endpoints MUST require JWT token authentication via `Authorization: Bearer <token>` header
- Unauthorized requests MUST return HTTP 401 status code
- User data MUST be isolated: users can only access their own tasks
- JWT shared secret MUST be stored in `BETTER_AUTH_SECRET` environment variable (never hardcoded)
- All authentication flows MUST use Better Auth with JWT plugin

**Rationale**: Multi-user web applications handle sensitive user data. Security breaches can expose personal information and compromise user trust.

### II. Accuracy

API endpoints, database queries, and frontend data MUST behave deterministically.

- REST API endpoints MUST return expected HTTP status codes (2xx for success, 4xx for client errors, 5xx for server errors)
- API responses MUST be validated JSON structures matching defined schemas
- Database queries MUST enforce user isolation (WHERE user_id = authenticated_user_id)
- Frontend state MUST accurately reflect backend data after each API response
- All CRUD operations MUST produce predictable, consistent results

**Rationale**: Deterministic behavior ensures reliable user experience and enables effective debugging and testing.

### III. Clarity

Code, API contracts, and UI behavior MUST be readable, maintainable, and traceable.

- Code MUST follow clean code principles with descriptive naming
- API contracts MUST be documented with clear request/response schemas
- Frontend components MUST have explicit prop interfaces (TypeScript)
- Error messages MUST be informative and actionable
- All implementation MUST be traceable to specifications via spec-driven development

**Rationale**: Clear, readable code reduces maintenance burden and enables team collaboration.

### IV. Reproducibility

Application behavior MUST be reproducible across multiple environments.

- Configuration MUST be environment-based (development, staging, production)
- All environment-specific values MUST use environment variables
- Database connections MUST use Neon serverless connection pooling for consistent behavior
- Build and deployment processes MUST be deterministic
- Tests MUST pass consistently in all environments

**Rationale**: Reproducible behavior ensures that development, testing, and production environments behave identically.

### V. Modularity

Frontend, backend, database, and auth components MUST be clearly separated and follow spec-driven architecture.

- Frontend (Next.js) MUST be a separate application from backend (FastAPI)
- Database operations MUST go through SQLModel ORM layer
- Authentication MUST be handled by Better Auth (frontend) with JWT verification (backend)
- Each component MUST have well-defined interfaces and responsibilities
- All implementation MUST follow the Agentic Dev Stack workflow: Spec → Plan → Tasks → Implement

**Rationale**: Modular architecture enables independent development, testing, and scaling of each layer.

## Technical Standards

### API Standards

- All REST API endpoints MUST return validated JSON structures
- Status codes MUST follow HTTP semantics: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Server Error
- Request validation MUST use Pydantic schemas
- All endpoints MUST include proper error handling with structured error responses

### Database Standards

- All queries MUST enforce user isolation (task ownership verification)
- Data integrity MUST be enforced via database constraints (PK, FK, UNIQUE, NOT NULL)
- Timestamps MUST use TIMESTAMPTZ for timezone awareness
- All database access MUST use parameterized queries (SQL injection prevention)

### Frontend Standards

- UI MUST be responsive across desktop, tablet, and mobile viewports
- Accessibility MUST meet WCAG 2.1 AA minimum requirements
- API responses MUST be handled properly including error states
- Loading states MUST be displayed during async operations
- JWT token MUST be attached to every API request

### Authentication Standards

- Better Auth MUST issue JWT tokens upon successful login
- JWT tokens MUST contain user identification claims
- Backend MUST verify JWT signature using shared secret
- Session management MUST handle token expiration gracefully

### Development Process Standards

- All features MUST be implemented via Claude Code + Spec-Kit Plus (no manual coding)
- Implementation MUST follow: /sp.specify → /sp.plan → /sp.tasks → /sp.implement
- Code MUST be traceable to specifications
- Each task MUST be independently testable

## Technology Constraints

### Backend
- Python 3.13+
- FastAPI framework
- SQLModel ORM

### Database
- Neon Serverless PostgreSQL
- Connection pooling for serverless environments

### Frontend
- Next.js 16+ with App Router
- TypeScript required
- Server components by default, client components only when necessary

### Authentication
- Better Auth with JWT plugin
- Shared secret stored in BETTER_AUTH_SECRET environment variable

### API Behavior

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/{user_id}/tasks` | GET | List all tasks for user |
| `/api/{user_id}/tasks` | POST | Create new task |
| `/api/{user_id}/tasks/{id}` | GET | Get task details |
| `/api/{user_id}/tasks/{id}` | PUT | Update task |
| `/api/{user_id}/tasks/{id}` | DELETE | Delete task |
| `/api/{user_id}/tasks/{id}/complete` | PATCH | Toggle task completion |

All endpoints require: `Authorization: Bearer <token>` header

## Governance

### Amendment Process

1. Proposed amendments MUST be documented with rationale
2. Changes affecting core principles require explicit approval
3. All amendments MUST include migration plan for existing implementations
4. Version MUST be incremented according to semantic versioning:
   - MAJOR: Principle removal or incompatible redefinition
   - MINOR: New principle or section addition
   - PATCH: Clarifications and non-semantic changes

### Compliance

- All code reviews MUST verify compliance with constitution principles
- Architecture decisions MUST be documented via ADRs when significant
- Non-compliance MUST be justified and documented in Complexity Tracking

### Runtime Guidance

Refer to `CLAUDE.md` for agent delegation rules and development workflow.

**Version**: 1.0.0 | **Ratified**: 2025-01-22 | **Last Amended**: 2025-01-22
