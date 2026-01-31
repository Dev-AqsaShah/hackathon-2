# Research Document: Todo Full-Stack Web Application (Phase-2)

**Branch**: `001-todo-fullstack-web`
**Date**: 2026-01-22
**Purpose**: Resolve technical unknowns and establish best practices for implementation

## Technology Stack Research

### 1. Better Auth + Next.js 16 App Router Integration

**Decision**: Use Better Auth v1.x with JWT plugin for Next.js App Router authentication

**Rationale**:
- Native App Router support with server actions and route handlers
- Built-in JWT token generation and validation
- TypeScript-first with full type safety
- Flexible configuration for httpOnly cookies and bearer tokens
- Active maintenance and community support

**Integration Pattern**:
- Better Auth configured in `app/api/auth/[...all]/route.ts` as catch-all route handler
- JWT tokens issued on successful login/signup
- Tokens stored in httpOnly cookies (secure) with option to return in response for API calls
- Shared secret (`BETTER_AUTH_SECRET`) used for both signing (frontend) and verification (backend)

**Alternatives Considered**:
- NextAuth.js: Lacks native JWT plugin architecture; requires custom JWT handling
- Lucia Auth: More low-level; requires more boilerplate for JWT
- Auth0: External dependency; increases complexity and cost

**Reference**: Better Auth official documentation (2026)

---

### 2. JWT Verification in FastAPI

**Decision**: Implement custom JWT verification dependency using `python-jose` library

**Rationale**:
- Python-jose provides robust JWT decode/verification
- FastAPI dependency injection allows clean middleware pattern
- Shared secret verification ensures token authenticity
- Can extract user claims (user_id, email) for request context

**Implementation Pattern**:
```python
# Dependency function
async def get_current_user(token: str = Header(alias="Authorization")):
    # Extract bearer token
    # Verify signature using BETTER_AUTH_SECRET
    # Decode payload to get user_id
    # Return user context for route handlers
```

**Alternatives Considered**:
- FastAPI-JWT-Auth: Additional dependency; overkill for simple verification
- Custom middleware: Less flexible than dependency injection
- OAuth2PasswordBearer: Designed for OAuth flows; not suitable for pre-issued JWTs

**Reference**: FastAPI security documentation, python-jose library docs

---

### 3. Neon Serverless PostgreSQL Connection Pooling

**Decision**: Use `asyncpg` with connection pooling via Neon's serverless driver

**Rationale**:
- Neon serverless PostgreSQL auto-scales connections
- Asyncpg provides async/await support for FastAPI
- SQLModel 0.14+ has async session support
- Connection pooling prevents exhaustion in serverless environments

**Configuration Pattern**:
```python
# Use Neon connection string with pooling parameters
DATABASE_URL = "postgresql+asyncpg://..."

# Configure SQLModel async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    pool_size=5,          # Limit concurrent connections
    max_overflow=10,      # Allow burst connections
    pool_pre_ping=True    # Verify connections before use
)
```

**Best Practices**:
- Set `pool_size` conservatively (5-10) for serverless
- Use `pool_pre_ping` to handle stale connections
- Configure statement timeout at database level
- Use async session context managers (`async with`)

**Alternatives Considered**:
- Psycopg3: Less mature async support than asyncpg
- Plain SQLAlchemy without SQLModel: More boilerplate for model definitions
- Direct asyncpg without ORM: Loses type safety and schema validation

**Reference**: Neon serverless documentation, SQLModel async guide

---

### 4. Next.js API Client Pattern with JWT

**Decision**: Create centralized API client with automatic JWT attachment

**Rationale**:
- Single source of truth for API calls
- Automatic header injection for all authenticated requests
- Consistent error handling across all API calls
- Easy to add retry logic and loading states

