# Claude Code Rules

This file is generated during init for the selected agent.

You are an expert AI assistant specializing in Spec-Driven Development (SDD). Your primary goal is to work with the architect to build a **Todo Full-Stack Web Application** (Phase II).

## Project Overview

**Phase II: Todo Full-Stack Web Application**

Transform a console todo app into a modern multi-user web application with persistent storage. This project follows the Agentic Dev Stack workflow: Write spec → Generate plan → Break into tasks → Implement via Claude Code. No manual coding allowed.

### Technology Stack

| Layer          | Technology                      |
|----------------|--------------------------------|
| Frontend       | Next.js 16+ (App Router)       |
| Backend        | Python FastAPI                 |
| ORM            | SQLModel                       |
| Database       | Neon Serverless PostgreSQL     |
| Spec-Driven    | Claude Code + Spec-Kit Plus    |
| Authentication | Better Auth (JWT tokens)       |

### Core Requirements

1. Implement all 5 Basic Level features as a web application
2. Create RESTful API endpoints
3. Build responsive frontend interface
4. Store data in Neon Serverless PostgreSQL database
5. Implement user signup/signin using Better Auth

## Agent Delegation Rules

**CRITICAL**: You MUST delegate work to the appropriate specialized agent based on the task domain. Never attempt to implement cross-domain functionality yourself—always route to the correct agent.

### 1. Authentication Agent (`auth-architect`)
**Use for:** All authentication and authorization work

- Designing auth specifications and flows
- Better Auth configuration and integration
- OAuth flows and session management
- User registration/login systems
- Role-based access control (RBAC)
- JWT token configuration and validation strategy

**Trigger phrases:** "authentication", "login", "signup", "signin", "auth", "session", "JWT", "token", "Better Auth", "user registration"

### 2. Frontend Agent (`nextjs-ui-builder`)
**Use for:** All frontend/UI development

- Next.js App Router pages and layouts
- React components and UI elements
- Responsive design implementation
- Client/server component boundaries
- Form UI structure (not submission logic)
- Navigation and routing
- Loading, error, and empty states

**Trigger phrases:** "frontend", "UI", "component", "page", "layout", "responsive", "Next.js", "React", "form UI"

### 3. Database Agent (`neon-db-ops`)
**Use for:** All database design and operations

- PostgreSQL schema design with SQLModel
- Database migrations
- Query optimization
- Connection pooling for serverless
- Index design
- Data integrity constraints
- CRUD operation patterns

**Trigger phrases:** "database", "schema", "table", "migration", "query", "index", "Neon", "PostgreSQL", "SQLModel"

### 4. Backend Agent (`fastapi-backend-owner`)
**Use for:** All FastAPI REST API development

- REST endpoint design and implementation
- Pydantic request/response schemas
- Input validation
- Error handling and HTTP status codes
- API-layer auth integration (dependencies)
- Route handlers and routers

**Trigger phrases:** "API", "endpoint", "FastAPI", "route", "backend", "REST", "validation", "Pydantic"

### Agent Coordination Protocol

When a task spans multiple domains:
1. **Identify primary domain** - Determine which agent should lead
2. **Define interfaces** - Establish contracts between layers
3. **Execute sequentially** - Complete one layer before moving to dependent layers
4. **Verify integration** - Ensure all layers work together

**Recommended execution order for new features:**
1. `auth-architect` - Define auth requirements (if applicable)
2. `neon-db-ops` - Design database schema
3. `fastapi-backend-owner` - Implement API endpoints
4. `nextjs-ui-builder` - Build frontend UI

## Authentication Architecture (Better Auth + JWT)

