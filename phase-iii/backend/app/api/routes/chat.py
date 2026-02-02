"""Chat API endpoint for Todo AI Chatbot (Phase 3).

Per constitution:
- Server MUST be stateless (rebuild context from DB each request)
- Server MUST store both user and assistant messages
- Agent MUST use tools for task operations
"""

import uuid
import json
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlmodel import select, Session
from sqlmodel.ext.asyncio.session import AsyncSession
from openai import OpenAI

from app.api.deps import CurrentUser
from app.core.config import settings
from app.core.database import get_session
from app.db.session import engine as sync_engine
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.todo import Task

router = APIRouter()

# Initialize OpenAI client
if not settings.OPENAI_API_KEY:
    print("[WARNING] OPENAI_API_KEY not configured!")
    client = None
else:
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    print(f"[INFO] OpenAI client initialized with key: {settings.OPENAI_API_KEY[:10]}...")


class ChatRequest(BaseModel):
    """Chat message request."""
    message: str = Field(..., min_length=1, max_length=2000)
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    """Chat message response."""
    message: str
    conversation_id: str


class HistoryMessage(BaseModel):
    """Message in history response."""
    id: str
    role: str
    content: str
    created_at: datetime


class ConversationHistoryResponse(BaseModel):
    """Conversation history response."""
    conversation_id: str
    messages: list[HistoryMessage]


# Define tools for OpenAI function calling
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "add_task",
            "description": "Create a new task for the user. Use when user wants to add, create, or remember something to do.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "The task title/description"
                    }
                },
                "required": ["title"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_tasks",
            "description": "List all tasks for the user. Use when user wants to see, show, or check their tasks.",
            "parameters": {
                "type": "object",
                "properties": {
                    "filter": {
                        "type": "string",
                        "enum": ["all", "pending", "completed"],
                        "description": "Filter tasks by status"
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "complete_task",
            "description": "Mark a task as completed. Use when user says they finished or completed a task.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "integer",
                        "description": "The task ID to mark as complete"
                    }
                },
                "required": ["task_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "delete_task",
            "description": "Delete a task. Use when user wants to remove or cancel a task.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "integer",
                        "description": "The task ID to delete"
                    }
                },
                "required": ["task_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_task",
            "description": "Update a task's title. Use when user wants to change or rename a task.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "integer",
                        "description": "The task ID to update"
                    },
                    "new_title": {
                        "type": "string",
                        "description": "The new task title"
                    }
                },
                "required": ["task_id", "new_title"]
            }
        }
    }
]

SYSTEM_PROMPT = """You are a helpful todo assistant that manages tasks for users through natural language.

CRITICAL RULES:
1. ALWAYS use the provided tools for task operations - never simulate or hallucinate results
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

CONVERSATION STYLE:
- Be friendly and conversational
- Keep responses concise
- If the user's message doesn't relate to tasks, respond helpfully but mention you're here to help with tasks
"""


def execute_tool(user_id: str, tool_name: str, arguments: dict) -> str:
    """Execute a tool and return the result."""
    print(f"[TOOL] Executing {tool_name} with args: {arguments} for user: {user_id}")

    try:
        with Session(sync_engine) as session:
            if tool_name == "add_task":
                title = arguments.get("title", "").strip()
                if not title:
                    return json.dumps({"success": False, "error": "Title cannot be empty"})

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

                print(f"[TOOL] Task created: id={task.id}, title={task.title}")

                return json.dumps({
                    "success": True,
                    "task": {"id": task.id, "title": task.title}
                })

            elif tool_name == "list_tasks":
                filter_type = arguments.get("filter", "all")
                statement = select(Task).where(Task.owner_id == user_id)

                if filter_type == "pending":
                    statement = statement.where(Task.completed == False)
                elif filter_type == "completed":
                    statement = statement.where(Task.completed == True)

                statement = statement.order_by(Task.created_at.desc())
                tasks = session.exec(statement).all()

                task_list = [
                    {"id": t.id, "title": t.title, "completed": t.completed}
                    for t in tasks
                ]

                return json.dumps({
                    "success": True,
                    "tasks": task_list,
                    "count": len(task_list)
                })

            elif tool_name == "complete_task":
                task_id = arguments.get("task_id")
                if not task_id:
                    return json.dumps({"success": False, "error": "task_id is required"})

                task = session.get(Task, task_id)
                if not task or task.owner_id != user_id:
                    return json.dumps({"success": False, "error": "Task not found"})

                task.completed = True
                task.updated_at = datetime.utcnow()
                session.add(task)
                session.commit()
                session.refresh(task)

                return json.dumps({
                    "success": True,
                    "task": {"id": task.id, "title": task.title, "completed": task.completed}
                })

            elif tool_name == "delete_task":
                task_id = arguments.get("task_id")
                if not task_id:
                    return json.dumps({"success": False, "error": "task_id is required"})

                task = session.get(Task, task_id)
                if not task or task.owner_id != user_id:
                    return json.dumps({"success": False, "error": "Task not found"})

                deleted_title = task.title
                session.delete(task)
                session.commit()

                return json.dumps({
                    "success": True,
                    "deleted_task": {"id": task_id, "title": deleted_title}
                })

            elif tool_name == "update_task":
                task_id = arguments.get("task_id")
                new_title = arguments.get("new_title", "").strip()

                if not task_id:
                    return json.dumps({"success": False, "error": "task_id is required"})
                if not new_title:
                    return json.dumps({"success": False, "error": "new_title cannot be empty"})

                task = session.get(Task, task_id)
                if not task or task.owner_id != user_id:
                    return json.dumps({"success": False, "error": "Task not found"})

                old_title = task.title
                task.title = new_title
                task.updated_at = datetime.utcnow()
                session.add(task)
                session.commit()
                session.refresh(task)

                return json.dumps({
                    "success": True,
                    "task": {"id": task.id, "old_title": old_title, "new_title": task.title}
                })

            else:
                return json.dumps({"success": False, "error": f"Unknown tool: {tool_name}"})

    except Exception as e:
        print(f"[TOOL ERROR] {tool_name} failed: {e}")
        import traceback
        traceback.print_exc()
        return json.dumps({"success": False, "error": f"Tool execution failed: {str(e)}"})


