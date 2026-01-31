# Implementation Plan: Todo Full-Stack Web Application — Frontend

**Feature Branch**: `002-todo-frontend`
**Created**: 2026-01-26
**Status**: In Progress

## Technical Context

### Technology Stack

- **Framework**: Next.js 16+ with App Router
- **Language**: TypeScript 5.3+
- **Authentication**: Better Auth with JWT plugin
- **HTTP Client**: Built-in fetch API with server actions / client-side fetching
- **Styling**: Tailwind CSS 3.4+ (mobile-first responsive design)
- **State Management**: React hooks (useState, useEffect) and Server Components
- **Build Tool**: Next.js built-in (Turbopack for dev, Webpack for production)
- **Package Manager**: npm or pnpm
- **Node Version**: 20.x LTS

### Project Structure (Existing)

```
frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group (public)
│   │   ├── signin/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (dashboard)/              # Protected route group
│   │   └── dashboard/
│   │       └── page.tsx
│   ├── api/                      # API routes (Better Auth endpoints)
│   │   └── auth/
│   │       └── [...all]/
│   │           └── route.ts
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                    # Reusable UI components
├── lib/                          # Utilities and configurations
│   ├── auth.ts                   # Better Auth configuration
│   ├── api-client.ts             # Backend API client with JWT
│   └── utils.ts                  # Helper functions
├── types/                        # TypeScript type definitions
│   └── task.ts                   # Task entity types
├── public/                       # Static assets
├── .env.local                    # Environment variables (gitignored)
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

### Backend API Integration

The frontend communicates with the FastAPI backend (implemented in `001-todo-api-backend`):

**Base URL**: `http://localhost:8000` (development) / Production URL from env

**Endpoints** (all require JWT authentication):
- `GET /api/{user_id}/tasks` - List user's tasks
- `POST /api/{user_id}/tasks` - Create task
- `GET /api/{user_id}/tasks/{id}` - Get single task
- `PUT /api/{user_id}/tasks/{id}` - Update task
- `DELETE /api/{user_id}/tasks/{id}` - Delete task
- `PATCH /api/{user_id}/tasks/{id}/complete` - Toggle completion

**Authentication Flow**:
1. User signs up/signs in via Better Auth
2. Better Auth issues JWT token and stores in httpOnly cookie
3. Frontend extracts JWT and attaches to all backend API requests
4. Backend verifies JWT signature and user_id matching

### Environment Variables

```env
# Frontend (frontend/.env.local)
BETTER_AUTH_SECRET=<shared-secret-with-backend>
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
DATABASE_URL=<neon-connection-string>
```

**Note**: `BETTER_AUTH_SECRET` must match the backend's `BETTER_AUTH_SECRET` for JWT verification.

### Dependencies (package.json)

```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "better-auth": "^1.0.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^16.0.0"
  }
}
```

## Constitution Check

### I. Security ✅ PASS

**Requirement**: All user data and authentication flows MUST be implemented and verified according to security best practices.

**Implementation**:
- ✅ Better Auth with JWT plugin handles authentication
- ✅ JWT tokens stored in httpOnly cookies (no localStorage exposure)
- ✅ All backend API requests include `Authorization: Bearer <token>` header
- ✅ 401 Unauthorized responses trigger redirect to /signin
- ✅ User isolation enforced by backend (user_id validation in URL)
- ✅ BETTER_AUTH_SECRET stored in environment variables (never hardcoded)
- ✅ Protected routes check authentication before rendering

**No violations**. Security is central to the authentication and API integration design.

### II. Accuracy ✅ PASS

**Requirement**: API endpoints, database queries, and frontend data MUST behave deterministically.

**Implementation**:
- ✅ Frontend consumes REST API with validated JSON schemas
- ✅ TypeScript types ensure type safety for API responses
- ✅ Error handling for all API failure scenarios (4xx, 5xx)
- ✅ Loading states prevent race conditions during async operations
- ✅ Optimistic UI updates (optional) with rollback on failure
- ✅ Frontend state reflects backend data after successful API calls

**No violations**. API integration ensures deterministic behavior with proper error handling.

### III. Clarity ✅ PASS

**Requirement**: Code, API contracts, and UI behavior MUST be readable, maintainable, and traceable.

