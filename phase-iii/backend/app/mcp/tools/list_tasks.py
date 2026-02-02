"""MCP Tool: list_tasks

Retrieves all tasks for the specified user with optional filtering.
Per constitution: Every MCP tool call MUST include user_id parameter.
"""

import json
from typing import Any, Dict, List
from mcp.server import Server
from mcp.types import Tool, TextContent
from sqlmodel import Session, select

from app.db.session import engine
from app.models.todo import Task


def register_list_tasks(server: Server):
    """Register the list_tasks tool with the MCP server."""

    @server.list_tools()
    async def list_tools() -> list[Tool]:
        """List available tools."""
        return [
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
            )
        ]

    @server.call_tool()
    async def call_tool(name: str, arguments: Dict[str, Any]) -> list[TextContent]:
        """Handle tool calls."""
        if name != "list_tasks":
            return [TextContent(type="text", text=f"Unknown tool: {name}")]

        user_id = arguments.get("user_id")
        filter_type = arguments.get("filter", "all")

        # Validate inputs
        if not user_id:
            return [TextContent(
                type="text",
                text='{"success": false, "error": "user_id is required"}'
            )]

        try:
            with Session(engine) as session:
                # Build query with user isolation
                statement = select(Task).where(Task.owner_id == user_id)

                # Apply filter
                if filter_type == "pending":
                    statement = statement.where(Task.completed == False)
                elif filter_type == "completed":
                    statement = statement.where(Task.completed == True)

                # Order by creation date (newest first)
                statement = statement.order_by(Task.created_at.desc())

                # Execute query
                tasks = session.exec(statement).all()

                # Format response
                task_list = [
                    {
                        "id": task.id,
                        "title": task.title,
                        "is_completed": task.completed,
                        "created_at": task.created_at.isoformat()
                    }
                    for task in tasks
                ]

                result = {
                    "success": True,
                    "tasks": task_list,
                    "count": len(task_list)
                }
                return [TextContent(type="text", text=json.dumps(result))]

        except Exception as e:
            # Per constitution: Never expose raw system errors
            return [TextContent(
                type="text",
                text=json.dumps({
                    "success": False,
                    "error": "Failed to retrieve tasks. Please try again."
                })
            )]
