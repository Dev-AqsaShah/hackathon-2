"""MCP Server setup for Todo AI Chatbot.

Per constitution: MCP Tools are the ONLY authorized interface to the database
for task operations. The agent is NOT allowed to access the database directly.
"""

import json
from datetime import datetime
from typing import Any, Dict, List
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent
from sqlmodel import Session, select

# Import database and models
import sys
import os

# Add parent directory to path for imports when run as subprocess
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.db.session import engine
from app.models.todo import Task

# Create the MCP server instance
mcp_server = Server("todo-mcp-server")


# Register tools
@mcp_server.list_tools()
async def list_tools() -> list[Tool]:
    """List all available MCP tools."""
    return [
        Tool(
            name="add_task",
            description="Create a new task for the user. Use when user wants to add, create, or remember something to do.",
            inputSchema={
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
        ),
        Tool(
            name="list_tasks",
            description="Retrieve all tasks for the user. Use when user wants to see, show, or check their tasks.",
            inputSchema={
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
        ),
        Tool(
            name="complete_task",
            description="Mark a task as completed. Use when user says they finished, completed, or are done with a task.",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "string",
                        "description": "The authenticated user's ID"
                    },
                    "task_id": {
                        "type": "integer",
                        "description": "The task ID to mark as complete"
                    }
                },
                "required": ["user_id", "task_id"]
            }
        ),
        Tool(
            name="delete_task",
            description="Delete a task. Use when user wants to remove or cancel a task.",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "string",
                        "description": "The authenticated user's ID"
                    },
                    "task_id": {
                        "type": "integer",
                        "description": "The task ID to delete"
                    }
                },
                "required": ["user_id", "task_id"]
            }
        ),
        Tool(
            name="update_task",
            description="Update a task's title. Use when user wants to change, rename, or modify a task.",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "string",
                        "description": "The authenticated user's ID"
                    },
                    "task_id": {
                        "type": "integer",
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
        ),
    ]


@mcp_server.call_tool()
async def call_tool(name: str, arguments: Dict[str, Any]) -> list[TextContent]:
    """Handle tool calls.

    Per constitution:
    - Every tool MUST include user_id
    - Tools MUST validate ownership before operations
    - Never expose raw system errors
    """
    user_id = arguments.get("user_id")

    if not user_id:
        return [TextContent(
            type="text",
            text=json.dumps({"success": False, "error": "user_id is required"})
        )]

    try:
        if name == "add_task":
            return await _add_task(user_id, arguments)
        elif name == "list_tasks":
            return await _list_tasks(user_id, arguments)
        elif name == "complete_task":
            return await _complete_task(user_id, arguments)
        elif name == "delete_task":
            return await _delete_task(user_id, arguments)
        elif name == "update_task":
            return await _update_task(user_id, arguments)
        else:
            return [TextContent(
                type="text",
                text=json.dumps({"success": False, "error": f"Unknown tool: {name}"})
            )]
    except Exception as e:
        # Per constitution: Never expose raw system errors
        return [TextContent(
            type="text",
            text=json.dumps({"success": False, "error": "An error occurred. Please try again."})
        )]


