# Research & Technology Decisions: Todo Backend API

**Feature**: Todo Full-Stack Web Application — Backend & API
**Branch**: 001-todo-api-backend
**Date**: 2026-01-23

## Overview

This document captures all technology decisions and research findings for the Todo Backend API implementation. All decisions are traceable to functional requirements in [spec.md](spec.md) and align with the project constitution.

## Research Questions Resolved

### 1. API Route Pattern Structure

**Question**: Should we use `/api/{user_id}/tasks` pattern (path-based user) or `/api/tasks` (JWT-only user)?

**Decision**: `/api/{user_id}/tasks` with explicit path-based validation

**Research Findings**:
- REST best practice: Resource paths should be predictable and hierarchical
- Security benefit: Dual validation (path param + JWT) prevents programmer error
- Audit clarity: user_id visible in access logs without parsing JWT
- Frontend clarity: Explicit user context in API calls

**Alternatives Evaluated**:
1. `/api/tasks` - Simpler but loses explicit user context
2. `/api/v1/{user_id}/tasks` - Adds versioning (not needed for v1)
3. `/api/users/{user_id}/tasks` - More RESTful but verbose

**Rationale**: Specification FR-003 explicitly requires validating URL user_id against JWT user_id. The `/api/{user_id}/tasks` pattern makes this validation requirement clear and enforceable.

**Trade-offs**:
- ✅ Pro: Explicit authorization check at path level
- ✅ Pro: Better logging and debugging
- ❌ Con: Slightly more verbose API calls
- ❌ Con: Additional validation logic required

---

### 2. Database Table Naming Convention

**Question**: Keep existing `todos` table or rename to `tasks`?

**Decision**: Rename to `tasks` via Alembic migration

**Research Findings**:
- Specification consistently uses "task" terminology (25 occurrences)
- Code readability: Consistent naming reduces cognitive load
- Migration cost: Single ALTER TABLE statement, minimal risk
- Industry practice: Align database names with domain language

**Alternatives Evaluated**:
1. Keep `todos` in DB, use `Task` in code - Creates terminology split
2. Add view or alias - Adds unnecessary complexity
3. Rename to `tasks` - Clean, consistent, spec-aligned

**Rationale**: Constitution Principle III (Clarity) requires readable, maintainable code. Mixed terminology (`todos` vs `tasks`) violates this principle.

**Implementation**: Alembic migration 002 will execute `ALTER TABLE todos RENAME TO tasks` and update all references.

**Trade-offs**:
- ✅ Pro: Consistent terminology across spec, code, database
- ✅ Pro: Easier onboarding for new developers
- ❌ Con: Requires database migration (minimal risk)

---

### 3. Response Schema Design

**Question**: What should POST/PUT endpoints return - full object or minimal confirmation?

**Decision**: Return complete TaskResponse object with all fields

**Research Findings**:
- HTTP 201/200 best practice: Return created/updated resource
- Frontend efficiency: Eliminates need for subsequent GET request
- Specification FR-009: "created task including id and timestamps"
- RESTful convention: Hypermedia response includes resource state

**Alternatives Evaluated**:
1. Return only ID - Poor UX, requires extra roundtrip
2. Return partial object - Inconsistent, unpredictable
3. Return full object - Standard, efficient, spec-compliant

**Rationale**: Returning full objects aligns with REST conventions, satisfies FR-009, and improves frontend performance.

**Trade-offs**:
- ✅ Pro: Frontend gets all data in one request
- ✅ Pro: Follows REST best practices
- ✅ Pro: Spec-compliant (FR-009)
- ❌ Con: Slightly larger response payload (negligible for single task)

---

### 4. PATCH Completion Toggle Implementation

**Question**: Should PATCH endpoint accept boolean or always toggle current state?

**Decision**: No request body - always toggle current state

