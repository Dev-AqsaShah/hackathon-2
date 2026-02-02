# Research: Todo AI Chatbot

**Feature**: 001-todo-ai-chatbot
**Date**: 2026-01-31
**Status**: Complete

## Technology Decisions

### 1. MCP Python SDK

**Decision**: Use official `mcp` package from PyPI (v1.26.0+)

**Rationale**:
- Official SDK from Model Context Protocol team
- Implements full MCP specification (2025-11-25)
- Supports server-side tool implementation with decorators
- Stable v1.x recommended for production (v2 in Q1 2026)

**Alternatives Considered**:
- Custom tool implementation: More work, no standardization benefits
- LangChain MCP adapters: Extra dependency, less direct control

**Installation**: `pip install mcp>=1.26.0`

**Source**: [GitHub - modelcontextprotocol/python-sdk](https://github.com/modelcontextprotocol/python-sdk)

### 2. OpenAI Agents SDK

**Decision**: Use `openai-agents` package for agent orchestration

**Rationale**:
- Native MCP server integration via `mcp_servers` parameter
- Automatic tool discovery from MCP servers
- Built-in tracing for debugging
- Provider-agnostic (supports 100+ LLMs)
- Lightweight framework with clear primitives

**Key Features Used**:
- `Agent` class for LLM configuration
- `MCPServerStdio` for subprocess MCP communication
- `Runner.run()` for agent execution with tools
- Built-in conversation history via `input` parameter

**Installation**: `pip install openai-agents`

**Source**: [OpenAI Agents SDK Documentation](https://openai.github.io/openai-agents-python/)

### 3. MCP Transport Selection

**Decision**: `MCPServerStdio` (subprocess stdio communication)

**Rationale**:
- Best for local subprocesses with stdin/stdout
- No network configuration required
- Direct integration pattern documented in Agents SDK
- MCP server runs as child process of FastAPI app

**Alternatives Considered**:
- `MCPServerStreamableHttp`: Requires separate HTTP server, network overhead
- `MCPServerSse`: Deprecated, use Streamable HTTP for new projects
- `HostedMCPTool`: Requires publicly reachable server URL

**Pattern**:
```python
async with MCPServerStdio(
    name="Todo MCP Server",
    params={
        "command": "python",
        "args": ["-m", "app.mcp.server"],
    },
) as server:
    agent = Agent(name="Todo Assistant", mcp_servers=[server])
```

### 4. MCP Tool Implementation

**Decision**: Implement 5 tools using MCP SDK `@tool` decorator

**Tools**:
| Tool | Input | Output | Database Operation |
|------|-------|--------|-------------------|
| `add_task` | user_id, title | task object | INSERT INTO tasks |
| `list_tasks` | user_id, filter? | task[] | SELECT FROM tasks WHERE user_id |
| `complete_task` | user_id, task_id | task object | UPDATE tasks SET is_completed |
| `delete_task` | user_id, task_id | success boolean | DELETE FROM tasks WHERE id AND user_id |
| `update_task` | user_id, task_id, title | task object | UPDATE tasks SET title |

**User Isolation**: Every tool requires `user_id` parameter and filters/validates ownership.

### 5. Agent Instructions

**Decision**: Configure agent with explicit task management instructions

**Instructions Template**:
```
You are a helpful todo assistant that manages tasks for users through natural language.

CRITICAL RULES:
1. ALWAYS use MCP tools for task operations - never simulate or hallucinate results
2. ALWAYS confirm actions after successful tool calls
3. ALWAYS ask for clarification if the task reference is ambiguous
4. Use list_tasks before delete/update if you need to find task IDs
5. NEVER expose internal errors - provide friendly error messages

TOOL MAPPING:
- "add", "create", "remember", "I need to" → add_task
- "show", "list", "what's on", "my tasks" → list_tasks
- "done", "finished", "complete", "mark" → complete_task
- "remove", "delete", "cancel" → delete_task
- "change", "update", "rename", "modify" → update_task

RESPONSE FORMAT:
- After add_task: "Task '[title]' added to your list."
- After list_tasks: Format as numbered list or "Your list is empty."
- After complete_task: "Task '[title]' marked as completed."
- After delete_task: "Task '[title]' has been removed."
- After update_task: "Task updated from '[old]' to '[new]'."
```

### 6. Stateless Server Pattern

**Decision**: Implement 6-step request flow per constitution

**Flow Implementation**:
```python
@router.post("/api/{user_id}/chat")
async def chat(user_id: str, request: ChatRequest, db: Session):
    # 1. Verify JWT user matches route user_id
    verify_user(request.token, user_id)

    # 2. Get or create conversation for user
    conversation = get_or_create_conversation(db, user_id)

    # 3. Fetch conversation history from DB
    history = get_messages(db, conversation.id)

    # 4. Store user message in DB
    store_message(db, conversation.id, "user", request.message)

    # 5. Run agent with history + new message
    response = await run_agent(history, request.message, user_id)

    # 6. Store assistant response in DB
    store_message(db, conversation.id, "assistant", response)

    # 7. Return response
    return ChatResponse(message=response, conversation_id=conversation.id)
```

### 7. Frontend Chat Integration

**Decision**: Custom ChatKit-style components with Next.js App Router

**Components**:
- `ChatContainer`: Main wrapper, manages conversation state
- `MessageList`: Displays message history with auto-scroll
- `MessageInput`: Text input with send button and loading state
- `Message`: Individual message bubble (user/assistant styling)

**API Integration**:
```typescript
// lib/api.ts
async function sendMessage(message: string, conversationId?: string): Promise<ChatResponse> {
  const token = await getAuthToken();
  const response = await fetch(`/api/${userId}/chat`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, conversation_id: conversationId }),
  });
  return response.json();
}
```

### 8. Database Connection

**Decision**: Neon Serverless PostgreSQL with SQLModel and connection pooling

**Configuration**:
```python
# app/db/session.py
from sqlmodel import create_engine, Session
import os

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

def get_session():
    with Session(engine) as session:
        yield session
```

**Environment Variables**:
- `DATABASE_URL`: Neon PostgreSQL connection string
- `OPENAI_API_KEY`: For OpenAI Agents SDK
- `BETTER_AUTH_SECRET`: JWT verification secret

## Best Practices Applied

### MCP Tools
- Each tool is a pure function with clear input/output
- User isolation enforced at tool level
- Tools return structured data (not formatted strings)
- Agent formats responses, not tools

### Agent Design
- Clear, explicit instructions with examples
- Tool mapping documented in instructions
- Error handling delegated to agent's natural language
- No hidden logic outside tool calls

### Stateless Architecture
- No global variables or class instances storing state
- Every request fetches fresh data from database
- Conversation context rebuilt from messages table
- Server can restart without losing data

## Dependencies Summary

### Backend (requirements.txt)
```
fastapi>=0.109.0
uvicorn>=0.27.0
sqlmodel>=0.0.14
psycopg2-binary>=2.9.9
mcp>=1.26.0
openai-agents>=0.1.0
python-jose>=3.3.0
python-dotenv>=1.0.0
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "better-auth": "^1.0.0"
  }
}
```