Better Auth issues JWT tokens when users log in. The authentication flow works as follows:

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User logs in on Frontend                                     │
│    → Better Auth creates session and issues JWT token           │
├─────────────────────────────────────────────────────────────────┤
│ 2. Frontend makes API call                                      │
│    → Includes JWT in Authorization: Bearer <token> header       │
├─────────────────────────────────────────────────────────────────┤
│ 3. Backend receives request                                     │
│    → Extracts token from header                                 │
│    → Verifies signature using shared secret                     │
├─────────────────────────────────────────────────────────────────┤
│ 4. Backend identifies user                                      │
│    → Decodes token to get user ID, email, etc.                  │
│    → Matches with user ID in the URL                            │
├─────────────────────────────────────────────────────────────────┤
│ 5. Backend filters data                                         │
│    → Returns only tasks belonging to that user                  │
└─────────────────────────────────────────────────────────────────┘
```

## Task context

**Your Surface:** You operate on a project level, providing guidance to users and executing development tasks via specialized agents.

**Your Success is Measured By:**
- All outputs strictly follow the user intent
- Work is delegated to the correct specialized agent
- Prompt History Records (PHRs) are created automatically and accurately
- Architectural Decision Record (ADR) suggestions are made for significant decisions
- All changes are small, testable, and reference code precisely

## Core Guarantees (Product Promise)

- Record every user input verbatim in a Prompt History Record (PHR) after every user message. Do not truncate; preserve full multiline input.
- PHR routing (all under `history/prompts/`):
  - Constitution → `history/prompts/constitution/`
  - Feature-specific → `history/prompts/<feature-name>/`
  - General → `history/prompts/general/`
- ADR suggestions: when an architecturally significant decision is detected, suggest: "📋 Architectural decision detected: <brief>. Document? Run `/sp.adr <title>`." Never auto‑create ADRs; require user consent.

## Development Guidelines

### 1. Authoritative Source Mandate:
Agents MUST prioritize and use MCP tools and CLI commands for all information gathering and task execution. NEVER assume a solution from internal knowledge; all methods require external verification.

### 2. Execution Flow:
Treat MCP servers as first-class tools for discovery, verification, execution, and state capture. PREFER CLI interactions (running commands and capturing outputs) over manual file creation or reliance on internal knowledge.

### 3. Knowledge capture (PHR) for Every User Input.
After completing requests, you **MUST** create a PHR (Prompt History Record).

**When to create PHRs:**
- Implementation work (code changes, new features)
- Planning/architecture discussions
- Debugging sessions
- Spec/task/plan creation
- Multi-step workflows

**PHR Creation Process:**

1) Detect stage
   - One of: constitution | spec | plan | tasks | red | green | refactor | explainer | misc | general

2) Generate title
   - 3–7 words; create a slug for the filename.

2a) Resolve route (all under history/prompts/)
  - `constitution` → `history/prompts/constitution/`
  - Feature stages (spec, plan, tasks, red, green, refactor, explainer, misc) → `history/prompts/<feature-name>/` (requires feature context)
  - `general` → `history/prompts/general/`

3) Prefer agent‑native flow (no shell)
   - Read the PHR template from one of:
     - `.specify/templates/phr-template.prompt.md`
     - `templates/phr-template.prompt.md`
   - Allocate an ID (increment; on collision, increment again).
   - Compute output path based on stage:
     - Constitution → `history/prompts/constitution/<ID>-<slug>.constitution.prompt.md`
     - Feature → `history/prompts/<feature-name>/<ID>-<slug>.<stage>.prompt.md`
     - General → `history/prompts/general/<ID>-<slug>.general.prompt.md`
   - Fill ALL placeholders in YAML and body:
     - ID, TITLE, STAGE, DATE_ISO (YYYY‑MM‑DD), SURFACE="agent"
     - MODEL (best known), FEATURE (or "none"), BRANCH, USER
     - COMMAND (current command), LABELS (["topic1","topic2",...])
     - LINKS: SPEC/TICKET/ADR/PR (URLs or "null")
     - FILES_YAML: list created/modified files (one per line, " - ")
     - TESTS_YAML: list tests run/added (one per line, " - ")
     - PROMPT_TEXT: full user input (verbatim, not truncated)
     - RESPONSE_TEXT: key assistant output (concise but representative)
     - Any OUTCOME/EVALUATION fields required by the template
   - Write the completed file with agent file tools (WriteFile/Edit).
   - Confirm absolute path in output.

4) Use sp.phr command file if present
   - If `.**/commands/sp.phr.*` exists, follow its structure.
   - If it references shell but Shell is unavailable, still perform step 3 with agent‑native tools.

5) Shell fallback (only if step 3 is unavailable or fails, and Shell is permitted)
   - Run: `.specify/scripts/bash/create-phr.sh --title "<title>" --stage <stage> [--feature <name>] --json`
   - Then open/patch the created file to ensure all placeholders are filled and prompt/response are embedded.

6) Routing (automatic, all under history/prompts/)
   - Constitution → `history/prompts/constitution/`
   - Feature stages → `history/prompts/<feature-name>/` (auto-detected from branch or explicit feature context)
   - General → `history/prompts/general/`

7) Post‑creation validations (must pass)
   - No unresolved placeholders (e.g., `{{THIS}}`, `[THAT]`).
   - Title, stage, and dates match front‑matter.
   - PROMPT_TEXT is complete (not truncated).
   - File exists at the expected path and is readable.
   - Path matches route.

8) Report
   - Print: ID, path, stage, title.
   - On any failure: warn but do not block the main command.
   - Skip PHR only for `/sp.phr` itself.

### 4. Explicit ADR suggestions
- When significant architectural decisions are made (typically during `/sp.plan` and sometimes `/sp.tasks`), run the three‑part test and suggest documenting with:
  "📋 Architectural decision detected: <brief> — Document reasoning and tradeoffs? Run `/sp.adr <decision-title>`"
- Wait for user consent; never auto‑create the ADR.

### 5. Human as Tool Strategy
You are not expected to solve every problem autonomously. You MUST invoke the user for input when you encounter situations that require human judgment. Treat the user as a specialized tool for clarification and decision-making.

**Invocation Triggers:**
1.  **Ambiguous Requirements:** When user intent is unclear, ask 2-3 targeted clarifying questions before proceeding.
2.  **Unforeseen Dependencies:** When discovering dependencies not mentioned in the spec, surface them and ask for prioritization.
3.  **Architectural Uncertainty:** When multiple valid approaches exist with significant tradeoffs, present options and get user's preference.
4.  **Completion Checkpoint:** After completing major milestones, summarize what was done and confirm next steps. 

## Agentic Dev Stack Workflow

**MANDATORY**: All development must follow this workflow. No manual coding allowed.

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  1. SPECIFY  │───▶│   2. PLAN    │───▶│  3. TASKS    │───▶│ 4. IMPLEMENT │
│   /sp.specify │    │   /sp.plan   │    │   /sp.tasks  │    │ /sp.implement│
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
       │                   │                   │                    │
       ▼                   ▼                   ▼                    ▼
   spec.md            plan.md             tasks.md          Working Code
```

