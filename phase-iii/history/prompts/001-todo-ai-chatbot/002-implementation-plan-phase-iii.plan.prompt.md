---
id: 002
title: Implementation Plan Phase III
stage: plan
date: 2026-01-31
surface: agent
model: claude-opus-4-5-20251101
feature: 001-todo-ai-chatbot
branch: 001-todo-ai-chatbot
user: Dev-AqsaShah
command: /sp.plan
labels: ["plan", "phase-iii", "mcp", "openai-agents", "architecture", "design"]
links:
  spec: specs/001-todo-ai-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-todo-ai-chatbot/plan.md
  - specs/001-todo-ai-chatbot/research.md
  - specs/001-todo-ai-chatbot/data-model.md
  - specs/001-todo-ai-chatbot/quickstart.md
  - specs/001-todo-ai-chatbot/contracts/chat-api.yaml
  - specs/001-todo-ai-chatbot/contracts/mcp-tools.md
tests:
  - N/A (planning document)
---

## Prompt

/sp.plan Phase III: Todo AI Chatbot (MCP + OpenAI Agents + ChatKit)

Goal:
Implement the spec by building MCP tools, Agent backend, chat endpoint, database models, and integrating the ChatKit frontend with the Agent-powered FastAPI backend.

Milestone 1 — Database Foundation
- Create SQLModel models: Task, Conversation, Message
- Create migration scripts
- Ensure user_id is present in all tables
- Verify Neon DB connection

Milestone 2 — MCP Server
- Install Official MCP SDK
- Implement MCP tools:
  - add_task
  - list_tasks
  - update_task
  - complete_task
  - delete_task
- Each tool interacts ONLY with database
- Test tools independently (without agent)

Milestone 3 — OpenAI Agent Setup
- Install OpenAI Agents SDK
- Define Agent with instructions for task management
- Register MCP tools with agent
- Ensure agent never accesses DB directly
- Test agent + tools locally

Milestone 4 — Chat Endpoint (FastAPI)
- Create POST /api/{user_id}/chat
- Fetch conversation history from DB
- Store user message
- Run agent with history + new message
- Store assistant response
- Return response + conversation_id

Milestone 5 — Frontend Integration (ChatKit)
- Setup ChatKit UI
- Connect ChatKit to /api/chat endpoint
- Send message, receive response
- Maintain conversation_id on frontend
- Ensure JWT from Better Auth is attached to request

Milestone 6 — Authentication Flow
- Verify JWT from Better Auth in chat endpoint
- Match JWT user with user_id in route
- Reject unauthorized requests

Milestone 7 — Stateless Verification
- Restart server
- Confirm conversations resume from DB
- Confirm no in-memory state is used

Milestone 8 — Error Handling & Confirmations
- Handle task not found
- Friendly confirmations after each action
- Proper HTTP error responses

Milestone 9 — End-to-End Testing
- Add task via chat
- List tasks
- Update task
- Complete task
- Delete task
- Resume conversation after restart

Deliverables:
- /frontend ChatKit connected to backend
- /backend FastAPI + Agent + MCP
- /specs for agent and tools
- Working chatbot managing tasks via MCP

## Response snapshot

Created comprehensive implementation plan for Phase III: Todo AI Chatbot.

**Research Completed**:
- MCP Python SDK v1.26.0+ (official modelcontextprotocol/python-sdk)
- OpenAI Agents SDK with native MCP support via `mcp_servers` parameter
- MCPServerStdio transport for subprocess communication (recommended for local)
- Stateless 6-step request flow per constitution

**Architecture Decisions**:
1. AD-001: MCPServerStdio for local subprocess (simpler than HTTP)
2. AD-002: OpenAI Agents SDK with native MCP integration
3. AD-003: 6-step stateless request flow
4. AD-004: 4-table database schema (users, tasks, conversations, messages)

**Data Model**:
- Task: id, user_id, title, is_completed, timestamps
- Conversation: id, user_id (unique), timestamps
- Message: id, conversation_id, role, content, created_at
- User isolation via user_id FK on all tables

**API Contracts**:
- POST /api/{user_id}/chat - Main chat endpoint
- GET /api/{user_id}/chat/history - Load conversation history
- 5 MCP tools with full schemas (add_task, list_tasks, complete_task, delete_task, update_task)

**Constitution Check**: All 5 principles PASS
- Security & User Isolation: user_id in all MCP tools
- Tool-First Accuracy: Agent uses MCP before responding
- Agent Behavior Clarity: Instructions define NL mapping
- Stateless Reproducibility: DB-only state, 6-step flow
- MCP-Centric Modularity: ChatKit → FastAPI → Agent → MCP → DB

**Files Generated**:
- plan.md - Implementation plan with architecture decisions
- research.md - Technology decisions with sources
- data-model.md - Database schema with SQLModel definitions
- contracts/chat-api.yaml - OpenAPI 3.1 specification
- contracts/mcp-tools.md - MCP tool specifications
- quickstart.md - Setup and verification guide

## Outcome

- ✅ Impact: Complete implementation plan ready for task generation
- 🧪 Tests: N/A (planning document)
- 📁 Files: 6 planning artifacts created
- 🔁 Next prompts: /sp.tasks to generate implementation tasks
- 🧠 Reflection: Plan leverages official MCP and OpenAI SDKs with documented integration patterns

## Evaluation notes (flywheel)

- Failure modes observed: None - research resolved all technical unknowns
- Graders run and results (PASS/FAIL): Constitution Check PASS (all 5 principles)
- Prompt variant (if applicable): Standard /sp.plan with detailed milestones
- Next experiment (smallest change to try): N/A - planning phase complete
