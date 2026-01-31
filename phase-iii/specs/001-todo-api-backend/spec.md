# Feature Specification: Todo Full-Stack Web Application — Backend & API

**Feature Branch**: `001-todo-api-backend`
**Created**: 2026-01-23
**Status**: Draft
**Input**: User description: "Todo Full-Stack Web Application — Backend & API Specification - Design and implement a secure, scalable FastAPI backend that exposes RESTful APIs for a multi-user Todo application, with strict user isolation, JWT-based authentication, and persistent storage using Neon Serverless PostgreSQL."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Secure Task Retrieval with User Isolation (Priority: P1)

As an authenticated user, I want to retrieve only my tasks through the API so that my data remains private and isolated from other users.

**Why this priority**: Data isolation is the foundational security requirement. Without this, the multi-user system would expose user data across accounts, making the application unusable and insecure.

**Independent Test**: Can be fully tested by creating users with different JWT tokens, adding tasks for each user, and verifying that GET /api/{user_id}/tasks returns only the authenticated user's tasks and rejects unauthorized access.

**Acceptance Scenarios**:

1. **Given** I am an authenticated user with valid JWT token, **When** I request GET /api/{user_id}/tasks with my user_id, **Then** I receive a 200 OK response with only my tasks
2. **Given** I am an authenticated user, **When** I request GET /api/{user_id}/tasks with another user's user_id, **Then** I receive a 403 Forbidden response
3. **Given** I send a request without a JWT token, **When** I request any API endpoint, **Then** I receive a 401 Unauthorized response
4. **Given** I send a request with an invalid JWT token, **When** I request any API endpoint, **Then** I receive a 401 Unauthorized response

---

### User Story 2 - Task Creation and Validation (Priority: P1)

As an authenticated user, I want to create new tasks with proper validation so that I can manage my todo list effectively.

**Why this priority**: Task creation is the core value proposition of a todo application. Without the ability to create tasks, the application provides no value to users.

**Independent Test**: Can be fully tested by authenticating as a user, submitting POST /api/{user_id}/tasks with valid and invalid payloads, and verifying task persistence in the database.

**Acceptance Scenarios**:

1. **Given** I am authenticated, **When** I POST a valid task with title and optional description to /api/{user_id}/tasks, **Then** I receive a 201 Created response with the created task including id and timestamps
2. **Given** I am authenticated, **When** I POST a task without a required title, **Then** I receive a 422 Unprocessable Entity response with validation errors
3. **Given** I am authenticated, **When** I POST a task to /api/{user_id}/tasks where user_id doesn't match my JWT identity, **Then** I receive a 403 Forbidden response
4. **Given** I create a task successfully, **When** I query GET /api/{user_id}/tasks, **Then** the new task appears in my task list

---

### User Story 3 - Task Updates and Completion Toggle (Priority: P2)

As an authenticated user, I want to update my tasks and mark them as complete/incomplete so that I can track my progress.

**Why this priority**: Updating and completing tasks is essential functionality for a todo app, but users can still get value from creating and viewing tasks without this feature.

**Independent Test**: Can be fully tested by creating a task, then using PUT /api/{user_id}/tasks/{id} and PATCH /api/{user_id}/tasks/{id}/complete endpoints to modify the task and verify changes persist.

**Acceptance Scenarios**:

1. **Given** I own a task, **When** I PUT /api/{user_id}/tasks/{id} with updated title or description, **Then** I receive a 200 OK response with the updated task
2. **Given** I own a task, **When** I PATCH /api/{user_id}/tasks/{id}/complete, **Then** the task's completed status toggles and I receive a 200 OK response
3. **Given** I attempt to update another user's task, **When** I PUT /api/{user_id}/tasks/{id}, **Then** I receive a 403 Forbidden response
4. **Given** I request a non-existent task, **When** I PUT /api/{user_id}/tasks/{id}, **Then** I receive a 404 Not Found response

---

### User Story 4 - Task Deletion (Priority: P2)

As an authenticated user, I want to delete my tasks so that I can remove completed or irrelevant items from my list.

**Why this priority**: Deletion is important for task management but users can still use the app effectively without it by simply ignoring unwanted tasks.

**Independent Test**: Can be fully tested by creating a task, deleting it via DELETE /api/{user_id}/tasks/{id}, and verifying it no longer appears in the task list.

**Acceptance Scenarios**:

1. **Given** I own a task, **When** I DELETE /api/{user_id}/tasks/{id}, **Then** I receive a 204 No Content response and the task is removed from my list
2. **Given** I attempt to delete another user's task, **When** I DELETE /api/{user_id}/tasks/{id}, **Then** I receive a 403 Forbidden response
3. **Given** I attempt to delete a non-existent task, **When** I DELETE /api/{user_id}/tasks/{id}, **Then** I receive a 404 Not Found response

---

### User Story 5 - Individual Task Retrieval (Priority: P3)

As an authenticated user, I want to retrieve a single task by ID so that I can view detailed information about a specific task.

**Why this priority**: While useful for detailed views, users can get most value from the list view. This is a convenience feature.

