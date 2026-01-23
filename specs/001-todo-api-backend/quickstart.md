# Quickstart Guide: Todo Backend API

**Feature**: Todo Full-Stack Web Application — Backend & API
**Branch**: 001-todo-api-backend
**Date**: 2026-01-23

## Prerequisites

- **Python**: 3.12+ installed
- **PostgreSQL**: Neon Serverless connection string
- **Environment**: BETTER_AUTH_SECRET shared with frontend
- **Tools**: pip, git, curl (for testing)

## Initial Setup (5 minutes)

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Python Dependencies

```bash
pip install -r requirements.txt
```

**Expected Output**:
```
Successfully installed fastapi-0.109.0 sqlmodel-0.0.14 uvicorn-0.27.0 ...
```

### 3. Configure Environment Variables

Create or edit `backend/.env`:

```bash
# Database Configuration (Neon Serverless PostgreSQL)
DATABASE_URL=postgresql+asyncpg://neondb_owner:YOUR_PASSWORD@YOUR_HOST.neon.tech/neondb?ssl=require

# Authentication Secret (MUST match frontend BETTER_AUTH_SECRET)
BETTER_AUTH_SECRET=your-secret-key-here-minimum-32-characters-change-this-in-production

# CORS Configuration
CORS_ORIGINS=http://localhost:3000

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Application Settings
APP_NAME=Todo Full-Stack API
APP_VERSION=1.0.0
DEBUG=True
```

**⚠️ Security**: Never commit `.env` to version control. Use `.env.example` as template.

### 4. Run Database Migrations

```bash
alembic upgrade head
```

**Expected Output**:
```
INFO  [alembic.runtime.migration] Running upgrade 001 -> 002, Rename todos to tasks
```

**Verify Migration**:
```bash
# Test database connection
python -c "
import asyncio
from app.core.database import engine
from sqlalchemy import text

async def test():
    async with engine.connect() as conn:
        result = await conn.execute(text('SELECT COUNT(*) FROM tasks'))
        print(f'Tasks table exists: {result.scalar()} tasks')

asyncio.run(test())
"
```

### 5. Start Development Server

```bash
uvicorn app.main:app --reload
```

**Expected Output**:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using WatchFiles
INFO:     Started server process [67890]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 6. Verify API is Running

Open browser to: **http://localhost:8000/docs**

You should see the **Swagger UI** with all API endpoints documented.

## Testing the API

### Option 1: Swagger UI (Recommended for Quick Testing)

1. Go to http://localhost:8000/docs
2. Click on any endpoint (e.g., **GET /api/{user_id}/tasks**)
3. Click **"Try it out"**
4. Fill in `user_id` and Authorization header
5. Click **"Execute"**

### Option 2: curl (Command Line)

**Get JWT Token** (from frontend login):
```bash
# After logging in to frontend, extract token from browser DevTools
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
export USER_ID=1
```

**List All Tasks**:
```bash
curl -X GET "http://localhost:8000/api/$USER_ID/tasks" \
  -H "Authorization: Bearer $TOKEN"
```

**Create Task**:
```bash
curl -X POST "http://localhost:8000/api/$USER_ID/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test task from curl",
    "description": "This is a test"
  }'
```

**Update Task**:
```bash
curl -X PUT "http://localhost:8000/api/$USER_ID/tasks/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated title",
    "description": "Updated description"
  }'
```

**Toggle Completion**:
```bash
curl -X PATCH "http://localhost:8000/api/$USER_ID/tasks/1/complete" \
  -H "Authorization: Bearer $TOKEN"
```

**Delete Task**:
```bash
curl -X DELETE "http://localhost:8000/api/$USER_ID/tasks/1" \
  -H "Authorization: Bearer $TOKEN"
```

### Option 3: httpx (Python HTTP Client)

Install httpx:
```bash
pip install httpx
```

Test script:
```python
import asyncio
import httpx

TOKEN = "your-jwt-token-here"
USER_ID = 1
BASE_URL = "http://localhost:8000"

headers = {"Authorization": f"Bearer {TOKEN}"}

async def test_api():
    async with httpx.AsyncClient() as client:
        # List tasks
        response = await client.get(f"{BASE_URL}/api/{USER_ID}/tasks", headers=headers)
        print(f"GET /tasks: {response.status_code}")
        print(response.json())

        # Create task
        response = await client.post(
            f"{BASE_URL}/api/{USER_ID}/tasks",
            headers=headers,
            json={"title": "Test task", "description": "From Python"}
        )
        print(f"POST /tasks: {response.status_code}")
        task = response.json()
        print(task)

        # Toggle completion
        response = await client.patch(
            f"{BASE_URL}/api/{USER_ID}/tasks/{task['id']}/complete",
            headers=headers
        )
        print(f"PATCH /complete: {response.status_code}")

asyncio.run(test_api())
```

