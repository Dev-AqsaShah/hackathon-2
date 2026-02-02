# Implementation Plan: Todo AI Chatbot

**Branch**: `001-todo-ai-chatbot` | **Date**: 2026-01-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-todo-ai-chatbot/spec.md`

## Summary

Build an AI-powered chatbot that manages todos via natural language using the official MCP Python SDK, OpenAI Agents SDK, and a stateless FastAPI backend. The system follows the mandatory architecture: ChatKit UI → FastAPI Chat Endpoint → OpenAI Agent → MCP Tools → Neon PostgreSQL Database.

## Technical Context

**Language/Version**: Python 3.13+, TypeScript/JavaScript (Frontend)
**Primary Dependencies**:
- Backend: FastAPI, SQLModel, `mcp` (Model Context Protocol SDK), `openai-agents` (OpenAI Agents SDK)
- Frontend: Next.js 16+ with ChatKit UI components
- Auth: Better Auth with JWT

**Storage**: Neon Serverless PostgreSQL via SQLModel ORM
**Testing**: pytest (backend), manual E2E testing
**Target Platform**: Web application (Linux/Windows server, modern browsers)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: <5 seconds for task operations, 50 concurrent users
**Constraints**: Stateless server, MCP-only database access for tasks, no business logic in frontend
**Scale/Scope**: Single-user conversations, 5 MCP tools, 4 database tables

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status |
|-----------|-------------|--------|
| I. Security & User Isolation | Every MCP tool call includes user_id; users never access others' tasks | ✅ PASS |
| II. Tool-First Accuracy | Agent executes MCP tools BEFORE generating responses | ✅ PASS |
| III. Agent Behavior Clarity | Agent understands NL variations, confirms actions, handles errors | ✅ PASS |
| IV. Stateless Reproducibility | Server fetches history from DB each request; no in-memory state | ✅ PASS |
| V. MCP-Centric Modularity | Architecture follows ChatKit → FastAPI → Agent → MCP → DB | ✅ PASS |

**MCP Tool Authority Check**:
- `add_task` - Creates tasks (includes user_id) ✅
- `list_tasks` - Retrieves tasks (filtered by user_id) ✅
- `complete_task` - Marks complete (validates user_id ownership) ✅
- `delete_task` - Removes tasks (validates user_id ownership) ✅
- `update_task` - Modifies tasks (validates user_id ownership) ✅

**Gate Result**: PASS - All constitution principles satisfied by design.

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-ai-chatbot/
├── plan.md              # This file
├── research.md          # Phase 0 output - technology decisions
├── data-model.md        # Phase 1 output - database entities
├── quickstart.md        # Phase 1 output - setup instructions
├── contracts/           # Phase 1 output - API contracts
│   ├── chat-api.yaml    # Chat endpoint OpenAPI spec
│   └── mcp-tools.md     # MCP tool specifications
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Environment configuration
│   ├── models/              # SQLModel database models
│   │   ├── __init__.py
│   │   ├── task.py          # Task model
│   │   ├── conversation.py  # Conversation model
│   │   └── message.py       # Message model
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   └── chat.py      # POST /api/{user_id}/chat
│   │   └── deps.py          # Dependencies (auth, db)
│   ├── mcp/
│   │   ├── __init__.py
│   │   ├── server.py        # MCP server setup
│   │   └── tools/           # MCP tool implementations
│   │       ├── __init__.py
│   │       ├── add_task.py
│   │       ├── list_tasks.py
│   │       ├── complete_task.py
│   │       ├── delete_task.py
│   │       └── update_task.py
│   ├── agent/
│   │   ├── __init__.py
│   │   └── todo_agent.py    # OpenAI Agent configuration
│   └── db/
│       ├── __init__.py
│       └── session.py       # Database session management
├── requirements.txt
└── tests/
    ├── __init__.py
    ├── test_mcp_tools.py    # MCP tool unit tests
    └── test_chat_endpoint.py

frontend/
├── app/
│   ├── layout.tsx           # Root layout with auth
│   ├── page.tsx             # Home/redirect
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   └── chat/
│       └── page.tsx         # ChatKit interface
├── components/
│   ├── chat/
│   │   ├── ChatContainer.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageInput.tsx
│   │   └── Message.tsx
│   └── ui/                  # Shared UI components
├── lib/
│   ├── auth.ts              # Better Auth client config
│   ├── api.ts               # API client for chat endpoint
│   └── types.ts             # TypeScript interfaces
├── package.json
└── next.config.js
```

**Structure Decision**: Web application structure with separate `backend/` (FastAPI + MCP + Agent) and `frontend/` (Next.js + ChatKit) directories. This separation enforces the constitution's modularity principle and allows independent deployment.

## Complexity Tracking

> No constitution violations - standard web architecture with MCP layer

| Decision | Rationale | Alternative Considered |
|----------|-----------|------------------------|
| MCP via stdio subprocess | Simpler than HTTP server; official SDK pattern | MCPServerStreamableHttp - unnecessary for single-server deployment |
| Single conversation per user | Spec assumption; simpler state management | Multiple threads - out of scope for Phase III |
| SQLModel ORM | Constitution requirement; type-safe queries | Raw SQL - less safe, more verbose |

## Architecture Decisions

### AD-001: MCP Server Transport

**Decision**: Use `MCPServerStdio` for local subprocess communication

**Rationale**:
- Simplest transport for single-server deployments
- No network configuration required
- Official pattern from OpenAI Agents SDK documentation
- MCP server runs as child process of FastAPI

**Alternatives Rejected**:
- `MCPServerStreamableHttp`: Adds unnecessary network complexity
- `HostedMCPTool`: Requires external hosting infrastructure

### AD-002: Agent-MCP Integration

**Decision**: OpenAI Agents SDK with `mcp_servers` parameter

**Rationale**:
- Native MCP support built into Agents SDK
- Automatic tool discovery and schema generation
- Built-in tracing for debugging
- Tool filtering available if needed

**Code Pattern**:
```python
async with MCPServerStdio(
    name="Todo MCP Server",
    params={"command": "python", "args": ["-m", "app.mcp.server"]},
) as mcp_server:
    agent = Agent(
        name="Todo Assistant",
        instructions=AGENT_INSTRUCTIONS,
        mcp_servers=[mcp_server],
    )
```

### AD-003: Stateless Request Flow

**Decision**: 6-step stateless flow per constitution

**Flow**:
1. Receive POST `/api/{user_id}/chat` with message
2. Verify JWT token matches user_id
3. Fetch conversation history from database
4. Store new user message in database
5. Run agent with history + new message (agent calls MCP tools)
6. Store assistant response in database
7. Return response to frontend

**Rationale**: Ensures server can restart without data loss; enables horizontal scaling.

### AD-004: Database Schema Design

**Decision**: 4 tables with user_id foreign keys

**Tables**:
- `users` (managed by Better Auth)
- `tasks` (user_id FK, title, is_completed, timestamps)
- `conversations` (user_id FK, timestamps)
- `messages` (conversation_id FK, role, content, timestamps)

**Rationale**: Enforces user isolation at database level; supports conversation persistence.
