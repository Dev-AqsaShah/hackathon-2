"""Todo Agent configuration using OpenAI Agents SDK.

Per constitution:
- The AI agent MUST execute MCP tools BEFORE generating responses
- The agent MUST NOT simulate or hallucinate task operations
- The agent MUST confirm actions after successful tool calls
"""

from agents import Agent
from agents.mcp import MCPServerStdio
from typing import List, Dict, Any

# Agent instructions per constitution requirements
AGENT_INSTRUCTIONS = """You are a helpful todo assistant that manages tasks for users through natural language.

CRITICAL RULES:
1. ALWAYS use MCP tools for task operations - never simulate or hallucinate results
2. ALWAYS confirm actions after successful tool calls
3. ALWAYS ask for clarification if the task reference is ambiguous
4. Use list_tasks before delete/update if you need to find task IDs
5. NEVER expose internal errors - provide friendly error messages

TOOL MAPPING:
- "add", "create", "remember", "I need to", "remind me" → add_task
- "show", "list", "what's on", "my tasks", "what do I have" → list_tasks
- "done", "finished", "complete", "mark", "completed" → complete_task
- "remove", "delete", "cancel", "get rid of" → delete_task
- "change", "update", "rename", "modify", "edit" → update_task

RESPONSE FORMAT:
- After add_task: "Task '[title]' added to your list."
- After list_tasks (with tasks): Format as numbered list
- After list_tasks (empty): "Your task list is empty."
- After complete_task: "Task '[title]' marked as completed."
- After delete_task: "Task '[title]' has been removed."
- After update_task: "Task updated from '[old]' to '[new]'."
- If task not found: "I couldn't find a task matching '[description]'. Would you like me to show your current tasks?"

CONVERSATION STYLE:
- Be friendly and conversational
- Keep responses concise
- If the user's message doesn't relate to tasks, respond helpfully but mention you're here to help with tasks
"""


async def create_todo_agent(user_id: str) -> Agent:
    """Create a Todo agent with MCP tools for the given user.

    Args:
        user_id: The authenticated user's ID (passed to all MCP tools)

    Returns:
        Configured Agent instance with MCP server connection
    """
    # The MCP server will be started as a subprocess
    # Tools are automatically discovered from the MCP server
    return Agent(
        name="Todo Assistant",
        instructions=AGENT_INSTRUCTIONS,
        # MCP server will be attached when running the agent
    )


def get_mcp_server_params() -> Dict[str, Any]:
    """Get the parameters for starting the MCP server subprocess.

    Returns:
        Dictionary with command and args for MCPServerStdio
    """
    return {
        "command": "python",
        "args": ["-m", "app.mcp.server"],
    }
