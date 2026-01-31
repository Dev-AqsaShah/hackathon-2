# Frontend API Integration Contract

**Feature**: `002-todo-frontend`
**Backend API**: `001-todo-api-backend`
**Date**: 2026-01-26

## Overview

This document defines how the Next.js frontend integrates with the FastAPI backend. The frontend consumes the backend API defined in `../001-todo-api-backend/contracts/todo-api.yaml`.

## API Base URL

**Development**: `http://localhost:8000`
**Production**: Set via `NEXT_PUBLIC_API_URL` environment variable

## Authentication

### JWT Token Flow

1. **User Signs Up/Signs In** → Better Auth issues JWT token
2. **Token Storage** → Stored in httpOnly cookie (managed by Better Auth)
3. **API Requests** → Frontend extracts token and attaches to `Authorization` header
4. **Backend Verification** → Backend verifies JWT signature using shared secret

### Authorization Header Format

```
Authorization: Bearer <JWT_TOKEN>
```

**Example**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcl9pZCI6MSwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwiZXhwIjoxNzM4MjQ4MDAwfQ.signature
```

### Error Responses

| Status Code | Meaning | Frontend Action |
|-------------|---------|-----------------|
| 401 Unauthorized | Invalid/expired token | Redirect to /signin |
| 403 Forbidden | Valid token, wrong user_id | Display "Access denied" error |

## API Endpoints

### 1. List All Tasks

**Endpoint**: `GET /api/{user_id}/tasks`

**Request**:
```typescript
const response = await apiClient.get<Task[]>(`/api/${userId}/tasks`);
```

**Response** (200 OK):
```json
[
  {
    "id": 42,
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation",
    "completed": false,
    "owner_id": 1,
    "created_at": "2026-01-23T10:30:00Z",
    "updated_at": "2026-01-23T10:30:00Z"
  }
]
```

**Error Responses**:
- `401 Unauthorized`: Missing/invalid JWT
- `403 Forbidden`: user_id in URL doesn't match JWT user_id

**Frontend Usage**:
```typescript
// app/(dashboard)/dashboard/page.tsx
export default async function DashboardPage() {
  const session = await auth.api.getSession();
  const tasks = await apiClient.get<Task[]>(`/api/${session.user.id}/tasks`);

  return <TaskList tasks={tasks} />;
}
```

---

### 2. Create Task

**Endpoint**: `POST /api/{user_id}/tasks`

**Request**:
```typescript
const newTask = await apiClient.post<Task>(`/api/${userId}/tasks`, {
  title: "Buy groceries",
  description: "Milk, eggs, bread" // Optional
});
```

**Request Body**:
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

**Response** (201 Created):
```json
{
  "id": 43,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "owner_id": 1,
  "created_at": "2026-01-26T14:00:00Z",
  "updated_at": "2026-01-26T14:00:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing/invalid JWT
- `403 Forbidden`: user_id in URL doesn't match JWT user_id
- `422 Unprocessable Entity`: Validation error (empty title, title too long, etc.)

**Validation**:
- `title`: Required, 1-1000 characters
- `description`: Optional, max 5000 characters

**Frontend Usage**:
```typescript
// components/TaskForm.tsx
async function handleSubmit(data: TaskCreateInput) {
  try {
    const newTask = await apiClient.post<Task>(`/api/${userId}/tasks`, data);
    router.push("/dashboard"); // Redirect to dashboard
  } catch (error) {
    setError(error.message); // Display error
  }
}
```

---

### 3. Get Single Task

**Endpoint**: `GET /api/{user_id}/tasks/{id}`

**Request**:
```typescript
const task = await apiClient.get<Task>(`/api/${userId}/tasks/${taskId}`);
```

**Response** (200 OK):
```json
{
  "id": 42,
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "completed": false,
  "owner_id": 1,
  "created_at": "2026-01-23T10:30:00Z",
  "updated_at": "2026-01-23T10:30:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing/invalid JWT
- `403 Forbidden`: Task belongs to another user
- `404 Not Found`: Task doesn't exist

**Frontend Usage**:
```typescript
// app/tasks/[id]/edit/page.tsx
export default async function EditTaskPage({ params }: { params: { id: string } }) {
  const session = await auth.api.getSession();
  const task = await apiClient.get<Task>(`/api/${session.user.id}/tasks/${params.id}`);

  return <TaskForm initialData={task} />;
}
```

---

### 4. Update Task

**Endpoint**: `PUT /api/{user_id}/tasks/{id}`

**Request**:
```typescript
const updatedTask = await apiClient.put<Task>(`/api/${userId}/tasks/${taskId}`, {
  title: "Updated title",
  description: "Updated description"
});
```

**Request Body** (partial updates supported):
```json
{
  "title": "Updated title",
  "description": "Updated description"
}
```

**Response** (200 OK):
```json
{
  "id": 42,
  "title": "Updated title",
  "description": "Updated description",
  "completed": false,
  "owner_id": 1,
  "created_at": "2026-01-23T10:30:00Z",
  "updated_at": "2026-01-26T14:30:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing/invalid JWT
- `403 Forbidden`: Task belongs to another user
- `404 Not Found`: Task doesn't exist
- `422 Unprocessable Entity`: Validation error

**Frontend Usage**:
```typescript
// components/TaskForm.tsx
async function handleUpdate(data: TaskUpdateInput) {
  try {
    const updated = await apiClient.put<Task>(`/api/${userId}/tasks/${taskId}`, data);
    router.push("/dashboard");
  } catch (error) {
    setError(error.message);
  }
}
```

---

### 5. Delete Task

**Endpoint**: `DELETE /api/{user_id}/tasks/{id}`

**Request**:
```typescript
await apiClient.delete(`/api/${userId}/tasks/${taskId}`);
```

**Response** (204 No Content):
- Empty response body

**Error Responses**:
- `401 Unauthorized`: Missing/invalid JWT
- `403 Forbidden`: Task belongs to another user
- `404 Not Found`: Task doesn't exist

**Frontend Usage**:
```typescript
// components/TaskItem.tsx
async function handleDelete(taskId: number) {
  try {
    await apiClient.delete(`/api/${userId}/tasks/${taskId}`);
    // Remove from UI without page reload
    setTasks(tasks.filter(t => t.id !== taskId));
  } catch (error) {
    setError(error.message);
  }
}
```

---

### 6. Toggle Task Completion

**Endpoint**: `PATCH /api/{user_id}/tasks/{id}/complete`

**Request**:
```typescript
const toggledTask = await apiClient.patch<Task>(`/api/${userId}/tasks/${taskId}/complete`);
```

**Request Body**: None (endpoint always toggles current state)

**Response** (200 OK):
```json
{
  "id": 42,
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "completed": true,
  "owner_id": 1,
  "created_at": "2026-01-23T10:30:00Z",
  "updated_at": "2026-01-26T14:45:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing/invalid JWT
- `403 Forbidden`: Task belongs to another user
- `404 Not Found`: Task doesn't exist

**Frontend Usage** (Optimistic UI Update):
```typescript
// components/TaskItem.tsx
async function handleToggle(taskId: number) {
  // Optimistic update (immediately toggle UI)
  setTasks(tasks.map(t =>
    t.id === taskId ? { ...t, completed: !t.completed } : t
  ));

  try {
    const updated = await apiClient.patch<Task>(`/api/${userId}/tasks/${taskId}/complete`);
    // Confirm update with backend response
    setTasks(tasks.map(t => t.id === taskId ? updated : t));
  } catch (error) {
    // Revert on failure
    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
    setError(error.message);
  }
}
```

## Error Handling

### Error Response Format

All backend errors return JSON with `detail` field:

```json
{
  "detail": "Error message here"
}
```

### Validation Errors (422)

```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### Frontend Error Handling Strategy

```typescript
// lib/api-client.ts
async function handleApiError(response: Response): Promise<never> {
  const error = await response.json();

  switch (response.status) {
    case 401:
      // Redirect to signin
      window.location.href = "/signin";
      throw new Error("Session expired. Please sign in again.");

    case 403:
      throw new Error("You don't have permission to access this resource.");

    case 404:
      throw new Error("Task not found.");

    case 422:
      // Extract validation errors
      const errors = error.detail.map((e: any) => e.msg).join(", ");
      throw new Error(errors);

    case 500:
      throw new Error("Something went wrong. Please try again later.");

    default:
      throw new Error(error.detail || "An unexpected error occurred.");
  }
}
```

## TypeScript Types

### Request Types

```typescript
// types/task.ts
export interface TaskCreateInput {
  title: string;
  description?: string;
}

export interface TaskUpdateInput {
  title?: string;
  description?: string;
}
```

### Response Types

```typescript
// types/task.ts
export interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  owner_id: number;
  created_at: string;
  updated_at: string;
}
```

## Testing Integration

### Manual Testing Checklist

- [ ] **Authentication**: JWT token attached to all requests
- [ ] **401 Handling**: Redirect to /signin when token expires
- [ ] **403 Handling**: Display "Access denied" message
- [ ] **404 Handling**: Display "Not found" message
- [ ] **Validation Errors**: Display field-specific errors
- [ ] **Network Errors**: Display "Connection failed" message
- [ ] **CORS**: Backend allows frontend origin (http://localhost:3000)

### Test Scenarios

1. **List Tasks**: Fetch tasks and display on dashboard
2. **Create Task**: Submit form and verify task appears
3. **Toggle Completion**: Click checkbox and verify state change
4. **Edit Task**: Modify task and verify changes persist
5. **Delete Task**: Delete task and verify removal from list
6. **Error Handling**: Test all error scenarios (401, 403, 404, 422, 500)

## CORS Configuration

### Backend CORS Settings

Backend must allow requests from frontend origin:

```python
# backend/app/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Production CORS

In production, update `allow_origins` to production frontend URL:

```python
allow_origins=["https://your-frontend.vercel.app"]
```

## Security Considerations

### JWT Token Security

- ✅ **httpOnly Cookies**: Tokens stored in httpOnly cookies (not localStorage)
- ✅ **Secure Flag**: Cookies have `secure: true` in production (HTTPS only)
- ✅ **SameSite**: Cookies have `sameSite: "lax"` (CSRF protection)
- ✅ **Shared Secret**: `BETTER_AUTH_SECRET` matches between frontend and backend

### User Isolation

- ✅ **Backend Enforcement**: Backend validates `user_id` in URL matches JWT user_id
- ✅ **Frontend Check**: Frontend never trusts user input for ownership
- ✅ **403 Forbidden**: Backend returns 403 if user tries to access another user's tasks

### Input Validation

- ✅ **Client-Side**: Frontend validates input for UX (immediate feedback)
- ✅ **Server-Side**: Backend validates input for security (source of truth)
- ✅ **Sanitization**: Backend sanitizes input to prevent SQL injection, XSS

## Summary

| Endpoint | Method | Purpose | Auth Required | Optimistic UI |
|----------|--------|---------|---------------|---------------|
| `/api/{user_id}/tasks` | GET | List all tasks | Yes | No |
| `/api/{user_id}/tasks` | POST | Create task | Yes | No |
| `/api/{user_id}/tasks/{id}` | GET | Get single task | Yes | No |
| `/api/{user_id}/tasks/{id}` | PUT | Update task | Yes | No |
| `/api/{user_id}/tasks/{id}` | DELETE | Delete task | Yes | Yes (optional) |
| `/api/{user_id}/tasks/{id}/complete` | PATCH | Toggle completion | Yes | Yes (recommended) |

**Error Handling**: All errors return JSON with `detail` field
**Authentication**: JWT token in `Authorization: Bearer <token>` header
**Security**: httpOnly cookies, CORS, user isolation enforced by backend