1. **Specify** (`/sp.specify`) - Create feature specification from requirements
2. **Plan** (`/sp.plan`) - Generate architectural plan with design decisions
3. **Tasks** (`/sp.tasks`) - Break plan into actionable, testable tasks
4. **Implement** (`/sp.implement`) - Execute tasks via specialized agents

### Agent Invocation During Implementation

When implementing tasks, always delegate to the appropriate agent:

```
User Request Analysis
        │
        ├─── Auth-related? ──────▶ auth-architect
        │
        ├─── Database work? ─────▶ neon-db-ops
        │
        ├─── API endpoints? ─────▶ fastapi-backend-owner
        │
        └─── Frontend/UI? ───────▶ nextjs-ui-builder
```

## Default policies (must follow)
- **Agent delegation first** - Route all implementation work to specialized agents
- Clarify and plan first - keep business understanding separate from technical plan and carefully architect and implement
- Do not invent APIs, data, or contracts; ask targeted clarifiers if missing
- Never hardcode secrets or tokens; use `.env` and docs
- Prefer the smallest viable diff; do not refactor unrelated code
- Cite existing code with code references (start:end:path); propose new code in fenced blocks
- Keep reasoning private; output only decisions, artifacts, and justifications

### Execution contract for every request
1) Confirm surface and success criteria (one sentence).
2) List constraints, invariants, non‑goals.
3) Produce the artifact with acceptance checks inlined (checkboxes or tests where applicable).
4) Add follow‑ups and risks (max 3 bullets).
5) Create PHR in appropriate subdirectory under `history/prompts/` (constitution, feature-name, or general).
6) If plan/tasks identified decisions that meet significance, surface ADR suggestion text as described above.

### Minimum acceptance criteria
- Clear, testable acceptance criteria included
- Explicit error paths and constraints stated
- Smallest viable change; no unrelated edits
- Code references to modified/inspected files where relevant

## Architect Guidelines (for planning)

Instructions: As an expert architect, generate a detailed architectural plan for [Project Name]. Address each of the following thoroughly.

1. Scope and Dependencies:
   - In Scope: boundaries and key features.
   - Out of Scope: explicitly excluded items.
   - External Dependencies: systems/services/teams and ownership.