**Implementation**:
- ✅ TypeScript with explicit interfaces for Task, User, API responses
- ✅ Server Components by default, client components only when needed ('use client')
- ✅ Clear component naming: `TaskList.tsx`, `TaskForm.tsx`, `SignInForm.tsx`
- ✅ Descriptive prop interfaces with JSDoc comments
- ✅ Error messages are user-friendly and actionable
- ✅ All components traceable to user stories in spec.md

**No violations**. TypeScript and App Router patterns enforce clarity.

### IV. Reproducibility ✅ PASS

**Requirement**: Application behavior MUST be reproducible across multiple environments.

**Implementation**:
- ✅ Environment-based configuration (development, staging, production)
- ✅ All secrets and URLs in `.env.local` (not hardcoded)
- ✅ Next.js build process is deterministic (`next build`)
- ✅ Development server: `npm run dev` (consistent across machines)
- ✅ Production build: `npm run build && npm start`

**No violations**. Environment variables and Next.js build system ensure reproducibility.

### V. Modularity ✅ PASS

**Requirement**: Frontend, backend, database, and auth components MUST be clearly separated and follow spec-driven architecture.

**Implementation**:
- ✅ Frontend is separate Next.js application (not monorepo with backend)
- ✅ Backend API accessed via HTTP REST endpoints (no direct DB access)
- ✅ Better Auth handles authentication, backend verifies JWT
- ✅ Clear separation: UI components, API client, auth config, types
- ✅ Follows Agentic Dev Stack workflow: Spec → Plan → Tasks → Implement

**No violations**. Modular architecture with clear boundaries.

## Phase 0: Research & Design Decisions

### Decision 1: Better Auth Configuration with JWT Plugin

**Decision**: Use Better Auth with JWT plugin enabled, storing tokens in httpOnly cookies, and integrating with FastAPI backend via shared secret.

**Rationale**:
- Better Auth provides robust authentication with minimal configuration
- JWT plugin enables stateless token-based auth compatible with FastAPI
- httpOnly cookies prevent XSS attacks (more secure than localStorage)
- Shared secret (BETTER_AUTH_SECRET) enables backend to verify JWT signatures

**Implementation**:
```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  database: {
    provider: "postgresql",
    url: process.env.DATABASE_URL!
  },
  plugins: [jwt()],
  session: {
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    }
  }
});
```

**Alternatives Considered**:
- NextAuth.js: More complex setup, less JWT-focused
- Custom JWT implementation: Reinventing the wheel, more security risks
- Session-based auth: Stateful, requires backend session storage

### Decision 2: API Client with Automatic JWT Attachment

**Decision**: Create a centralized API client that automatically attaches JWT tokens to all backend requests and handles 401 responses.

**Rationale**:
- DRY principle: Single source of truth for API calls
- Automatic JWT attachment reduces boilerplate in components
- Centralized error handling for authentication failures
- Simplifies component code (just call `apiClient.get('/tasks')`)

**Implementation**:
```typescript
// lib/api-client.ts
import { auth } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getAuthHeaders(): Promise<HeadersInit> {
  const session = await auth.api.getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const token = session.token; // JWT token from Better Auth
  return {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };
}

export const apiClient = {
  async get<T>(path: string): Promise<T> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${path}`, { headers });

    if (response.status === 401) {
      // Redirect to signin on auth failure
      window.location.href = "/signin";
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  },

  async post<T>(path: string, data: unknown): Promise<T> { /* similar */ },
  async put<T>(path: string, data: unknown): Promise<T> { /* similar */ },
  async patch<T>(path: string): Promise<T> { /* similar */ },
  async delete(path: string): Promise<void> { /* similar */ }
};
```

**Alternatives Considered**:
- Manual fetch in each component: Lots of duplication
- Third-party library (axios, ky): Adds dependency, built-in fetch is sufficient
- Server Actions only: Can't use in client components (need both)

### Decision 3: App Router with Server Components by Default

**Decision**: Use Next.js App Router with Server Components as the default, adding 'use client' only when client interactivity is required.

**Rationale**:
- Better performance: Server Components reduce JavaScript bundle size
- SEO benefits: Initial HTML rendered on server
- Security: API calls from server components don't expose tokens to client
- App Router is the recommended Next.js approach (Pages Router is legacy)

**Components Requiring 'use client'**:
- Task completion checkbox (onClick handler)
- Task creation/edit forms (form state, onChange handlers)
- Delete confirmation modal (state for modal visibility)
- Error boundary components (error state)

**Server Components**:
- Task list display (data fetching)
- Layout components
- Protected route wrappers (authentication checks)

**Alternatives Considered**:
- Pages Router: Legacy, less performant
- Client Components everywhere: Larger bundle size, worse performance
- Hybrid approach (mix of both): Already the plan (use both as needed)

### Decision 4: Tailwind CSS for Styling

**Decision**: Use Tailwind CSS with mobile-first utility classes for responsive design.

**Rationale**:
- Rapid prototyping with utility classes
- Built-in responsive breakpoints (sm, md, lg, xl)
- No CSS-in-JS runtime overhead
- Excellent documentation and community support
- Purges unused styles in production (small bundle)

**Responsive Breakpoints**:
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'sm': '640px',   // Mobile landscape
      'md': '768px',   // Tablet portrait
      'lg': '1024px',  // Tablet landscape / Desktop
      'xl': '1280px',  // Large desktop
    }
  }
}
```