def run_chat_completion(user_id: str, messages: list) -> str:
    """Run OpenAI chat completion with tool calling."""
    print(f"[CHAT] Running completion for user: {user_id}")
    print(f"[CHAT] Messages count: {len(messages)}")

    if client is None:
        print("[ERROR] OpenAI client not initialized - OPENAI_API_KEY missing!")
        return "I'm sorry, but the AI service is not configured. Please contact the administrator."

    try:
        # Add system prompt
        full_messages = [{"role": "system", "content": SYSTEM_PROMPT}] + messages

        # First API call
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=full_messages,
            tools=TOOLS,
            tool_choice="auto"
        )

        assistant_message = response.choices[0].message
        print(f"[CHAT] Response received. Tool calls: {assistant_message.tool_calls is not None}")

        # Check if there are tool calls
        if assistant_message.tool_calls:
            print(f"[CHAT] Tool calls: {[tc.function.name for tc in assistant_message.tool_calls]}")
            # Execute each tool call
            tool_results = []
            for tool_call in assistant_message.tool_calls:
                tool_name = tool_call.function.name
                arguments = json.loads(tool_call.function.arguments)

                # Execute the tool
                result = execute_tool(user_id, tool_name, arguments)

                tool_results.append({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "content": result
                })

            # Add assistant message with tool calls and tool results
            full_messages.append({
                "role": "assistant",
                "content": assistant_message.content,
                "tool_calls": [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {
                            "name": tc.function.name,
                            "arguments": tc.function.arguments
                        }
                    }
                    for tc in assistant_message.tool_calls
                ]
            })
            full_messages.extend(tool_results)

            # Second API call to get final response
            final_response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=full_messages
            )

            return final_response.choices[0].message.content or "Done!"

        # No tool calls, return direct response
        return assistant_message.content or "I'm here to help with your tasks!"

    except Exception as e:
        print(f"OpenAI API error: {e}")
        return "I'm having trouble connecting to my AI service. Please try again."


@router.post("/api/{user_id}/chat", response_model=ChatResponse)
async def send_chat_message(
    user_id: str,
    request: ChatRequest,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_session)
):
    """Send a chat message to the AI assistant."""
    print(f"[ENDPOINT] Chat request from user: {user_id}")
    print(f"[ENDPOINT] Message: {request.message[:100]}...")

    # Verify user matches route
    if str(current_user.user_id) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource"
        )

    # Get or create conversation
    result = await db.exec(
        select(Conversation).where(Conversation.user_id == user_id)
    )
    conversation = result.first()

    if not conversation:
        conversation = Conversation(
            id=str(uuid.uuid4()),
            user_id=user_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(conversation)
        await db.commit()
        await db.refresh(conversation)
    else:
        conversation.updated_at = datetime.utcnow()
        db.add(conversation)
        await db.commit()

    # Fetch conversation history
    result = await db.exec(
        select(Message)
        .where(Message.conversation_id == conversation.id)
        .order_by(Message.created_at.asc())
    )
    history_messages = result.all()

    # Store user message
    user_message = Message(
        id=str(uuid.uuid4()),
        conversation_id=conversation.id,
        role="user",
        content=request.message,
        created_at=datetime.utcnow()
    )
    db.add(user_message)
    await db.commit()

    # Build messages for OpenAI
    openai_messages = []
    for msg in history_messages:
        openai_messages.append({
            "role": msg.role,
            "content": msg.content
        })
    openai_messages.append({
        "role": "user",
        "content": request.message
    })

    # Run OpenAI chat completion with tools
    assistant_response = run_chat_completion(user_id, openai_messages)

    # Store assistant response
    assistant_message = Message(
        id=str(uuid.uuid4()),
        conversation_id=conversation.id,
        role="assistant",
        content=assistant_response,
        created_at=datetime.utcnow()
    )
    db.add(assistant_message)
    await db.commit()

    return ChatResponse(
        message=assistant_response,
        conversation_id=conversation.id
    )


@router.get("/api/{user_id}/chat/history", response_model=ConversationHistoryResponse)
async def get_chat_history(
    user_id: str,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_session),
    limit: int = 50
):
    """Get conversation history for the user."""
    if str(current_user.user_id) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource"
        )

    result = await db.exec(
        select(Conversation).where(Conversation.user_id == user_id)
    )
    conversation = result.first()

    if not conversation:
        return ConversationHistoryResponse(
            conversation_id="",
            messages=[]
        )

    result = await db.exec(
        select(Message)
        .where(Message.conversation_id == conversation.id)
        .order_by(Message.created_at.asc())
        .limit(limit)
    )
    messages = result.all()

    return ConversationHistoryResponse(
        conversation_id=conversation.id,
        messages=[
            HistoryMessage(
                id=msg.id,
                role=msg.role,
                content=msg.content,
                created_at=msg.created_at
            )
            for msg in messages
        ]
    )