## Running Tests

### Install Test Dependencies

```bash
pip install pytest pytest-asyncio httpx
```

### Run Full Test Suite

```bash
pytest
```

**Expected Output**:
```
================================ test session starts =================================
collected 24 items

tests/test_auth.py ....                                                        [ 16%]
tests/test_task_api.py ................                                        [ 83%]
tests/test_task_isolation.py ....                                              [100%]

================================ 24 passed in 5.23s ==================================
```

### Run Specific Test File

```bash
pytest tests/test_task_api.py -v
```

### Run with Coverage

```bash
pytest --cov=app --cov-report=html
```

Open `htmlcov/index.html` in browser to view coverage report.

## Common Issues & Solutions

### Issue 1: Database Connection Error

**Error**:
```
sqlalchemy.exc.OperationalError: connection to server failed
```

**Solution**:
- Verify `DATABASE_URL` in `.env` is correct
- Check Neon database is running
- Ensure SSL connection is configured (`ssl=require` in connection string)

### Issue 2: JWT Verification Failure

**Error**:
```
{"detail": "Invalid or expired token"}
```

**Solution**:
- Verify `BETTER_AUTH_SECRET` matches frontend `.env.local`
- Check JWT token is not expired
- Ensure token is passed in `Authorization: Bearer <token>` header

### Issue 3: 403 Forbidden on Valid Request

**Error**:
```
{"detail": "Cannot access another user's tasks"}
```

**Solution**:
- Verify `user_id` in URL matches user ID in JWT token
- Check JWT token contains `sub`, `user_id`, or `id` claim

### Issue 4: Alembic Migration Fails

**Error**:
```
alembic.util.exc.CommandError: Can't locate revision identified by '001'
```

**Solution**:
```bash
# Reset Alembic (WARNING: drops all tables)
alembic downgrade base
alembic upgrade head
```

## Development Workflow

### 1. Make Code Changes

Edit files in `backend/app/`:
- `api/routes/tasks.py` - Add/modify endpoints
- `services/task_service.py` - Business logic
- `schemas/task.py` - Request/response schemas
- `models/todo.py` - Database models

### 2. Server Auto-Reloads

Uvicorn with `--reload` automatically restarts on file changes.

**Watch for**:
```
INFO:     Detected file change in 'app/api/routes/tasks.py'
INFO:     Restarting...
```

### 3. Test Changes

```bash
# Run tests
pytest

# Test manually with curl/Swagger
curl -X GET "http://localhost:8000/api/1/tasks" -H "Authorization: Bearer $TOKEN"
```

### 4. Commit Changes

```bash
git add .
git commit -m "feat: add task filtering endpoint"
```

## API Documentation

### Interactive Documentation

- **Swagger UI**: http://localhost:8000/docs
  - Interactive API explorer
  - Try endpoints directly from browser
  - View request/response schemas

- **ReDoc**: http://localhost:8000/redoc
  - Clean, readable documentation
  - Better for documentation review

### OpenAPI Schema (JSON)

**Download schema**:
```bash
curl http://localhost:8000/openapi.json > contracts/todo-api-openapi.json
```

**View in browser**:
http://localhost:8000/openapi.json

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Yes | - | Shared JWT secret (matches frontend) |
| `CORS_ORIGINS` | Yes | `http://localhost:3000` | Allowed frontend origins (comma-separated) |
| `FRONTEND_URL` | No | `http://localhost:3000` | Frontend application URL |
| `APP_NAME` | No | `Todo Full-Stack API` | API title in docs |
| `APP_VERSION` | No | `1.0.0` | API version |
| `DEBUG` | No | `True` | Enable SQL query logging |

## Next Steps

1. ✅ API running locally
2. ⏭️ Test all endpoints via Swagger UI
3. ⏭️ Integrate with frontend (http://localhost:3000)
4. ⏭️ Run full test suite (`pytest`)
5. ⏭️ Review API documentation (http://localhost:8000/docs)
6. ⏭️ Deploy to staging/production

## Production Deployment Checklist

- [ ] Set `DEBUG=False` in production `.env`
- [ ] Use strong `BETTER_AUTH_SECRET` (32+ characters, cryptographically random)
- [ ] Configure HTTPS/SSL certificates
- [ ] Update `CORS_ORIGINS` to production frontend URL
- [ ] Use production Neon database (not development)
- [ ] Set up monitoring and logging
- [ ] Configure database connection pooling for production load
- [ ] Run security audit (`bandit`, `safety check`)
- [ ] Set up CI/CD pipeline for automated testing

## Support

- **Specification**: See [spec.md](spec.md) for requirements
- **Implementation Plan**: See [plan.md](plan.md) for architecture
- **Data Model**: See [data-model.md](data-model.md) for schemas
- **API Contract**: See `contracts/todo-api.yaml` for OpenAPI schema