**Example Mobile-First Class**:
```tsx
<div className="text-sm sm:text-base md:text-lg">
  {/* Font size: 14px mobile, 16px tablet, 18px desktop */}
</div>
```

**Alternatives Considered**:
- CSS Modules: More verbose, no utility classes
- styled-components: Runtime overhead, larger bundle
- Plain CSS: No utility classes, harder to maintain

### Decision 5: TypeScript Types for Task Entity

**Decision**: Define TypeScript interfaces that mirror the backend Task schema for type safety.

**Rationale**:
- Compile-time type checking prevents runtime errors
- IntelliSense autocomplete in VS Code
- Self-documenting code (interface serves as documentation)
- Ensures frontend-backend schema alignment

**Implementation**:
```typescript
// types/task.ts
export interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  owner_id: number;
  created_at: string; // ISO 8601 datetime string
  updated_at: string;
}

export interface TaskCreateInput {
  title: string;
  description?: string;
}

export interface TaskUpdateInput {
  title?: string;
  description?: string;
}
```

**Alternatives Considered**:
- JavaScript without types: No type safety, more runtime errors
- Zod schemas: Overkill for simple types, adds dependency
- Generate types from OpenAPI spec: Adds build complexity, manual is simpler

### Decision 6: Protected Route Pattern with Middleware

**Decision**: Use Next.js middleware to check authentication before rendering protected routes.

**Rationale**:
- Centralized authentication logic (no duplication in each page)
- Runs before rendering (prevents flash of unauthenticated content)
- Redirect happens on server (better UX than client-side redirect)

**Implementation**:
```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers
  });

  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard") ||
                           request.nextUrl.pathname.startsWith("/tasks");

  if (isProtectedRoute && !session?.user) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  const isAuthRoute = request.nextUrl.pathname.startsWith("/signin") ||
                      request.nextUrl.pathname.startsWith("/signup");

  if (isAuthRoute && session?.user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/tasks/:path*", "/signin", "/signup"]
};
```

**Alternatives Considered**:
- Per-page authentication checks: Duplication, easy to forget
- Client-side redirect in useEffect: Flash of unauthenticated content
- Higher-order component (HOC): More React code, middleware is simpler

## Phase 1: Design Artifacts

### Data Model (data-model.md)

Frontend data models mirror backend entities with TypeScript interfaces. See [data-model.md](./data-model.md) for complete schemas.

### API Contracts (contracts/)

Frontend consumes the backend API contracts from `001-todo-api-backend/contracts/todo-api.yaml`. See [contracts/frontend-api-integration.md](./contracts/frontend-api-integration.md) for integration details.

### Quickstart (quickstart.md)

See [quickstart.md](./quickstart.md) for setup instructions.

## Phase 2: Implementation Phases

### Phase 1: Project Setup & Configuration (T001-T010)

**Purpose**: Initialize Next.js application with all required dependencies and configurations.

**Tasks**:
1. Initialize Next.js 16 project with TypeScript and App Router
2. Install dependencies (Better Auth, Tailwind CSS)
3. Configure environment variables (.env.local)
4. Set up Tailwind CSS with mobile-first breakpoints
5. Create project structure (app/, components/, lib/, types/)
6. Configure Better Auth with JWT plugin
7. Create API client utility (lib/api-client.ts)
8. Define TypeScript types (types/task.ts)
9. Create authentication middleware (middleware.ts)
10. Verify development server runs (npm run dev)