**Research Findings**:
- Specification FR-013: "toggle task completion status" (verb: toggle, not set)
- HTTP PATCH semantics: Partial update to resource
- Idempotency consideration: Toggle is NOT idempotent but matches requirement
- API simplicity: No body parsing needed

**Alternatives Evaluated**:
1. Accept `{"completed": true/false}` - More explicit but not a "toggle"
2. Use PUT for full replacement - Different pattern, less specific
3. No body, always toggle - Matches spec exactly

**Rationale**: Specification explicitly uses "toggle" terminology. Implementation must match spec language.

**Trade-offs**:
- ✅ Pro: Simple API (no request body)
- ✅ Pro: Matches spec requirement precisely
- ✅ Pro: Clear intent (toggle vs set)
- ❌ Con: Not idempotent (repeated calls flip state)
- ❌ Con: Client must track current state to predict outcome

**Note**: If idempotency is required in future, can deprecate PATCH /complete and add PUT /status with boolean body.

---

### 5. Error Response Structure

**Question**: How should error responses be formatted?

**Decision**: Use FastAPI's HTTPException with `detail` field, leverage Pydantic for 422 validation errors

**Research Findings**:
- FastAPI default: `{"detail": "error message"}` for exceptions
- Pydantic validation: Auto-formats to `{"detail": [{loc, msg, type}]}` for 422
- RFC 7807 (Problem Details): Overkill for simple API
- Consistency: Reuse FastAPI's built-in error handling

**Alternatives Evaluated**:
1. Custom error schema - Unnecessary complexity
2. RFC 7807 Problem Details - Too heavy for this use case
3. FastAPI default + Pydantic - Simple, spec-compliant

**Rationale**: Specification FR-024 requires `detail` field. FastAPI provides this by default.

**Error Response Examples**:

```json
// 401 Unauthorized
{"detail": "Invalid or expired token"}

// 403 Forbidden
{"detail": "Cannot access another user's tasks"}

// 404 Not Found
{"detail": "Task not found"}

// 422 Validation Error
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}

// 500 Internal Server Error
{"detail": "An unexpected error occurred"}

// 503 Service Unavailable
{"detail": "Database connection failed"}
```

**Trade-offs**:
- ✅ Pro: Leverages FastAPI built-ins
- ✅ Pro: Consistent across all endpoints
- ✅ Pro: Spec-compliant (FR-024)
- ❌ Con: Less structured than RFC 7807 (acceptable for v1)

---

### 6. Service Layer Architecture

**Question**: Implement business logic in route handlers or separate service layer?

**Decision**: Lightweight service layer in `services/task_service.py`

**Research Findings**:
- Clean Architecture: Separate HTTP layer from business logic
- Testability: Unit test services without HTTP overhead
- Constitution Principle V (Modularity): Clear separation of concerns
- FastAPI pattern: Thin controllers, fat services

**Alternatives Evaluated**:
1. Logic in route handlers - Simple but violates modularity, hard to test
2. Full repository pattern - Too heavy for CRUD operations
3. Lightweight service layer - Balanced approach

**Service Functions**:

```python
# services/task_service.py
async def validate_ownership(task: Task, user_id: int) -> None
async def get_user_tasks(session: AsyncSession, user_id: int) -> List[Task]
async def get_task_by_id(session: AsyncSession, task_id: int, user_id: int) -> Task
async def create_task(session: AsyncSession, data: TaskCreate, owner_id: int) -> Task
async def update_task(session: AsyncSession, task_id: int, data: TaskUpdate, user_id: int) -> Task
async def delete_task(session: AsyncSession, task_id: int, user_id: int) -> None
async def toggle_task_completion(session: AsyncSession, task_id: int, user_id: int) -> Task
```

**Rationale**: Service layer encapsulates authorization logic, database queries, and business rules. Routes become thin orchestration layers.

**Trade-offs**:
- ✅ Pro: Testable business logic
- ✅ Pro: Clear separation (HTTP vs domain logic)
- ✅ Pro: Reusable across multiple endpoints if needed
- ❌ Con: Additional file/module (minimal cost)

