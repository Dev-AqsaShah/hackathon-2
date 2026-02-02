# MCP Tools Specification

**Feature**: 001-todo-ai-chatbot
**Date**: 2026-01-31

## Overview

These MCP tools are the ONLY authorized interface for task operations. The AI agent MUST use these tools for all task-related requests. Direct database access is prohibited.

## Tool Definitions

### 1. add_task

Creates a new task for the specified user.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "The authenticated user's ID"
    },
    "title": {
      "type": "string",
      "description": "The task title/description",
      "minLength": 1,
      "maxLength": 500
    }
  },
  "required": ["user_id", "title"]
}
```

**Output Schema**:
```json
{
  "type": "object",
  "properties": {
    "success": { "type": "boolean" },
    "task": {
      "type": "object",
      "properties": {
        "id": { "type": "string", "format": "uuid" },
        "title": { "type": "string" },
        "is_completed": { "type": "boolean" },
        "created_at": { "type": "string", "format": "date-time" }
      }
    }
  }
}
```

**Example**:
```
Input: { "user_id": "user123", "title": "Buy groceries" }
Output: {
  "success": true,
  "task": {
    "id": "abc-123",
    "title": "Buy groceries",
    "is_completed": false,
    "created_at": "2026-01-31T10:00:00Z"
  }
}
```

---

### 2. list_tasks

Retrieves all tasks for the specified user with optional filtering.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "The authenticated user's ID"
    },
    "filter": {
      "type": "string",
      "enum": ["all", "pending", "completed"],
      "default": "all",
      "description": "Filter tasks by completion status"
    }
  },
  "required": ["user_id"]
}
```

**Output Schema**:
```json
{
  "type": "object",
  "properties": {
    "success": { "type": "boolean" },
    "tasks": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string", "format": "uuid" },
          "title": { "type": "string" },
          "is_completed": { "type": "boolean" },
          "created_at": { "type": "string", "format": "date-time" }
        }
      }
    },
    "count": { "type": "integer" }
  }
}
```

**Example**:
```
Input: { "user_id": "user123", "filter": "pending" }
Output: {
  "success": true,
  "tasks": [
    { "id": "abc-123", "title": "Buy groceries", "is_completed": false, "created_at": "..." },
    { "id": "def-456", "title": "Call mom", "is_completed": false, "created_at": "..." }
  ],
  "count": 2
}
```

---

### 3. complete_task

Marks a task as completed. Validates that the task belongs to the user.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "The authenticated user's ID"
    },
    "task_id": {
      "type": "string",
      "format": "uuid",
      "description": "The task ID to mark as complete"
    }
  },
  "required": ["user_id", "task_id"]
}
```

**Output Schema**:
```json
{
  "type": "object",
  "properties": {
    "success": { "type": "boolean" },
    "task": {
      "type": "object",
      "properties": {
        "id": { "type": "string", "format": "uuid" },
        "title": { "type": "string" },
        "is_completed": { "type": "boolean" }
      }
    },
    "error": {
      "type": "string",
      "description": "Error message if task not found"
    }
  }
}
```

**Example (success)**:
```
Input: { "user_id": "user123", "task_id": "abc-123" }
Output: {
  "success": true,
  "task": { "id": "abc-123", "title": "Buy groceries", "is_completed": true }
}
```

**Example (not found)**:
```
Input: { "user_id": "user123", "task_id": "nonexistent" }
Output: {
  "success": false,
  "error": "Task not found or does not belong to user"
}
```

---

### 4. delete_task

Deletes a task. Validates that the task belongs to the user.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "The authenticated user's ID"
    },
    "task_id": {
      "type": "string",
      "format": "uuid",
      "description": "The task ID to delete"
    }
  },
  "required": ["user_id", "task_id"]
}
```

**Output Schema**:
```json
{
  "type": "object",
  "properties": {
    "success": { "type": "boolean" },
    "deleted_task": {
      "type": "object",
      "properties": {
        "id": { "type": "string", "format": "uuid" },
        "title": { "type": "string" }
      }
    },
    "error": {
      "type": "string",
      "description": "Error message if task not found"
    }
  }
}
```

**Example (success)**:
```
Input: { "user_id": "user123", "task_id": "abc-123" }
Output: {
  "success": true,
  "deleted_task": { "id": "abc-123", "title": "Buy groceries" }
}
```

---

### 5. update_task

Updates a task's title. Validates that the task belongs to the user.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "The authenticated user's ID"
    },
    "task_id": {
      "type": "string",
      "format": "uuid",
      "description": "The task ID to update"
    },
    "new_title": {
      "type": "string",
      "description": "The new task title",
      "minLength": 1,
      "maxLength": 500
    }
  },
  "required": ["user_id", "task_id", "new_title"]
}
```

**Output Schema**:
```json
{
  "type": "object",
  "properties": {
    "success": { "type": "boolean" },
    "task": {
      "type": "object",
      "properties": {
        "id": { "type": "string", "format": "uuid" },
        "old_title": { "type": "string" },
        "new_title": { "type": "string" },
        "is_completed": { "type": "boolean" }
      }
    },
    "error": {
      "type": "string",
      "description": "Error message if task not found"
    }
  }
}
```

**Example (success)**:
```
Input: { "user_id": "user123", "task_id": "abc-123", "new_title": "Buy organic groceries" }
Output: {
  "success": true,
  "task": {
    "id": "abc-123",
    "old_title": "Buy groceries",
    "new_title": "Buy organic groceries",
    "is_completed": false
  }
}
```

---

## Security Requirements

1. **User Isolation**: Every tool MUST include `user_id` parameter
2. **Ownership Validation**: Tools MUST verify task belongs to user before modify/delete
3. **No Direct SQL**: Tools use SQLModel ORM with parameterized queries
4. **Error Handling**: Tools return structured errors, never raw exceptions

## Agent Integration

The agent uses these tools via the MCP protocol:

```python
from agents import Agent
from agents.mcp import MCPServerStdio

async with MCPServerStdio(
    name="Todo MCP Server",
    params={"command": "python", "args": ["-m", "app.mcp.server"]},
) as mcp_server:
    agent = Agent(
        name="Todo Assistant",
        instructions=AGENT_INSTRUCTIONS,
        mcp_servers=[mcp_server],  # Tools auto-discovered
    )
```

## Tool Discovery

When the agent connects to the MCP server, it automatically discovers:
- Tool names: `add_task`, `list_tasks`, `complete_task`, `delete_task`, `update_task`
- Input schemas (for validation)
- Descriptions (for tool selection)

The agent selects the appropriate tool based on user intent and the tool descriptions.