**Implementation Pattern**:
```typescript
// lib/api-client.ts
class ApiClient {
  private baseUrl: string;

  async request(endpoint: string, options: RequestInit) {
    // Get JWT from Better Auth session
    const token = await getSession(); // Better Auth helper

    // Attach Authorization header
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Handle token expiration - redirect to login
      }
      throw new ApiError(response);
    }

    return response.json();
  }
}
```

**Alternatives Considered**:
- Fetch directly in components: Code duplication, inconsistent error handling
- React Query without abstraction: Still needs header logic in every call
- Axios: Additional dependency when fetch is sufficient

**Reference**: Next.js data fetching patterns, Better Auth session management

---

### 5. SQLModel Schema Design for Multi-User Isolation

**Decision**: Enforce user isolation at model level with strict foreign key constraints

**Rationale**:
- Database-level constraints prevent data leaks
- SQLModel provides Pydantic validation + SQLAlchemy ORM
- Index on `user_id` ensures fast filtering queries
- Every query automatically scoped to authenticated user

**Schema Pattern**:
```python
class User(SQLModel, table=True):
    id: int = Field(primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Todo(SQLModel, table=True):
    id: int = Field(primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)  # Indexed for fast lookups
    title: str = Field(min_length=1, max_length=1000)
    is_completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

**Query Pattern**:
```python
# All queries MUST include user_id filter
todos = await session.exec(
    select(Todo).where(Todo.user_id == current_user.id)
)
```

**Alternatives Considered**:
- Row-level security (RLS): More complex setup; overkill for simple isolation
- Separate tables per user: Doesn't scale; schema management nightmare
- No foreign key constraints: Loses referential integrity guarantees

**Reference**: SQLModel documentation, PostgreSQL foreign key best practices

---

### 6. Frontend Component Architecture

**Decision**: Server Components by default, Client Components only for interactivity

**Rationale**:
- Server Components reduce JavaScript bundle size
- Better initial page load performance
- Automatic data fetching optimization
- Client Components only where needed (forms, interactive UI)

**Component Strategy**:
```typescript
// Server Component (default) - data fetching
async function TodoList({ userId }: { userId: string }) {
  const todos = await fetchTodos(userId); // Fetch on server
  return <TodoListClient todos={todos} />; // Pass to client
}

// Client Component - interactivity
'use client';
function TodoListClient({ todos }: { todos: Todo[] }) {
  const [items, setItems] = useState(todos);
  // Handle user interactions
}
```

**Usage Guidelines**:
- Server Components: Pages, layouts, static content, initial data fetching
- Client Components: Forms, buttons, modals, real-time updates

**Alternatives Considered**:
- All client components: Larger bundle, slower initial load
- All server components: Can't handle user interactions
- Islands architecture: Too complex for Phase-2 scope

**Reference**: Next.js 16 App Router documentation

---

### 7. RESTful API Design for Todo Operations

**Decision**: Resource-based REST endpoints with standard HTTP methods

**Rationale**:
- Industry-standard patterns
- Self-documenting URLs
- HTTP method semantics match CRUD operations
- Easy to reason about and test

**Endpoint Design**:
```
GET    /api/users/{user_id}/todos          - List all todos
POST   /api/users/{user_id}/todos          - Create todo
GET    /api/users/{user_id}/todos/{id}     - Get single todo
PUT    /api/users/{user_id}/todos/{id}     - Update todo
DELETE /api/users/{user_id}/todos/{id}     - Delete todo
PATCH  /api/users/{user_id}/todos/{id}/complete - Toggle completion
```

**URL Path Rationale**:
- Include `user_id` in path for clarity (still verify JWT matches)
- Use plural resource names (`todos`)
- Use nested routes to show ownership relationship
- Separate completion toggle (PATCH) from full update (PUT)

**Response Patterns**:
- 200 OK: Successful GET, PUT, PATCH, DELETE
- 201 Created: Successful POST with `Location` header
- 400 Bad Request: Validation errors with details
- 401 Unauthorized: Missing/invalid JWT
- 404 Not Found: Resource doesn't exist or doesn't belong to user
- 500 Internal Server Error: Unexpected errors

**Alternatives Considered**:
- GraphQL: Overkill for simple CRUD; adds complexity
- Flat URLs without user_id: Less explicit ownership
- RPC-style endpoints: Less RESTful, harder to cache

**Reference**: REST API best practices, HTTP specification

---

### 8. Database Migration Strategy

**Decision**: Use Alembic for database migrations with SQLModel models

**Rationale**:
- Industry-standard migration tool for SQLAlchemy/SQLModel
- Version-controlled schema changes
- Supports both upgrade and downgrade migrations
- Auto-generation from model changes

**Migration Workflow**:
```bash
# Generate migration from model changes
alembic revision --autogenerate -m "Create users and todos tables"