---

## Technology Stack Confirmation

### Backend Framework: FastAPI 0.109.0

**Rationale**:
- High performance (async/await, Starlette ASGI)
- Auto-generated OpenAPI documentation
- Pydantic integration for validation
- Excellent developer experience
- Production-ready with type hints

**Alternatives Considered**:
- Flask: Lacks async support, no built-in validation
- Django REST Framework: Too heavy for API-only service
- Starlette: Lower-level, FastAPI adds convenience

**Decision**: FastAPI is the optimal choice for this use case.

---

### ORM: SQLModel 0.0.14

**Rationale**:
- Combines SQLAlchemy + Pydantic (type safety + validation)
- Async support via SQLAlchemy 2.0
- Matches project requirement (spec mentions SQLModel)
- Excellent for serverless (async engine)

**Alternatives Considered**:
- Raw SQLAlchemy: More verbose, no Pydantic integration
- Tortoise ORM: Less mature ecosystem
- Prisma (Python): Beta, not production-ready

**Decision**: SQLModel provides best balance of features and maturity.

---

### JWT Library: python-jose 3.3.0

**Rationale**:
- Industry standard for JWT handling in Python
- Supports HS256 algorithm (matches Better Auth)
- Minimal dependencies
- Secure by default

**Alternatives Considered**:
- PyJWT: Similar features, python-jose adds JWE support
- Authlib: More features than needed
- Manual JWT decoding: Security risk, not recommended

**Decision**: python-jose for reliable JWT verification.

---

### Database Driver: asyncpg 0.29.0

**Rationale**:
- Fastest PostgreSQL driver for Python
- Native async support (no thread pool overhead)
- Required for SQLAlchemy async engine
- Well-maintained, production-proven

**Alternatives Considered**:
- psycopg3 async: Newer but less battle-tested
- psycopg2 with aiopg: Adds unnecessary wrapper layer

**Decision**: asyncpg is the standard async driver for PostgreSQL.

---

### Testing Framework: pytest + pytest-asyncio

**Rationale**:
- De facto standard for Python testing
- Excellent fixture system
- Async test support via pytest-asyncio
- Rich plugin ecosystem

**Alternatives Considered**:
- unittest: Less expressive, no async support
- nose2: Less active development

**Decision**: pytest with pytest-asyncio for comprehensive testing.

---

## Implementation Patterns

### 1. Dependency Injection (FastAPI)

**Pattern**: Use FastAPI's `Depends()` for cross-cutting concerns

```python
from fastapi import Depends
from app.api.deps import get_current_user, get_session

@router.get("/api/{user_id}/tasks")
async def list_tasks(
    user_id: int,
    current_user: UserContext = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    # Validate user_id matches JWT
    if user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Cannot access another user's tasks")
    # Call service layer
    tasks = await task_service.get_user_tasks(session, user_id)
    return tasks
```

**Benefits**:
- Automatic JWT extraction and validation
- Database session management (auto-cleanup)
- Testable via dependency override

---

### 2. Service Layer Pattern

**Pattern**: Separate business logic from HTTP routing

```python
# services/task_service.py
async def get_user_tasks(session: AsyncSession, user_id: int) -> List[Task]:
    result = await session.execute(
        select(Task).where(Task.owner_id == user_id).order_by(Task.created_at.desc())
    )
    return result.scalars().all()
```

**Benefits**:
- Testable without HTTP overhead
- Reusable across endpoints
- Clear ownership boundary enforcement

---

### 3. Schema Separation Pattern

**Pattern**: Separate schemas for Create, Update, and Response