**Independent Test**: Can be fully tested by creating a task and retrieving it via GET /api/{user_id}/tasks/{id}.

**Acceptance Scenarios**:

1. **Given** I own a task, **When** I GET /api/{user_id}/tasks/{id}, **Then** I receive a 200 OK response with the full task details
2. **Given** I attempt to retrieve another user's task, **When** I GET /api/{user_id}/tasks/{id}, **Then** I receive a 403 Forbidden response
3. **Given** I request a non-existent task, **When** I GET /api/{user_id}/tasks/{id}, **Then** I receive a 404 Not Found response

---

### Edge Cases

- What happens when JWT token expires during a request? System must return 401 Unauthorized and require re-authentication
- How does the system handle concurrent updates to the same task? Last-write-wins with updated timestamps
- What happens when the database connection fails? System returns 503 Service Unavailable with appropriate error message
- How does the system handle malformed JWT tokens? System returns 401 Unauthorized without exposing internal errors
- What happens when user_id in URL is not a valid integer? System returns 422 Unprocessable Entity with validation error
- How does the system handle extremely long title or description fields? Pydantic validation enforces maximum lengths (title: 1000 chars, description: 5000 chars)
- What happens when duplicate task creation is attempted? System allows duplicates (no uniqueness constraint on title)
- How does the system handle requests without Content-Type header? FastAPI automatically handles JSON parsing and returns 422 for invalid payloads

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST verify JWT signature using the shared secret (BETTER_AUTH_SECRET) on every API request
- **FR-002**: System MUST extract authenticated user identity from JWT token payload (sub, user_id, or id field)
- **FR-003**: System MUST validate that user_id in URL path matches the authenticated user from JWT token
- **FR-004**: System MUST return 401 Unauthorized for requests with missing, invalid, or expired JWT tokens
- **FR-005**: System MUST return 403 Forbidden when authenticated user attempts to access another user's resources
- **FR-006**: System MUST validate all request payloads using Pydantic/SQLModel schemas before processing
- **FR-007**: System MUST persist all task data to Neon Serverless PostgreSQL database
- **FR-008**: System MUST implement GET /api/{user_id}/tasks endpoint to list all tasks for authenticated user
- **FR-009**: System MUST implement POST /api/{user_id}/tasks endpoint to create a new task with title and optional description
- **FR-010**: System MUST implement GET /api/{user_id}/tasks/{id} endpoint to retrieve a single task by ID
- **FR-011**: System MUST implement PUT /api/{user_id}/tasks/{id} endpoint to update task title and/or description
- **FR-012**: System MUST implement DELETE /api/{user_id}/tasks/{id} endpoint to remove a task
- **FR-013**: System MUST implement PATCH /api/{user_id}/tasks/{id}/complete endpoint to toggle task completion status
- **FR-014**: System MUST return 404 Not Found when requested task does not exist
- **FR-015**: System MUST automatically set created_at timestamp on task creation
- **FR-016**: System MUST automatically update updated_at timestamp on task modification
- **FR-017**: System MUST enforce that title field is required and non-empty for task creation/updates
- **FR-018**: System MUST allow description field to be optional (null/empty)
- **FR-019**: System MUST default completed field to false on task creation
- **FR-020**: System MUST filter tasks by owner_id to ensure data isolation at database query level
- **FR-021**: System MUST use SQLModel ORM for all database interactions
- **FR-022**: System MUST operate statelessly without session storage (rely solely on JWT for authentication)
- **FR-023**: System MUST return appropriate HTTP status codes (200, 201, 204, 401, 403, 404, 422, 500, 503)
- **FR-024**: System MUST return structured error responses with detail field for all error scenarios
- **FR-025**: System MUST support CORS for frontend requests from configured origins

### Key Entities

- **Task**: Represents a todo item owned by a user
  - id: Unique identifier (auto-generated)
  - title: Required, non-empty string (max 1000 characters)
  - description: Optional string (max 5000 characters)
  - completed: Boolean flag (default: false)
  - owner_id: Reference to user who owns the task (foreign key to users.id)
  - created_at: Timestamp of task creation (auto-generated)
  - updated_at: Timestamp of last modification (auto-updated)

- **User** (referenced, not managed by this API): User identity extracted from JWT
  - id: Unique identifier extracted from JWT token
  - email: User email (for reference only, not stored by task API)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All six API endpoints (GET list, POST create, GET single, PUT update, DELETE, PATCH complete) return correct HTTP status codes and response bodies for valid requests
- **SC-002**: 100% of unauthorized requests (missing/invalid JWT or cross-user access attempts) are rejected with appropriate 401/403 status codes
- **SC-003**: All task operations complete within 500ms under normal load (excludes network latency)
- **SC-004**: Task data persists correctly in Neon PostgreSQL with all constraints enforced (foreign key, non-null, timestamps)
- **SC-005**: API passes functional testing with at least 2 users creating, updating, and deleting tasks independently without data leakage
- **SC-006**: Request validation rejects 100% of malformed payloads (missing title, invalid user_id, etc.) with 422 status and descriptive error messages
- **SC-007**: System handles database connection failures gracefully by returning 503 Service Unavailable instead of crashing

