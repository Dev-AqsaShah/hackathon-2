<!--
  Sync Impact Report
  ==================
  Version change: 1.0.0 → 2.0.0 (MAJOR - Architectural paradigm shift)

  Modified principles:
    - Security → Security & User Isolation (expanded for MCP tool authority)
    - Accuracy → Tool-First Accuracy (redefined around MCP tool execution)
    - Clarity → Agent Behavior Clarity (redefined for natural language processing)
    - Reproducibility → Stateless Reproducibility (redefined for stateless server)
    - Modularity → MCP-Centric Modularity (redefined for agent architecture)

  Added sections:
    - Mandatory Architecture (Architectural Law)
    - Stateless Server Law
    - MCP Tool Authority Rule
    - Tool-First Principle
    - Agent Behavior Rules
    - Conversation Persistence Rule
    - Database Integrity Rule
    - Error Handling Rule
    - UI Independence Rule
    - Natural Language Understanding Requirement
    - Confirmation Response Rule
    - System Goal

  Removed sections:
    - API Behavior table (replaced by MCP Tools)
    - Frontend Standards (replaced by UI Independence Rule)
    - Authentication Standards (simplified for user_id in MCP calls)

  Templates requiring updates:
    - .specify/templates/plan-template.md: ⚠ Review needed (Constitution Check section should reference MCP architecture)
    - .specify/templates/spec-template.md: ✅ Compatible (Requirements section still applicable)
    - .specify/templates/tasks-template.md: ✅ Compatible (Phase structure supports MCP tool implementation)

  Follow-up TODOs:
    - Review plan-template.md Constitution Check to include MCP tool authority validation
-->

# Todo AI Chatbot Constitution (Phase III)

## System Purpose

This project is an AI-powered Todo management chatbot that allows users to manage tasks through natural language conversation.

The AI agent does NOT manage tasks directly. All task operations MUST be executed strictly via MCP tools. The FastAPI server is stateless—all state MUST be stored and retrieved from the database.

## Core Principles

### I. Security & User Isolation

All user data and task operations MUST be protected through strict user isolation enforced at the MCP tool level.

- Every MCP tool call MUST include user_id parameter
- Users MUST never access another user's tasks
- Secrets and tokens MUST be stored in environment variables (never hardcoded)
- The agent MUST NOT expose raw system errors to users
- All database access MUST be mediated through MCP tools with user_id validation

**Rationale**: Multi-user AI chatbots handle personal task data. User isolation at the tool level prevents data leakage and ensures privacy.

### II. Tool-First Accuracy

The AI agent MUST execute MCP tools BEFORE generating responses for any task-related operation.

- If a request involves tasks: Tool Call FIRST → Assistant Response SECOND
- The agent MUST NOT simulate task operations in text
- The agent MUST NOT hallucinate task IDs or titles
- The agent MUST use list_tasks before delete/update if task_id is unknown
- Tool results MUST be the source of truth for all task data

**Rationale**: Tool-first execution ensures deterministic behavior and prevents the agent from providing inaccurate information about task state.

### III. Agent Behavior Clarity

The AI agent MUST understand natural language variations and map them to correct MCP tools with clear confirmation responses.

- The agent MUST correctly interpret phrases like: "remember to...", "I need to...", "add a task...", "done", "remove", "change", "what's pending", "what did I complete"
- The agent MUST ask clarification if task intent is ambiguous
- After every successful tool call, the agent MUST confirm the action to the user
- Error messages MUST be clear, user-friendly, and suggest next actions

**Rationale**: Natural language understanding is the core value proposition. Clear confirmations build user trust and provide feedback.

### IV. Stateless Reproducibility

The FastAPI server MUST be completely stateless. Server restart MUST NOT affect conversations.

- For every request the server MUST:
  1. Fetch conversation history from database
  2. Rebuild messages array for the agent
  3. Store new user message in database
  4. Run the agent with MCP tools
  5. Store assistant response in database
  6. Return response
- The server MUST NOT store session state in memory
- Configuration MUST be environment-based
- Conversation MUST be resumable using conversation_id

**Rationale**: Stateless architecture enables horizontal scaling, crash recovery, and consistent behavior across server restarts.

### V. MCP-Centric Modularity

The system MUST strictly follow the mandatory architecture with clear separation of concerns.

```
ChatKit UI → FastAPI Chat Endpoint → OpenAI Agent → MCP Tools → Database
```

- The frontend (ChatKit) MUST contain NO business logic
- The FastAPI server MUST only orchestrate agent calls and message persistence
- The OpenAI Agent MUST only process natural language and invoke MCP tools
- MCP Tools are the ONLY authorized interface to the database for task operations
- All intelligence MUST exist in: Agent + MCP + Backend (not frontend)

**Rationale**: Strict layer separation ensures each component has a single responsibility and can be developed, tested, and scaled independently.

## MCP Tool Authority

These MCP tools are the ONLY source of truth for task operations:

| Tool | Purpose |
|------|---------|
| `add_task` | Create a new task |
| `list_tasks` | Retrieve tasks for a user |
| `complete_task` | Mark a task as complete |
| `delete_task` | Remove a task |
| `update_task` | Modify task details |

The agent is NOT allowed to:
- Access the database directly
- Modify tasks without MCP tools
- Perform hidden logic outside tool calls

## Technical Standards

### Agent Standards

- The agent MUST understand natural language intent
- The agent MUST map intent to correct MCP tool
- The agent MUST confirm actions in a friendly way
- The agent MUST handle errors gracefully
- The agent MUST never hallucinate task data

### Database Standards

- Only MCP tools can create, update, or delete tasks
- The chat endpoint and agent MUST treat the database as read-only except through MCP tools
- Every message (user and assistant) MUST be stored in the messages table
- Conversation MUST be resumable using conversation_id

### API Standards

- The FastAPI chat endpoint MUST be stateless
- The endpoint MUST rebuild conversation context from database on each request
- The endpoint MUST store both user messages and assistant responses
- Error responses MUST be structured and user-friendly

### Frontend Standards

- The UI MUST be a thin presentation layer only
- The UI MUST NOT contain business logic
- The UI MUST send messages to the chat endpoint and display responses
- The UI MUST handle loading and error states gracefully

## Technology Constraints

### Backend
- Python 3.13+
- FastAPI framework
- OpenAI Agents SDK

### Database
- Neon Serverless PostgreSQL (or compatible)
- Messages table for conversation persistence
- Tasks table for task storage

### Frontend
- ChatKit UI (or compatible chat interface)
- No business logic in frontend

### Agent
- OpenAI-compatible agent framework
- MCP (Model Context Protocol) tools for task operations

## Governance

### Amendment Process

1. Proposed amendments MUST be documented with rationale
2. Changes affecting core principles require explicit approval
3. All amendments MUST include migration plan for existing implementations
4. Version MUST be incremented according to semantic versioning:
   - MAJOR: Architectural paradigm change or principle redefinition
   - MINOR: New principle or section addition
   - PATCH: Clarifications and non-semantic changes

### Compliance

- All code reviews MUST verify compliance with constitution principles
- Architecture decisions MUST be documented via ADRs when significant
- Non-compliance MUST be justified and documented

### Runtime Guidance

Refer to `CLAUDE.md` for agent delegation rules and development workflow.

## System Goal

The goal is NOT to build a Todo app.

The goal is to demonstrate:

**AI Agent + MCP Tools + Stateless Architecture + Spec-Driven Development**

**Version**: 2.0.0 | **Ratified**: 2025-01-22 | **Last Amended**: 2026-01-31