**Output**: Working Next.js application with authentication infrastructure

### Phase 2: Authentication (User Story 1 - P1) 🎯 MVP (T011-T022)

**Purpose**: Implement user signup, signin, and protected route access control.

**Tasks**:
11. Create signup page UI (app/(auth)/signup/page.tsx)
12. Implement signup form with Better Auth
13. Create signin page UI (app/(auth)/signin/page.tsx)
14. Implement signin form with Better Auth
15. Configure Better Auth API routes (app/api/auth/[...all]/route.ts)
16. Test signup flow (create account → redirect to signin)
17. Test signin flow (authenticate → redirect to dashboard)
18. Test protected route access (unauthenticated → /signin redirect)
19. Verify JWT token storage in httpOnly cookie
20. Test authenticated API request (JWT in Authorization header)
21. Implement logout functionality
22. Test session persistence across page refreshes

**Output**: Fully functional authentication (signup, signin, protected routes, logout)

### Phase 3: Task List Display (User Story 2 - P1) 🎯 MVP (T023-T032)

**Purpose**: Display all user's tasks on the dashboard with loading/error states.

**Tasks**:
23. Create dashboard layout (app/(dashboard)/layout.tsx)
24. Create dashboard page (app/(dashboard)/dashboard/page.tsx)
25. Implement fetchTasks function (GET /api/{user_id}/tasks)
26. Display task list (title, description, completion status)
27. Implement loading state (skeleton or spinner)
28. Implement error state with retry button
29. Implement empty state (no tasks message + CTA)
30. Order tasks by creation date (newest first)
31. Style task list for mobile responsiveness
32. Test with multiple tasks (verify all display correctly)

**Output**: Functional task list view on /dashboard

### Phase 4: Task Creation (User Story 3 - P1) 🎯 MVP (T033-T044)

**Purpose**: Enable users to create new tasks via a form.

**Tasks**:
33. Create task creation page (app/tasks/create/page.tsx)
34. Build TaskForm component (components/TaskForm.tsx)
35. Implement title input with validation (1-1000 chars)
36. Implement description textarea (optional, max 5000 chars)
37. Add client-side validation errors (inline display)
38. Implement form submission (POST /api/{user_id}/tasks)
39. Show loading state during submission (disabled button)
40. Handle API errors (display error message)
41. Redirect to /dashboard after successful creation
42. Test with valid data (task appears on dashboard)
43. Test with invalid data (validation errors displayed)
44. Style form for mobile responsiveness

**Output**: Working task creation flow

### Phase 5: Task Completion Toggle (User Story 4 - P2) (T045-T052)

**Purpose**: Allow users to toggle task completion status with a single click.

**Tasks**:
45. Add checkbox component to task list items
46. Implement toggle handler (PATCH /api/{user_id}/tasks/{id}/complete)
47. Implement optimistic UI update (immediate toggle)
48. Handle API failure (revert UI, show error)
49. Disable checkbox during API request
50. Test multiple rapid toggles (prevent race conditions)
51. Verify persistence (refresh page, status maintained)
52. Style checkbox for accessibility (visible focus state)

**Output**: Functional completion toggle on task list

### Phase 6: Task Editing (User Story 5 - P2) (T053-T064)

**Purpose**: Enable users to edit existing tasks.

**Tasks**:
53. Create edit page (app/tasks/[id]/edit/page.tsx)
54. Fetch task details on load (GET /api/{user_id}/tasks/{id})
55. Pre-fill TaskForm with current data
56. Implement update handler (PUT /api/{user_id}/tasks/{id})
57. Add cancel button (redirect to /dashboard)
58. Handle 404 (task not found → redirect to /dashboard)
59. Handle 403 (forbidden → redirect to /dashboard with error)
60. Show loading state during update
61. Display validation errors
62. Redirect to /dashboard after success
63. Test edit flow (modify task → verify changes persist)
64. Style edit form for mobile responsiveness

**Output**: Working task edit flow

### Phase 7: Task Deletion (User Story 6 - P3) (T065-T074)

**Purpose**: Enable users to delete tasks with confirmation.

