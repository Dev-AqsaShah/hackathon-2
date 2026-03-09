# Quickstart Guide: Todo Frontend

**Feature**: `002-todo-frontend`
**Date**: 2026-01-26

## Prerequisites

- **Node.js**: 20.x LTS or higher
- **npm** or **pnpm**: Latest version
- **Backend API**: FastAPI backend from `001-todo-api-backend` running on http://localhost:8000
- **Database**: Neon PostgreSQL connection string
- **Git**: For cloning and version control

## Initial Setup (5-10 minutes)

### 1. Navigate to Frontend Directory

```bash
cd D:/hackathon-2/phase-ii/frontend
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

**Expected Output**:
```
added 300+ packages in 30s
```

**Dependencies Installed**:
- `next@^16.0.0` - Next.js framework
- `react@^19.0.0` - React library
- `react-dom@^19.0.0` - React DOM renderer
- `better-auth@^1.0.0` - Authentication library with JWT plugin
- `tailwindcss@^3.4.0` - CSS framework
- `typescript@^5.3.0` - TypeScript compiler

### 3. Configure Environment Variables

Create `frontend/.env.local`:

```bash
# Frontend (.env.local)

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Better Auth Configuration (MUST match backend secret)
BETTER_AUTH_SECRET=your-secret-key-here-minimum-32-characters-change-this-in-production
BETTER_AUTH_URL=http://localhost:3000

# Database Configuration (Neon PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@YOUR_HOST.neon.tech/neondb?sslmode=require
```

**⚠️ CRITICAL**: `BETTER_AUTH_SECRET` must match the backend's `BETTER_AUTH_SECRET` for JWT verification to work.

**Security**:
- Never commit `.env.local` to version control (already in `.gitignore`)
- Use strong random secret (32+ characters)
- Generate secret: `openssl rand -base64 32`

### 4. Verify Backend is Running

Before starting the frontend, ensure the backend API is running:

```bash
# In a separate terminal
cd D:/hackathon-2/phase-ii/backend
uvicorn app.main:app --reload
```

**Test Backend**:
```bash
curl http://localhost:8000/health
# Expected: {"status":"ok"}
```

### 5. Start Development Server

```bash
npm run dev
# or
pnpm dev
```

**Expected Output**:
```
> frontend@0.1.0 dev
> next dev

   ▲ Next.js 16.0.0
   - Local:        http://localhost:3000
   - Ready in 2.5s
```

### 6. Verify Frontend is Running

Open browser to: **http://localhost:3000**

You should see the home page with navigation to Signin/Signup.

## Testing the Application

### Authentication Flow

**1. Sign Up**:
1. Navigate to http://localhost:3000/signup
2. Enter email: `test@example.com`
3. Enter password: `password123` (min 8 characters)
4. Click "Sign Up"
5. You should be redirected to http://localhost:3000/signin

**2. Sign In**:
1. Navigate to http://localhost:3000/signin
2. Enter email: `test@example.com`
3. Enter password: `password123`
4. Click "Sign In"
5. You should be redirected to http://localhost:3000/dashboard

**3. Protected Routes**:
- Try accessing http://localhost:3000/dashboard without signing in
- You should be redirected to http://localhost:3000/signin

### Task Management

**1. View Task List**:
1. Sign in and navigate to /dashboard
2. Initially empty state: "No tasks yet. Create your first task!"

**2. Create Task**:
1. Click "Create Task" button
2. Navigate to http://localhost:3000/tasks/create
3. Enter title: "Buy groceries"
4. Enter description: "Milk, eggs, bread" (optional)
5. Click "Create"
6. Redirected to /dashboard with new task visible

**3. Toggle Completion**:
1. On /dashboard, click checkbox next to task
2. Task should immediately toggle between completed/incomplete
3. Refresh page to verify persistence

**4. Edit Task**:
1. Click "Edit" button on a task
2. Navigate to http://localhost:3000/tasks/[id]/edit
3. Modify title or description
4. Click "Save"
5. Redirected to /dashboard with updated task

**5. Delete Task**:
1. Click "Delete" button on a task
2. Confirmation modal appears: "Are you sure?"
3. Click "Confirm Delete"
4. Task removed from list without page reload

## Development Workflow

### File Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Public routes (signup, signin)
│   │   ├── signin/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (dashboard)/              # Protected routes
│   │   └── dashboard/
│   │       └── page.tsx
│   ├── tasks/
│   │   ├── create/
│   │   │   └── page.tsx
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx
│   ├── api/                      # Better Auth API routes
│   │   └── auth/
│   │       └── [...all]/
│   │           └── route.ts
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                    # Reusable UI components
│   ├── TaskList.tsx
│   ├── TaskItem.tsx
│   ├── TaskForm.tsx
│   ├── SignInForm.tsx
│   ├── SignUpForm.tsx
│   └── ConfirmDeleteModal.tsx
├── lib/                          # Utilities
│   ├── auth.ts                   # Better Auth config
│   ├── api-client.ts             # Backend API client
│   ├── validation.ts             # Form validation
│   └── utils.ts                  # Helper functions
├── types/                        # TypeScript types
│   ├── task.ts                   # Task entity types
│   ├── auth.ts                   # Auth types
│   └── state.ts                  # UI state types
├── middleware.ts                 # Protected route middleware
├── .env.local                    # Environment variables (gitignored)
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

### Making Code Changes

**1. Add a New Component**:
```bash
# Create new file
touch components/MyComponent.tsx

