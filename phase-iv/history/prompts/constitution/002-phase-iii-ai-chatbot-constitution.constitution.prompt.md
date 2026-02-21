---
id: 002
title: Phase III AI Chatbot Constitution
stage: constitution
date: 2026-01-31
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: main
user: Dev-AqsaShah
command: /sp.constitution
labels: ["constitution", "governance", "phase-iii", "mcp", "ai-chatbot", "openai-agents"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A (governance document)
---

## Prompt

/sp.constitution

# sp.constitution — Phase III: Todo AI Chatbot (MCP + OpenAI Agents)

## 1. System Purpose

This project is an AI-powered Todo management chatbot that allows users to manage tasks through natural language conversation.

The AI agent does NOT manage tasks directly.

All task operations MUST be executed strictly via MCP tools.

The FastAPI server is stateless. All state must be stored and retrieved from the database.

---

## 2. Mandatory Architecture (Architectural Law)

The system MUST strictly follow this architecture:

ChatKit UI → FastAPI Chat Endpoint → OpenAI Agent → MCP Tools → Database

The Agent is NOT allowed to:
- Access the database directly
- Modify tasks without MCP tools
- Perform hidden logic outside tool calls

All task actions MUST go through MCP tools.

---

## 3. Stateless Server Law (Critical)

The FastAPI server must NEVER store session state in memory.

For every request:

1. Fetch conversation history from database
2. Rebuild messages array for the agent
3. Store new user message in database
4. Run the agent with MCP tools
5. Store assistant response in database
6. Return response

Server restart must NOT affect conversations.

---

## 4. MCP Tool Authority Rule

These MCP tools are the ONLY source of truth for task operations:

- add_task
- list_tasks
- complete_task
- delete_task
- update_task

If user intent matches a task operation, the agent MUST call the appropriate MCP tool.

The agent MUST NOT simulate task operations in text.

---

## 5. Tool-First Principle

If a request involves tasks:

Tool Call FIRST → Assistant Response SECOND

The assistant must never respond before tool execution.

---

## 6. Agent Behavior Rules

The agent MUST:

- Understand natural language variations
- Map intent to correct MCP tool
- Confirm actions in a friendly way
- Handle errors gracefully
- Ask clarification if task is ambiguous
- Use list_tasks before delete/update if task_id is unknown
- Never hallucinate task IDs or titles

---

## 7. Conversation Persistence Rule

Every message MUST be stored:

- User messages → messages table
- Assistant responses → messages table

Conversation must be resumable using conversation_id.

---

## 8. Database Integrity Rule

Only MCP tools can create, update, or delete tasks.

The chat endpoint and agent must treat the database as read-only except through MCP tools.

---

## 9. Error Handling Rule

If a tool returns an error:

- The agent must explain clearly to the user
- Suggest the next possible action
- Never expose raw system errors

---

## 10. UI Independence Rule

The frontend (ChatKit) must contain NO business logic.

All intelligence must exist in:

Agent + MCP + Backend

---

## 11. Security & User Isolation Rule

Every MCP tool call MUST include user_id.

Users must never access another user's tasks.

---

## 12. Spec-Kit Compliance Rule

All implementation MUST follow:

Spec → Plan → Tasks → Claude Code

Manual coding is NOT allowed.

---

## 13. Natural Language Understanding Requirement

The agent must correctly interpret phrases like:

- "remember to..."
- "I need to..."
- "add a task..."
- "done"
- "remove"
- "change"
- "what's pending"
- "what did I complete"

and map them to correct MCP tools.

---

## 14. Confirmation Response Rule

After every successful tool call, the assistant must confirm the action.

Examples:

- "Task 'Buy groceries' added to your list."
- "Task marked as completed."
- "I've updated the task."

---

## 15. System Goal

The goal is NOT to build a Todo app.

The goal is to demonstrate:

AI Agent + MCP Tools + Stateless Architecture + Spec-Driven Development

## Response snapshot

Amended constitution from v1.0.0 to v2.0.0 (MAJOR version bump) for Phase III: Todo AI Chatbot.

**Architectural paradigm shift from:**
- Phase II: Full-Stack Web Application (Next.js + FastAPI + Better Auth)

**To:**
- Phase III: AI Chatbot with MCP Tools (ChatKit → FastAPI → OpenAI Agent → MCP Tools → Database)

**5 Core Principles redefined:**
1. Security & User Isolation - MCP tool-level user_id enforcement
2. Tool-First Accuracy - MCP tools execute BEFORE responses
3. Agent Behavior Clarity - Natural language understanding with confirmations
4. Stateless Reproducibility - Server stores no session state
5. MCP-Centric Modularity - Strict ChatKit → FastAPI → Agent → MCP → DB architecture

**New critical sections:**
- MCP Tool Authority (5 tools: add_task, list_tasks, complete_task, delete_task, update_task)
- Stateless Server Law (6-step request handling flow)
- Tool-First Principle (Tool Call → Response ordering)
- Agent Behavior Rules (NLU, clarification, no hallucination)
- System Goal (demonstrate AI Agent + MCP + Stateless + SDD)

## Outcome

- ✅ Impact: Constitution v2.0.0 ratified, establishing governance for Phase III AI Chatbot development
- 🧪 Tests: N/A (governance document)
- 📁 Files: .specify/memory/constitution.md amended
- 🔁 Next prompts: /sp.specify to define chatbot feature specification
- 🧠 Reflection: Phase III represents a fundamental architectural shift from traditional web app to AI agent architecture with MCP tool enforcement

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Manual review PASS
- Prompt variant (if applicable): Standard /sp.constitution with comprehensive user input
- Next experiment (smallest change to try): N/A - constitution update complete