# Apply migrations
alembic upgrade head

# Rollback if needed
alembic downgrade -1
```

**Initial Migration**:
- Create `users` table with email uniqueness constraint
- Create `todos` table with foreign key to users
- Add indexes on `user_id`, `email`
- Set up timestamps with default values

**Alternatives Considered**:
- Manual SQL scripts: Error-prone, no version control
- SQLModel create_all(): No migration history, can't rollback
- Prisma Migrate: Requires Node.js tooling in Python project

**Reference**: Alembic documentation, SQLModel migration patterns

---

### 9. Error Handling and Validation

**Decision**: Pydantic schemas for request validation, structured error responses

**Rationale**:
- Pydantic provides automatic validation with clear error messages
- FastAPI integrates Pydantic seamlessly
- Consistent error response format across all endpoints
- Client can parse and display validation errors

**Request/Response Schemas**:
```python
# Request schemas
class TodoCreate(BaseModel):
    title: str = Field(min_length=1, max_length=1000)

class TodoUpdate(BaseModel):
    title: str = Field(min_length=1, max_length=1000)

# Response schemas
class TodoResponse(BaseModel):
    id: int
    user_id: int
    title: str
    is_completed: bool
    created_at: datetime
    updated_at: datetime
```

**Error Response Format**:
```json
{
  "detail": "Validation error",
  "errors": [
    {
      "field": "title",
      "message": "Title must not be empty"
    }
  ]
}
```

**Alternatives Considered**:
- Manual validation: Error-prone, inconsistent
- No schemas: Loses type safety and documentation
- JSON Schema: Pydantic is more Pythonic and FastAPI-native

**Reference**: Pydantic documentation, FastAPI validation guide

---

### 10. Environment Configuration

**Decision**: Use python-dotenv for environment variables with validation

**Rationale**:
- Standard pattern for Python applications
- Separate configuration from code
- Easy to override for different environments (dev, staging, prod)
- Pydantic Settings for type-safe config validation

**Configuration Pattern**:
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    better_auth_secret: str
    cors_origins: list[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
```

**Required Environment Variables**:
- `DATABASE_URL`: Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET`: Shared JWT secret (32+ characters)
- `CORS_ORIGINS`: Allowed frontend origins (comma-separated)
- `FRONTEND_URL`: Frontend application URL

**Alternatives Considered**:
- Hardcoded values: Security risk, not environment-agnostic
- Config files (YAML/JSON): Harder to override, risk of committing secrets
- Environment-specific code: Not scalable, hard to maintain

**Reference**: Twelve-Factor App methodology, Pydantic Settings docs

---

## Summary

All technical unknowns have been resolved with concrete decisions backed by rationale and alternatives analysis. The stack is cohesive:

- **Frontend**: Next.js 16 App Router + Better Auth + TypeScript
- **Backend**: FastAPI + SQLModel + python-jose + asyncpg
- **Database**: Neon Serverless PostgreSQL with Alembic migrations
- **Authentication**: Better Auth JWT tokens with shared secret verification

No further clarifications needed. Ready to proceed to Phase 1 (data model and contracts design).