async def _add_task(user_id: str, arguments: Dict[str, Any]) -> list[TextContent]:
    """Create a new task."""
    title = arguments.get("title", "").strip()

    if not title:
        return [TextContent(
            type="text",
            text=json.dumps({"success": False, "error": "title cannot be empty"})
        )]

    with Session(engine) as session:
        task = Task(
            title=title,
            owner_id=user_id,
            completed=False,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(task)
        session.commit()
        session.refresh(task)

        return [TextContent(
            type="text",
            text=json.dumps({
                "success": True,
                "task": {
                    "id": task.id,
                    "title": task.title,
                    "is_completed": task.completed,
                    "created_at": task.created_at.isoformat()
                }
            })
        )]


async def _list_tasks(user_id: str, arguments: Dict[str, Any]) -> list[TextContent]:
    """List tasks for user."""
    filter_type = arguments.get("filter", "all")

    with Session(engine) as session:
        statement = select(Task).where(Task.owner_id == user_id)

        if filter_type == "pending":
            statement = statement.where(Task.completed == False)
        elif filter_type == "completed":
            statement = statement.where(Task.completed == True)

        statement = statement.order_by(Task.created_at.desc())
        tasks = session.exec(statement).all()

        task_list = [
            {
                "id": task.id,
                "title": task.title,
                "is_completed": task.completed,
                "created_at": task.created_at.isoformat()
            }
            for task in tasks
        ]

        return [TextContent(
            type="text",
            text=json.dumps({
                "success": True,
                "tasks": task_list,
                "count": len(task_list)
            })
        )]


async def _complete_task(user_id: str, arguments: Dict[str, Any]) -> list[TextContent]:
    """Mark a task as completed."""
    task_id = arguments.get("task_id")

    if not task_id:
        return [TextContent(
            type="text",
            text=json.dumps({"success": False, "error": "task_id is required"})
        )]

    with Session(engine) as session:
        task = session.get(Task, task_id)

        if not task or task.owner_id != user_id:
            return [TextContent(
                type="text",
                text=json.dumps({"success": False, "error": "Task not found"})
            )]

        task.completed = True
        task.updated_at = datetime.utcnow()
        session.add(task)
        session.commit()
        session.refresh(task)

        return [TextContent(
            type="text",
            text=json.dumps({
                "success": True,
                "task": {
                    "id": task.id,
                    "title": task.title,
                    "is_completed": task.completed
                }
            })
        )]


async def _delete_task(user_id: str, arguments: Dict[str, Any]) -> list[TextContent]:
    """Delete a task."""
    task_id = arguments.get("task_id")

    if not task_id:
        return [TextContent(
            type="text",
            text=json.dumps({"success": False, "error": "task_id is required"})
        )]

    with Session(engine) as session:
        task = session.get(Task, task_id)

        if not task or task.owner_id != user_id:
            return [TextContent(
                type="text",
                text=json.dumps({"success": False, "error": "Task not found"})
            )]

        deleted_title = task.title
        session.delete(task)
        session.commit()

        return [TextContent(
            type="text",
            text=json.dumps({
                "success": True,
                "deleted_task": {
                    "id": task_id,
                    "title": deleted_title
                }
            })
        )]


async def _update_task(user_id: str, arguments: Dict[str, Any]) -> list[TextContent]:
    """Update a task's title."""
    task_id = arguments.get("task_id")
    new_title = arguments.get("new_title", "").strip()

    if not task_id:
        return [TextContent(
            type="text",
            text=json.dumps({"success": False, "error": "task_id is required"})
        )]

    if not new_title:
        return [TextContent(
            type="text",
            text=json.dumps({"success": False, "error": "new_title cannot be empty"})
        )]

    with Session(engine) as session:
        task = session.get(Task, task_id)

        if not task or task.owner_id != user_id:
            return [TextContent(
                type="text",
                text=json.dumps({"success": False, "error": "Task not found"})
            )]

        old_title = task.title
        task.title = new_title
        task.updated_at = datetime.utcnow()
        session.add(task)
        session.commit()
        session.refresh(task)

        return [TextContent(
            type="text",
            text=json.dumps({
                "success": True,
                "task": {
                    "id": task.id,
                    "old_title": old_title,
                    "new_title": task.title,
                    "is_completed": task.completed
                }
            })
        )]


async def run_mcp_server():
    """Run the MCP server using stdio transport.

    This is called when the server is run as a subprocess by the agent.
    """
    async with stdio_server() as (read_stream, write_stream):
        await mcp_server.run(
            read_stream,
            write_stream,
            mcp_server.create_initialization_options()
        )


if __name__ == "__main__":
    import asyncio
    asyncio.run(run_mcp_server())
