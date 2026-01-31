# Quickstart Guide: Todo Full-Stack Web Application (Phase-2)

**Branch**: `001-todo-fullstack-web`
**Date**: 2026-01-22
**Purpose**: Step-by-step guide for developers to set up and run the application locally

---

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** 20+ and npm/yarn/pnpm (for frontend)
- **Python** 3.9+ and pip (for backend)
- **Git** for version control
- **Neon Account** for PostgreSQL database (https://neon.tech)
- **Code Editor** (VS Code recommended)

---

## Project Structure

```
phase-ii/
├── frontend/              # Next.js 16+ application
│   ├── app/               # App Router pages & layouts
│   ├── components/        # Reusable UI components
│   ├── lib/               # Utilities and API client
│   ├── .env.local         # Frontend environment variables
│   └── package.json
│
├── backend/               # FastAPI application
│   ├── app/
│   │   ├── main.py        # FastAPI entry point
│   │   ├── models/        # SQLModel database models
│   │   ├── schemas/       # Pydantic request/response schemas
│   │   ├── api/           # API route handlers
│   │   └── core/          # Config, auth, database
│   ├── alembic/           # Database migrations
│   ├── .env               # Backend environment variables
│   └── requirements.txt
│
└── specs/                 # Feature specifications (this directory)
```

---

## Setup Instructions

### Step 1: Clone Repository and Checkout Branch

```bash
git clone <repository-url>
cd phase-ii
git checkout 001-todo-fullstack-web
```

---

### Step 2: Set Up Neon PostgreSQL Database

1. **Create Neon Account**: Visit https://neon.tech and sign up

2. **Create New Project**:
   - Project name: `todo-app-phase2`
   - Region: Choose closest to your location
   - PostgreSQL version: 16+

3. **Get Connection String**:
   - Navigate to "Connection Details"
   - Copy the connection string (format: `postgresql://user:password@host/dbname`)
   - Note: Neon provides a pooled connection string - use that for serverless

4. **Save Connection String**: You'll use this in Step 4

---

### Step 3: Generate Shared JWT Secret

Generate a strong random secret for JWT signing/verification:

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Important**: This secret must be the same in both frontend and backend!

---

### Step 4: Configure Backend Environment

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create `.env` file**:
   ```bash
   touch .env  # On Windows: type nul > .env
   ```

3. **Add environment variables** to `.env`:
   ```env
   # Database
   DATABASE_URL=postgresql+asyncpg://user:password@host/dbname

   # Authentication (use the secret generated in Step 3)
   BETTER_AUTH_SECRET=your-generated-secret-here

   # CORS (allow frontend origin)
   CORS_ORIGINS=http://localhost:3000

   # Frontend URL (for redirects)
   FRONTEND_URL=http://localhost:3000
   ```

4. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Run database migrations**:
   ```bash
   alembic upgrade head
   ```

   This creates the `users` and `todos` tables with proper indexes and constraints.

6. **Verify setup**:
   ```bash
   python -m app.main
   ```

   You should see:
   ```
   INFO:     Uvicorn running on http://127.0.0.1:8000
   INFO:     Application startup complete.
   ```

---

### Step 5: Configure Frontend Environment

1. **Navigate to frontend directory**:
   ```bash
   cd ../frontend
   ```

2. **Create `.env.local` file**:
   ```bash
   touch .env.local  # On Windows: type nul > .env.local
   ```

3. **Add environment variables** to `.env.local`:
   ```env
   # Backend API URL
   NEXT_PUBLIC_API_URL=http://localhost:8000

   # Better Auth Secret (MUST match backend)
   BETTER_AUTH_SECRET=your-generated-secret-here

   # Database URL (Better Auth needs it for user storage)
   DATABASE_URL=postgresql://user:password@host/dbname
   ```

4. **Install Node dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

5. **Run development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

   You should see:
   ```
   ▲ Next.js 16.0.0
   - Local:        http://localhost:3000
   - Ready in 1.2s
   ```

---

## Testing the Application

### 1. Access the Application

Open your browser and navigate to: **http://localhost:3000**

---

### 2. Create an Account

1. Click "Sign Up" or navigate to `/signup`
2. Enter email and password
3. Click "Create Account"
4. You should be automatically logged in and redirected to the dashboard

---

### 3. Test Todo Operations

**Create a Todo**:
1. On the dashboard, find the "Add Todo" form
2. Enter a todo title (e.g., "Test Phase-2 implementation")
3. Click "Add" or press Enter
4. Todo should appear in the list

**Mark Todo Complete**:
1. Find the todo you just created
2. Click the checkbox or "Complete" button
3. Todo should show visual indication (strikethrough, checkmark)

**Edit Todo**:
1. Click the "Edit" button/icon on a todo
2. Change the title
3. Save changes
4. Updated title should appear

**Delete Todo**:
1. Click the "Delete" button/icon on a todo
2. Todo should be removed from the list

**Verify Persistence**:
1. Refresh the page
2. All todos should still be there with correct completion status

---

### 4. Test Authentication & User Isolation

**Logout**:
1. Click "Logout" button
2. You should be redirected to login page
3. Dashboard should be inaccessible without login

**Login**:
1. Enter your email and password
2. Click "Login"
3. You should see your todos again

**Test User Isolation** (requires second account):
1. Open a private/incognito browser window
2. Create a second account with different email
3. Create some todos in the second account
4. Switch back to first account
5. Verify you only see your own todos, not the second user's

---

## API Testing (Optional)

You can test the backend API directly using tools like cURL, Postman, or Thunder Client.

### Get JWT Token

First, you need to authenticate via Better Auth to get a JWT token. After logging in through the frontend, you can extract the token from:
- Browser DevTools → Application → Cookies → Look for Better Auth token
- Or inspect the network request headers

### Test Endpoints

```bash
# Set your token as a variable
export JWT_TOKEN="your-jwt-token-here"

# List todos
curl -X GET http://localhost:8000/api/users/123/todos \
  -H "Authorization: Bearer $JWT_TOKEN"

# Create todo
curl -X POST http://localhost:8000/api/users/123/todos \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test via API"}'

# Update todo
curl -X PUT http://localhost:8000/api/users/123/todos/1 \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated via API"}'

# Toggle completion
curl -X PATCH http://localhost:8000/api/users/123/todos/1/complete \
  -H "Authorization: Bearer $JWT_TOKEN"

# Delete todo
curl -X DELETE http://localhost:8000/api/users/123/todos/1 \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Note**: Replace `123` with your actual user ID (found in JWT payload).

---

## Troubleshooting

### Database Connection Issues

**Error**: `could not connect to server`

**Solution**:
- Verify Neon database is active (not paused)
- Check `DATABASE_URL` is correct in both `.env` files
- Ensure you're using the pooled connection string for serverless

---

### JWT Token Issues

**Error**: `Invalid or expired token` or `401 Unauthorized`

**Solution**:
- Verify `BETTER_AUTH_SECRET` is identical in frontend and backend `.env` files
- Ensure secret is at least 32 characters
- Try logging out and logging back in to get a fresh token

---

### CORS Issues

**Error**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution**:
- Verify `CORS_ORIGINS=http://localhost:3000` in backend `.env`
- Ensure backend is running on `http://localhost:8000`
- Check that frontend is making requests to the correct backend URL

---

### Migration Issues

**Error**: `alembic.util.exc.CommandError: Can't locate revision identified by`

**Solution**:
- Delete `alembic/versions/*.py` files
- Run `alembic revision --autogenerate -m "Initial migration"`
- Run `alembic upgrade head`

---

### Port Already in Use

**Error**: `Address already in use` or `EADDRINUSE`

**Solution**:
- **Frontend (port 3000)**:
  ```bash
  # Linux/Mac
  lsof -ti:3000 | xargs kill -9

  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

- **Backend (port 8000)**:
  ```bash
  # Linux/Mac
  lsof -ti:8000 | xargs kill -9

  # Windows
  netstat -ano | findstr :8000
  taskkill /PID <PID> /F
  ```

---

## Development Workflow

### Making Changes

1. **Checkout feature branch**:
   ```bash
   git checkout 001-todo-fullstack-web
   ```

2. **Make code changes** following the spec-driven workflow:
   - All changes must be traceable to `specs/001-todo-fullstack-web/spec.md`
   - Follow task definitions in `specs/001-todo-fullstack-web/tasks.md` (once generated)

3. **Test changes locally**:
   - Restart backend: `uvicorn app.main:app --reload`
   - Frontend hot-reloads automatically

4. **Commit changes**:
   ```bash
   git add .
   git commit -m "feat: implement [feature description]"
   ```

---

### Running Tests (When Implemented)

**Backend tests**:
```bash
cd backend
pytest tests/ -v
```

**Frontend tests**:
```bash
cd frontend
npm test
```

---

## Next Steps

Once the application is running:

1. **Review API Documentation**: See `specs/001-todo-fullstack-web/contracts/api-spec.yaml`
2. **Follow Implementation Tasks**: Once generated, follow `specs/001-todo-fullstack-web/tasks.md`
3. **Read Architecture Plan**: Review `specs/001-todo-fullstack-web/plan.md` for design decisions
4. **Check Constitution**: Ensure implementation follows `constitution.md` principles

---

## Support

If you encounter issues not covered in troubleshooting:

1. Check specification documents in `specs/001-todo-fullstack-web/`
2. Review research document for technical decisions: `research.md`
3. Verify data model: `data-model.md`
4. Consult API contracts: `contracts/api-spec.yaml`

---

**Status**: ✅ Setup complete! You're ready to implement Phase-2.
