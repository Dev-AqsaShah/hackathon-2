# Quickstart: Todo AI Chatbot

**Feature**: 001-todo-ai-chatbot
**Date**: 2026-01-31

## Prerequisites

- Python 3.13+
- Node.js 20+
- PostgreSQL (Neon Serverless recommended)
- OpenAI API key

## Environment Setup

### 1. Clone and Navigate

```bash
cd phase-iii
git checkout 001-todo-ai-chatbot
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Variables

Create `backend/.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# OpenAI
OPENAI_API_KEY=sk-...

# Better Auth
BETTER_AUTH_SECRET=your-jwt-secret-here

# Server
HOST=0.0.0.0
PORT=8000
```

### 4. Database Migration

```bash
# Run migrations (from backend directory)
python -m app.db.migrate
```

Or manually via psql:

```bash
psql $DATABASE_URL -f migrations/001_create_tables.sql
```

### 5. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
echo "BETTER_AUTH_SECRET=your-jwt-secret-here" >> .env.local
```

## Running the Application

### Terminal 1: Backend

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

Expected output:
```
▲ Next.js 16.x
- Local: http://localhost:3000
- Ready in 2.5s
```

## Verification Steps

### 1. Health Check

```bash
curl http://localhost:8000/health
# Expected: {"status": "healthy"}
```

### 2. Manual Chat Test (requires auth token)

```bash
# Get a test token (adjust based on your auth setup)
TOKEN="your-jwt-token"
USER_ID="user-123"

curl -X POST "http://localhost:8000/api/${USER_ID}/chat" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"message": "Add buy groceries to my list"}'

# Expected: {"message": "Task 'buy groceries' added to your list.", "conversation_id": "..."}
```

### 3. Frontend Test

1. Open http://localhost:3000
2. Log in with test credentials
3. Type "Add buy groceries" in chat
4. Verify confirmation response appears

## Project Structure Verification

After setup, verify this structure exists:

```
phase-iii/
├── backend/
│   ├── app/
│   │   ├── main.py           ✓ FastAPI entry point
│   │   ├── config.py         ✓ Environment config
│   │   ├── models/           ✓ SQLModel models
│   │   ├── api/routes/       ✓ Chat endpoint
│   │   ├── mcp/              ✓ MCP server & tools
│   │   ├── agent/            ✓ OpenAI Agent config
│   │   └── db/               ✓ Database session
│   ├── requirements.txt      ✓ Python dependencies
│   └── .env                  ✓ Environment variables
│
├── frontend/
│   ├── app/                  ✓ Next.js App Router
│   ├── components/           ✓ UI components
│   ├── lib/                  ✓ Auth & API clients
│   ├── package.json          ✓ Node dependencies
│   └── .env.local            ✓ Environment variables
│
└── specs/001-todo-ai-chatbot/
    ├── spec.md               ✓ Feature specification
    ├── plan.md               ✓ Implementation plan
    ├── research.md           ✓ Technology decisions
    ├── data-model.md         ✓ Database schema
    ├── quickstart.md         ✓ This file
    └── contracts/            ✓ API contracts
```

## Common Issues

### Database Connection Error

```
sqlalchemy.exc.OperationalError: could not connect to server
```

**Solution**: Verify DATABASE_URL in .env matches your Neon connection string.

### OpenAI API Error

```
openai.AuthenticationError: Invalid API Key
```

**Solution**: Verify OPENAI_API_KEY in .env is valid and has credits.

### MCP Server Not Starting

```
MCPServerStdio: Failed to start subprocess
```

**Solution**: Ensure `app.mcp.server` module exists and is importable.

### JWT Validation Error

```
{"error": "Invalid or expired authentication token", "code": "UNAUTHORIZED"}
```

**Solution**: Verify BETTER_AUTH_SECRET matches between frontend and backend.

## Testing the Full Flow

1. **Add a task**: Type "Remember to call mom"
   - Expected: "Task 'call mom' added to your list."

2. **List tasks**: Type "What's on my list?"
   - Expected: Numbered list of tasks

3. **Complete a task**: Type "I finished calling mom"
   - Expected: "Task 'call mom' marked as completed."

4. **Delete a task**: Type "Remove call mom from my list"
   - Expected: "Task 'call mom' has been removed."

5. **Persistence test**: Refresh the page
   - Expected: Previous messages still visible

6. **Server restart test**: Stop and restart backend
   - Expected: Conversation history preserved

## Next Steps

After verification:

1. Run `/sp.tasks` to generate implementation tasks
2. Implement tasks in order (Setup → Foundation → User Stories)
3. Test each milestone before proceeding