# Edit with TypeScript and Tailwind CSS
```

**2. Server Auto-Reloads**:
- Next.js with `--turbo` (or default) automatically reloads on file changes
- Watch console for compilation status
- Browser automatically refreshes

**3. Type Checking**:
```bash
# Run TypeScript compiler (check for errors)
npm run type-check
# or
npx tsc --noEmit
```

**4. Lint Code**:
```bash
npm run lint
```

### Common Development Tasks

**Run Development Server**:
```bash
npm run dev
```

**Build for Production**:
```bash
npm run build
```

**Start Production Server** (after build):
```bash
npm start
```

**Type Check** (without building):
```bash
npm run type-check
```

**Lint Code**:
```bash
npm run lint
```

**Format Code** (if using Prettier):
```bash
npm run format
```

## Troubleshooting

### Issue 1: Backend API Connection Failed

**Error**:
```
Failed to fetch tasks: API error: Failed to fetch
```

**Solution**:
1. Verify backend is running: `curl http://localhost:8000/health`
2. Check `NEXT_PUBLIC_API_URL` in `.env.local` matches backend URL
3. Check backend CORS allows `http://localhost:3000`

### Issue 2: JWT Verification Failed

**Error**:
```
401 Unauthorized: Invalid or expired token
```

**Solution**:
1. Verify `BETTER_AUTH_SECRET` matches between frontend `.env.local` and backend `.env`
2. Check token format in Better Auth configuration
3. Ensure JWT plugin is enabled in Better Auth config

### Issue 3: Protected Route Redirect Loop

**Error**:
Browser keeps redirecting between /signin and /dashboard

**Solution**:
1. Clear browser cookies (Better Auth session might be corrupted)
2. Check middleware.ts logic (ensure correct redirect conditions)
3. Verify Better Auth `getSession()` is working

### Issue 4: Tailwind CSS Styles Not Applied

**Error**:
Utility classes not working (e.g., `text-blue-500` has no effect)

**Solution**:
1. Verify `tailwind.config.js` has correct content paths
2. Check `globals.css` has Tailwind directives:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
3. Restart dev server: `npm run dev`

### Issue 5: TypeScript Errors

**Error**:
```
Type 'Task[]' is not assignable to type 'never[]'
```

**Solution**:
1. Check TypeScript version: `npx tsc --version` (should be 5.3+)
2. Run type check: `npm run type-check`
3. Fix type errors in `types/*.ts` files
4. Ensure `tsconfig.json` has `"strict": true`

## API Documentation

### Frontend API Client

**Location**: `lib/api-client.ts`

**Usage**:
```typescript
import { apiClient } from "@/lib/api-client";

// Get all tasks
const tasks = await apiClient.get<Task[]>(`/api/${userId}/tasks`);

// Create task
const newTask = await apiClient.post<Task>(`/api/${userId}/tasks`, {
  title: "Buy groceries",
  description: "Milk, eggs, bread"
});

// Update task
const updatedTask = await apiClient.put<Task>(`/api/${userId}/tasks/${taskId}`, {
  title: "Buy groceries (updated)"
});

// Toggle completion
const toggledTask = await apiClient.patch<Task>(`/api/${userId}/tasks/${taskId}/complete`);

// Delete task
await apiClient.delete(`/api/${userId}/tasks/${taskId}`);
```