```python
class TaskCreate(SQLModel):
    title: str = Field(min_length=1, max_length=1000)
    description: Optional[str] = Field(default=None, max_length=5000)

class TaskUpdate(SQLModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=1000)
    description: Optional[str] = Field(default=None, max_length=5000)

class TaskResponse(SQLModel):
    id: int
    title: str
    description: Optional[str]
    completed: bool
    owner_id: int
    created_at: datetime
    updated_at: datetime
```

**Benefits**:
- Validation enforced at schema level
- Clear intent (create vs update vs response)
- OpenAPI docs show exact structure

---

## Performance Considerations

### Connection Pooling Configuration

**Settings** (for Neon Serverless PostgreSQL):
```python
engine = create_async_engine(
    DATABASE_URL,
    pool_size=5,         # Conservative for serverless
    max_overflow=10,     # Allow burst connections
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=3600    # Recycle after 1 hour
)
```

**Rationale**:
- Neon serverless has connection limits
- Pre-ping prevents stale connection errors
- Recycle prevents long-lived connection issues

---

### Query Optimization

**Indexes Required**:
```sql
CREATE INDEX idx_tasks_owner_id ON tasks(owner_id);
```

**Rationale**:
- All queries filter by owner_id
- Index enables fast user-scoped lookups
- Essential for performance at scale

---

## Security Decisions

### 1. JWT Verification Strategy

**Pattern**: Verify signature + extract claims

```python
def verify_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, BETTER_AUTH_SECRET, algorithms=["HS256"])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
```

**Security Measures**:
- ✅ Signature verification (prevents tampering)
- ✅ Algorithm enforcement (prevents algorithm substitution attack)
- ✅ No token claims exposed in error messages

---

### 2. Authorization Pattern

**Pattern**: Validate path user_id against JWT user_id

```python
if path_user_id != jwt_user_id:
    raise HTTPException(status_code=403, detail="Cannot access another user's tasks")
```

**Security Measures**:
- ✅ Explicit path validation
- ✅ Fail-closed (deny by default)
- ✅ Clear error message (no info leakage)

---

### 3. SQL Injection Prevention

**Pattern**: Use SQLModel ORM (parameterized queries)

```python
# SAFE: SQLModel generates parameterized query
result = await session.execute(
    select(Task).where(Task.owner_id == user_id)
)

# UNSAFE: Never concatenate user input
# query = f"SELECT * FROM tasks WHERE owner_id = {user_id}"  # DON'T DO THIS
```

**Security Measures**:
- ✅ All queries use ORM (no raw SQL)
- ✅ Parameterized queries prevent injection
- ✅ Type validation via Pydantic

---

## Deployment Considerations

### Environment Variables

**Required**:
- `DATABASE_URL`: Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET`: Shared JWT secret (matches frontend)
- `CORS_ORIGINS`: Allowed frontend origins

**Optional**:
- `DEBUG`: Enable SQL query logging (default: False)
- `APP_NAME`: API title in OpenAPI docs
- `APP_VERSION`: API version

**Security**:
- Never commit .env files to version control
- Use secret management in production (AWS Secrets Manager, etc.)
- Rotate secrets periodically

---

### Health Check Endpoint

**Recommendation**: Add `/health` endpoint for monitoring

```python
@app.get("/health")
async def health_check():
    # Test database connection
    # Return {"status": "healthy"} or 503
    pass
```

**Benefits**:
- Load balancer health checks
- Uptime monitoring
- Database connection verification

---

## Conclusion

All research questions resolved. Technology stack confirmed. Design patterns established. Ready to proceed with implementation via `/sp.tasks` and `/sp.implement`.

**Key Decisions Summary**:
1. ✅ API pattern: `/api/{user_id}/tasks` with dual validation
2. ✅ Database: Rename `todos` to `tasks` for consistency
3. ✅ Responses: Return full TaskResponse objects
4. ✅ Toggle: No body, flip current state
5. ✅ Errors: FastAPI default with `detail` field
6. ✅ Architecture: Lightweight service layer pattern

All decisions align with specification requirements and project constitution.
