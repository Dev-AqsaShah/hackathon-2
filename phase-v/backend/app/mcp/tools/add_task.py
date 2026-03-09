"""MCP Tool: add_task

Creates a new task for the specified user.
Per constitution: Every MCP tool call MUST include user_id parameter.
"""

import uuid
from datetime import datetime
from typing import Any, Dict
from mcp.server import Server
from mcp.types import Tool, TextContent
from sqlmodel import Session

from app.db.session import engine
from app.models.todo import Task


def register_add_task(server: Server):
    """Register the add_task tool with the MCP server."""

    @server.list_tools()
    async def list_tools() -> list[Tool]:
        """List available tools."""
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
            )
        ]

    @server.call_tool()
    async def call_tool(name: str, arguments: Dict[str, Any]) -> list[TextContent]:
        """Handle tool calls."""
        if name != "add_task":
            return [TextContent(type="text", text=f"Unknown tool: {name}")]

        user_id = arguments.get("user_id")
        title = arguments.get("title", "").strip()

        # Validate inputs
        if not user_id:
            return [TextContent(
                type="text",
                text='{"success": false, "error": "user_id is required"}'
            )]

        if not title:
            return [TextContent(
                type="text",
                text='{"success": false, "error": "title cannot be empty"}'
            )]

        if len(title) > 500:
            return [TextContent(
                type="text",
                text='{"success": false, "error": "title exceeds 500 characters"}'
            )]

        try:
            # Create the task
            with Session(engine) as session:
                task = Task(
                    title=title,
                    owner_id=user_id,  # Using owner_id from existing Task model
                    completed=False,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                session.add(task)
                session.commit()
                session.refresh(task)

                # Return success response
                import json
                result = {
                    "success": True,
                    "task": {
                        "id": task.id,
                        "title": task.title,
                        "is_completed": task.completed,
                        "created_at": task.created_at.isoformat()
                    }
                }
                return [TextContent(type="text", text=json.dumps(result))]

        except Exception as e:
            # Per constitution: Never expose raw system errors
            import json
            return [TextContent(
                type="text",
                text=json.dumps({
                    "success": False,
                    "error": "Failed to create task. Please try again."
                })
            )]