**Error Handling**:
```typescript
try {
  const tasks = await apiClient.get<Task[]>(`/api/${userId}/tasks`);
} catch (error) {
  if (error.message === "Unauthorized") {
    // User will be redirected to /signin automatically
  } else {
    // Display error message to user
    setError(error.message);
  }
}
```

### Backend API Reference

**Base URL**: `http://localhost:8000` (development)

**Authentication**: All endpoints require `Authorization: Bearer <JWT>` header (automatically added by apiClient)

**Endpoints**:
- `GET /api/{user_id}/tasks` - List all tasks
- `POST /api/{user_id}/tasks` - Create task
- `GET /api/{user_id}/tasks/{id}` - Get single task
- `PUT /api/{user_id}/tasks/{id}` - Update task
- `DELETE /api/{user_id}/tasks/{id}` - Delete task
- `PATCH /api/{user_id}/tasks/{id}/complete` - Toggle completion

**Full API Contract**: See `../001-todo-api-backend/contracts/todo-api.yaml`

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:8000` | Backend API base URL |
| `BETTER_AUTH_SECRET` | Yes | - | JWT secret (must match backend) |
| `BETTER_AUTH_URL` | Yes | `http://localhost:3000` | Frontend URL |
| `DATABASE_URL` | Yes | - | Neon PostgreSQL connection string |

**Production**:
- Set `BETTER_AUTH_SECRET` to strong random string (32+ chars)
- Set `NEXT_PUBLIC_API_URL` to production backend URL (https://api.example.com)
- Set `BETTER_AUTH_URL` to production frontend URL (https://example.com)

## Next Steps

1. ✅ Frontend running locally
2. ⏭️ Test all user flows (signup, signin, task CRUD)
3. ⏭️ Verify responsive design on mobile (Chrome DevTools)
4. ⏭️ Run Lighthouse audit (performance, accessibility)
5. ⏭️ Deploy to Vercel (production environment)

## Deployment (Vercel)

### Prerequisites

- GitHub repository with frontend code
- Vercel account (free tier available)

### Steps

1. **Push code to GitHub**:
   ```bash
   git add .
   git commit -m "feat: Todo frontend implementation"
   git push origin 002-todo-frontend
   ```

2. **Connect to Vercel**:
   - Go to https://vercel.com/new
   - Import GitHub repository
   - Select `frontend/` as root directory

3. **Configure Environment Variables** (in Vercel dashboard):
   - `BETTER_AUTH_SECRET`: Production secret (32+ chars)
   - `BETTER_AUTH_URL`: https://your-app.vercel.app
   - `NEXT_PUBLIC_API_URL`: https://your-backend-api.com
   - `DATABASE_URL`: Neon production connection string

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete (2-3 minutes)
   - Visit deployed URL: https://your-app.vercel.app

5. **Test Production**:
   - Signup at https://your-app.vercel.app/signup
   - Signin at https://your-app.vercel.app/signin
   - Verify all features work

### Deployment Checklist

- [ ] Backend API is deployed and accessible
- [ ] `BETTER_AUTH_SECRET` is set (matches backend)
- [ ] `NEXT_PUBLIC_API_URL` points to production backend
- [ ] `DATABASE_URL` is production Neon connection
- [ ] CORS is configured on backend to allow frontend domain
- [ ] HTTPS is enabled (Vercel provides this automatically)
- [ ] All environment variables are set in Vercel dashboard
- [ ] Test signup, signin, and task CRUD operations

## Support

**Documentation**:
- [Specification](./spec.md) - Feature requirements
- [Implementation Plan](./plan.md) - Architecture and phases
- [Data Model](./data-model.md) - TypeScript interfaces
- [Research Decisions](./research.md) - Technology choices

**Backend API**:
- [Backend Spec](../001-todo-api-backend/spec.md)
- [API Contract](../001-todo-api-backend/contracts/todo-api.yaml)
- [Backend Quickstart](../001-todo-api-backend/quickstart.md)

**External Resources**:
- [Next.js Documentation](https://nextjs.org/docs)
- [Better Auth Documentation](https://better-auth.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