## Dependencies *(mandatory)*

### External Systems

- **Neon Serverless PostgreSQL**: Database for persistent task storage
  - Connection via SQLModel async engine
  - Requires DATABASE_URL environment variable
  - Dependency owner: Neon database service

- **Better Auth Frontend**: JWT token issuer for user authentication
  - Provides JWT tokens with user identity claims
  - Shares BETTER_AUTH_SECRET with backend for signature verification
  - Dependency owner: Frontend authentication layer

### Internal Dependencies

- **User Authentication System**: Must exist prior to API implementation
  - Provides user registration and login
  - Issues JWT tokens upon successful authentication
  - Shares secret key with backend API

- **Database Schema**: Users table must exist for foreign key constraints
  - owner_id in tasks references users.id
  - Database migration must create tasks table with proper constraints

## Assumptions *(optional, document if applicable)*

- JWT tokens are issued by Better Auth and contain one of these user identification claims: `sub`, `user_id`, or `id`
- JWT tokens use HS256 algorithm for signing
- BETTER_AUTH_SECRET environment variable is securely shared between frontend and backend
- Database connection pooling is configured appropriately for serverless environment (pool_size=5, max_overflow=10)
- Frontend will handle token refresh and expiration redirects
- API does not implement user registration, login, or logout (delegated to Better Auth)
- All timestamps use UTC timezone
- Task title and description fields accept UTF-8 characters
- API responses use JSON format exclusively
- Concurrent requests from same user are handled independently without locking
- Database foreign key constraints cascade deletes are NOT enabled (deleting a user won't automatically delete their tasks - handled at application level if needed)

## Out of Scope *(optional, explicitly excluded)*

- **Frontend UI implementation**: This spec covers only backend API, not React/Next.js components
- **User management endpoints**: No registration, login, logout, password reset, or profile management
- **Email notifications**: No email triggers for task creation, completion, or reminders
- **Task sharing or collaboration**: Each task is owned by exactly one user, no multi-user task ownership
- **Task categories, tags, or labels**: Tasks have only title, description, and completion status
- **Task due dates or priorities**: No scheduling or prioritization fields
- **Search or filtering capabilities**: API returns all user tasks without query parameters for filtering
- **Pagination**: Task list endpoint returns all tasks without pagination
- **Rate limiting or throttling**: No API request rate limits enforced
- **Audit logging**: No persistent logs of who accessed or modified what
- **Data export/import**: No bulk operations or data migration endpoints
- **Real-time notifications**: No WebSocket or SSE for live updates
- **Task history or versioning**: No tracking of task modification history
- **Soft deletes**: DELETE operation permanently removes tasks from database
- **OAuth or third-party authentication**: JWT verification only, no OAuth providers

## Security Considerations *(optional, document if applicable)*

- **JWT Secret Protection**: BETTER_AUTH_SECRET must be stored securely (environment variables only, never in code or version control)
- **SQL Injection Prevention**: All database queries use SQLModel ORM with parameterized queries (no raw SQL)
- **Authorization Enforcement**: Every endpoint verifies user_id in URL matches JWT user identity before processing
- **Input Validation**: All request payloads validated by Pydantic schemas to prevent injection attacks
- **Error Message Sanitization**: Error responses do not expose internal system details, database schema, or stack traces
- **CORS Configuration**: Only configured frontend origins allowed (CORS_ORIGINS environment variable)
- **HTTPS Enforcement**: Production deployment must use HTTPS (SSL/TLS) for all API requests
- **Token Expiration Handling**: Expired JWT tokens rejected with 401, no grace period
- **Database Connection Security**: Neon PostgreSQL requires SSL connection (ssl=require in connection string)
- **No User Data Exposure**: API never returns other users' data, enforced by database-level filtering on owner_id

## Non-Functional Requirements *(optional)*

### Performance

- **Latency**: API endpoints respond within 500ms under normal load (p95)
- **Throughput**: Support at least 100 concurrent requests per second
- **Database Queries**: Each endpoint executes minimal queries (1-2 queries maximum)
- **Connection Pooling**: Reuse database connections via pool to minimize connection overhead

### Reliability

- **Error Handling**: All exceptions caught and converted to appropriate HTTP error responses
- **Database Resilience**: Graceful degradation when database is unavailable (503 responses, not crashes)
- **Idempotency**: GET, PUT, DELETE operations are idempotent (safe to retry)

### Maintainability

- **Code Structure**: Clear separation between routing layer (FastAPI routes), business logic (services), and data access (SQLModel ORM)
- **Type Safety**: Python type hints on all functions and Pydantic models for request/response validation
- **Documentation**: FastAPI auto-generates OpenAPI/Swagger documentation for all endpoints
- **Error Messages**: Descriptive error responses with field-level validation details

### Scalability

- **Stateless Design**: No server-side session storage, scales horizontally
- **Connection Pooling**: Database connections managed efficiently for serverless constraints
- **No Blocking Operations**: Use async/await for all I/O operations