**Tasks**:
65. Add delete button to task list items
66. Create ConfirmDeleteModal component (components/ConfirmDeleteModal.tsx)
67. Implement modal state (open/close)
68. Implement delete handler (DELETE /api/{user_id}/tasks/{id})
69. Remove task from UI on success (no page reload)
70. Handle API errors (display error, keep task in list)
71. Test cancel button (modal closes, task remains)
72. Test confirm button (task deleted and removed)
73. Style modal for mobile responsiveness
74. Add accessibility (Escape key closes modal, focus trap)

**Output**: Task deletion with confirmation modal

### Phase 8: Polish & Responsive Design (T075-T090)

**Purpose**: Final UX improvements, responsive design, and production readiness.

**Tasks**:
75. Test all pages on mobile (320px, 375px, 414px)
76. Test all pages on tablet (768px, 1024px)
77. Test all pages on desktop (1280px, 1920px)
78. Fix any responsive layout issues
79. Add loading spinners to all async operations
80. Improve error messages (user-friendly, actionable)
81. Add logout button in navigation
82. Implement global error handling (401 → /signin redirect)
83. Add page titles (Next.js Head)
84. Add favicon
85. Optimize images (if any)
86. Run Lighthouse audit (performance, accessibility, SEO)
87. Fix Lighthouse issues (aim for 90+ scores)
88. Test with backend API (end-to-end integration)
89. Document any known issues or limitations
90. Prepare for deployment (build and test production bundle)

**Output**: Production-ready responsive frontend

## Risk Mitigation

### Risk 1: JWT Token Expiration During Session

**Mitigation**:
- Implement token refresh logic in API client
- Backend issues refresh tokens with longer expiration
- Frontend detects 401 and redirects to /signin with message

### Risk 2: CORS Issues Between Frontend and Backend

**Mitigation**:
- Backend CORS configuration allows frontend origin (http://localhost:3000)
- Test cross-origin requests early in Phase 2
- Document required CORS headers in quickstart.md

### Risk 3: Race Conditions in Optimistic UI Updates

**Mitigation**:
- Track in-flight requests (useState for loading state)
- Disable action buttons during API calls
- Implement proper error rollback on failure

### Risk 4: Better Auth Configuration Complexity

**Mitigation**:
- Follow Better Auth official documentation
- Test authentication flow in Phase 2 before building features
- Use Better Auth examples from GitHub repository

## Testing Strategy

### Manual Testing

**Authentication**:
- Signup with valid/invalid email and password
- Signin with correct/incorrect credentials
- Access protected routes while authenticated
- Try to access protected routes while unauthenticated

**Task Management**:
- Create task with title only
- Create task with title and description
- Toggle task completion multiple times
- Edit task and save changes
- Delete task with confirmation
- Test all API error scenarios (401, 403, 404, 422, 500)

**Responsive Design**:
- Test on mobile (320px, 375px, 414px)
- Test on tablet (768px, 1024px)
- Test on desktop (1280px, 1920px)

### Integration Testing (Optional Post-MVP)

- End-to-end tests with Playwright
- Component tests with React Testing Library
- API mocking with MSW (Mock Service Worker)

## Success Metrics

### Performance

- First Contentful Paint (FCP): < 1.5 seconds
- Time to Interactive (TTI): < 3 seconds
- Lighthouse Performance score: > 90

### Functionality

- All 6 user stories complete and tested
- All API endpoints integrated and working
- Authentication flow functional (signup, signin, protected routes)
- Responsive design verified on mobile, tablet, desktop

### Code Quality

- TypeScript strict mode enabled (no `any` types)
- All components have prop interfaces
- API client handles errors gracefully
- No console errors or warnings

## Deployment Considerations

### Development

```bash
npm install
npm run dev  # Runs on http://localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

### Environment Variables (Production)

- `BETTER_AUTH_SECRET`: Strong random secret (32+ characters)
- `BETTER_AUTH_URL`: Production frontend URL (https://example.com)
- `NEXT_PUBLIC_API_URL`: Production backend URL (https://api.example.com)
- `DATABASE_URL`: Neon PostgreSQL production connection string

### Vercel Deployment (Recommended)

1. Push code to GitHub repository
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy (automatic on push to main)

## Next Steps

After planning is complete:

1. Run `/sp.tasks` to generate detailed task breakdown
2. Execute `/sp.implement` to build the frontend incrementally
3. Test integration with backend API (ensure backend is running)
4. Deploy to staging environment for user testing
