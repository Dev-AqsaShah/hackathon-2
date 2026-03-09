"""MCP Tool: search_tasks

Search and filter tasks by text query, priority, tag, or status.
Per constitution: Every MCP tool call MUST include user_id parameter.
"""

from datetime import datetime, timezone
from typing import Any, Dict


def register_search_tasks(server, engine, Task, Session, select, json, TextContent, Tool):
    """Register the search_tasks tool — called from server.py if using modular registration."""
    pass  # Implementation lives inline in server.py _search_tasks function
