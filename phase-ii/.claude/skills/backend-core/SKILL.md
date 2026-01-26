Skill name: Backend Skill

Purpose:
Enable the design and implementation of backend service logic, including
API routes, request/response handling, and database connectivity.

Scope:
This skill governs how backend APIs are structured, validated, and executed.
It focuses on correctness, clarity, and maintainability of the service layer.

Capabilities:
- Define REST API routes and endpoints
- Handle HTTP requests and responses
- Apply request and response validation
- Integrate authentication and authorization at the API layer
- Connect to databases via defined data-access layers
- Perform CRUD operations safely
- Handle errors, status codes, and API contracts

Design principles enforced:
- API-first and contract-driven design
- Clear separation of concerns
- Explicit request and response schemas
- Deterministic behavior
- Minimal and readable logic
- Consistent error handling

Input handling:
- Accepts HTTP requests and parameters
- Validates inputs before processing
- Rejects invalid or malformed requests explicitly
- Delegates auth checks and DB logic to appropriate skills

Constraints:
- Backend layer only
- No frontend or UI concerns
- No business logic beyond API orchestration
- No speculative or undocumented endpoints

Dependencies:
- Validation Skill (mandatory for request/response validation)
- Auth Skill (for authentication and authorization)
- Database Skill (for persistence and data access)

Output standards:
- Well-defined API routes
- Clear request/response models
- Explicit validation and error messages
- Clean, maintainable backend code
- Predictable and testable behavior

Success definition:
- Routes behave exactly as specified
- Requests and responses are validated correctly
- Database connections and operations are reliable
- Auth is correctly enforced at the API level
- Backend code is readable, minimal, and auditable