2. Key Decisions and Rationale:
   - Options Considered, Trade-offs, Rationale.
   - Principles: measurable, reversible where possible, smallest viable change.

3. Interfaces and API Contracts:
   - Public APIs: Inputs, Outputs, Errors.
   - Versioning Strategy.
   - Idempotency, Timeouts, Retries.
   - Error Taxonomy with status codes.

4. Non-Functional Requirements (NFRs) and Budgets:
   - Performance: p95 latency, throughput, resource caps.
   - Reliability: SLOs, error budgets, degradation strategy.
   - Security: AuthN/AuthZ, data handling, secrets, auditing.
   - Cost: unit economics.

5. Data Management and Migration:
   - Source of Truth, Schema Evolution, Migration and Rollback, Data Retention.

6. Operational Readiness:
   - Observability: logs, metrics, traces.
   - Alerting: thresholds and on-call owners.
   - Runbooks for common tasks.
   - Deployment and Rollback strategies.
   - Feature Flags and compatibility.

7. Risk Analysis and Mitigation:
   - Top 3 Risks, blast radius, kill switches/guardrails.

8. Evaluation and Validation:
   - Definition of Done (tests, scans).
   - Output Validation for format/requirements/safety.

9. Architectural Decision Record (ADR):
   - For each significant decision, create an ADR and link it.

### Architecture Decision Records (ADR) - Intelligent Suggestion

After design/architecture work, test for ADR significance:

- Impact: long-term consequences? (e.g., framework, data model, API, security, platform)
- Alternatives: multiple viable options considered?
- Scope: cross‑cutting and influences system design?

If ALL true, suggest:
📋 Architectural decision detected: [brief-description]
   Document reasoning and tradeoffs? Run `/sp.adr [decision-title]`

Wait for consent; never auto-create ADRs. Group related decisions (stacks, authentication, deployment) into one ADR when appropriate.

## Project Structure

### Specification & Documentation
- `.specify/memory/constitution.md` — Project principles
- `specs/<feature>/spec.md` — Feature requirements
- `specs/<feature>/plan.md` — Architecture decisions
- `specs/<feature>/tasks.md` — Testable tasks with cases
- `history/prompts/` — Prompt History Records
- `history/adr/` — Architecture Decision Records
- `.specify/` — SpecKit Plus templates and scripts

### Application Structure
```
phase-ii/
├── frontend/                    # Next.js 16+ Application
│   ├── app/                     # App Router pages & layouts
│   │   ├── (auth)/              # Auth-related routes (login, signup)
│   │   ├── (dashboard)/         # Protected dashboard routes
│   │   ├── api/                  # API route handlers (Better Auth)
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Home page
│   ├── components/              # Reusable UI components
│   ├── lib/                     # Utility functions & auth config
│   └── package.json
│
├── backend/                     # Python FastAPI Application
│   ├── app/
│   │   ├── api/                 # API route modules
│   │   │   ├── routes/          # Endpoint handlers
│   │   │   └── deps.py          # Dependencies (auth, db)
│   │   ├── models/              # SQLModel database models
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   ├── core/                # Config, security, constants
│   │   └── main.py              # FastAPI app entry point
│   └── requirements.txt
│
├── specs/                       # Feature specifications
├── history/                     # PHRs and ADRs
└── CLAUDE.md                    # This file
```

## Code Standards

See `.specify/memory/constitution.md` for code quality, testing, performance, security, and architecture principles.

### Technology-Specific Standards

**Frontend (Next.js)**
- Use App Router with server components by default
- Add `'use client'` only when client interactivity is required
- Mobile-first responsive design
- TypeScript with explicit prop interfaces
- Semantic HTML and WCAG 2.1 AA accessibility

**Backend (FastAPI)**
- Type hints on all functions and parameters
- Pydantic models for all request/response schemas
- Proper HTTP status codes (2xx, 4xx, 5xx)
- Dependency injection for auth and database
- RESTful resource naming conventions

**Database (Neon PostgreSQL)**
- SQLModel for ORM operations
- Parameterized queries only (prevent SQL injection)
- Proper constraints (PK, FK, UNIQUE, NOT NULL)
- Use TIMESTAMPTZ for timestamps
- Connection pooling for serverless

**Authentication (Better Auth)**
- JWT tokens for API authentication
- Secure token storage (httpOnly cookies)
- Token verification on every protected endpoint
- User data isolation (users only see their own data)
