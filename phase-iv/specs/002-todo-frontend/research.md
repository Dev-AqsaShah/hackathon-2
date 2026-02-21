# Research & Technology Decisions: Todo Frontend

**Feature**: `002-todo-frontend`
**Date**: 2026-01-26

## Decision 1: Better Auth with JWT Plugin

**Context**: Frontend needs authentication that integrates with FastAPI backend using JWT tokens.

**Decision**: Use Better Auth library with JWT plugin enabled.

**Rationale**:
- **JWT Plugin**: Better Auth's JWT plugin generates JWT tokens compatible with FastAPI's python-jose verification
- **Shared Secret**: Both frontend and backend use `BETTER_AUTH_SECRET` for JWT signing/verification
- **httpOnly Cookies**: Tokens stored securely, not accessible via JavaScript (prevents XSS)
- **Minimal Configuration**: Better Auth handles signup, signin, session management, and token refresh automatically
- **Database Integration**: Uses existing Neon PostgreSQL database for user storage

**Implementation Details**:
```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!, // Shared with backend
  database: {
    provider: "postgresql",
    url: process.env.DATABASE_URL!
  },
  plugins: [jwt()], // Enable JWT token generation
  session: {
    cookieOptions: {
      httpOnly: true, // Prevent JavaScript access (XSS protection)
      secure: process.env.NODE_ENV === "production", // HTTPS only in prod
      sameSite: "lax" // CSRF protection
    }
  }
});
```

**Alternatives Considered**:
1. **NextAuth.js**: More popular but complex setup, less JWT-focused, designed for OAuth providers primarily
2. **Custom JWT implementation**: Reinventing the wheel, higher risk of security vulnerabilities
3. **Session-based auth**: Stateful, requires backend session storage (Redis), less scalable

**Trade-offs**:
- ✅ Pro: Seamless FastAPI integration via shared secret
- ✅ Pro: Secure token storage (httpOnly cookies)
- ✅ Pro: Automatic token refresh handling
- ❌ Con: Less mature than NextAuth.js (smaller community)
- ❌ Con: Requires database connection (can't use with edge functions without workarounds)

## Decision 2: Centralized API Client with Automatic JWT Attachment

**Context**: Every backend API request must include `Authorization: Bearer <JWT>` header. Need a DRY solution.

**Decision**: Create a centralized `api-client.ts` module that automatically attaches JWT tokens to all requests.

**Rationale**:
- **Single Source of Truth**: All API calls go through one module
- **Automatic JWT**: No manual token extraction in components
- **Error Handling**: Centralized 401 handling (redirect to /signin)
- **Type Safety**: Generic functions with TypeScript return types
- **Maintainability**: Change auth logic once, affects all API calls

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

  return {
    "Authorization": `Bearer ${session.token}`, // Automatic JWT attachment
    "Content-Type": "application/json"
  };
}

export const apiClient = {
  async get<T>(path: string): Promise<T> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${path}`, { headers });

    if (response.status === 401) {
      window.location.href = "/signin"; // Centralized 401 handling
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  },

  // post, put, patch, delete methods similar
};
```

**Usage in Components**:
```typescript
// app/(dashboard)/dashboard/page.tsx
const tasks = await apiClient.get<Task[]>(`/api/${userId}/tasks`);
// No manual JWT extraction or header setting!
```

**Alternatives Considered**:
1. **Manual fetch in each component**: Lots of duplication, easy to forget JWT header
2. **Axios/ky library**: Adds dependency, built-in fetch is sufficient
3. **Server Actions only**: Can't use in client components (toggle, delete need client interactivity)

**Trade-offs**:
- ✅ Pro: DRY (Don't Repeat Yourself)
- ✅ Pro: Centralized error handling
- ✅ Pro: Type-safe API calls
- ❌ Con: Must handle both server and client contexts (Next.js App Router distinction)
- ❌ Con: window.location.href redirect only works client-side (need separate server-side auth)

## Decision 3: Next.js App Router with Server Components by Default

**Context**: Next.js offers App Router (new) and Pages Router (legacy). Need to choose rendering strategy.

**Decision**: Use App Router with Server Components as the default, add 'use client' only when client interactivity is required.

**Rationale**:
- **Performance**: Server Components send less JavaScript to the browser (smaller bundle)
- **SEO**: Initial HTML rendered on server (faster First Contentful Paint)
- **Security**: Server Components can call API without exposing JWT tokens to client
- **Official Recommendation**: Next.js team recommends App Router for new projects
- **Future-Proof**: App Router is the future of Next.js (Pages Router is legacy)

**When to Use 'use client'**:
- Form inputs (onChange handlers, controlled components)
- Click handlers (onClick, onSubmit)
- useState, useEffect hooks
- Browser APIs (window, localStorage)

**Server Components**:
- Task list display (fetch data on server, render HTML)
- Layout components (static structure)
- Protected route checks (server-side redirect)

**Example**:
```tsx
// app/(dashboard)/dashboard/page.tsx (Server Component)
import { auth } from "@/lib/auth";
import { apiClient } from "@/lib/api-client";
import TaskList from "@/components/TaskList"; // Server Component

export default async function DashboardPage() {
  const session = await auth.api.getSession(); // Server-side session check
  const tasks = await apiClient.get<Task[]>(`/api/${session.user.id}/tasks`);

  return <TaskList tasks={tasks} />; // Pre-rendered HTML
}
```

```tsx
// components/TaskItem.tsx (Client Component)
"use client"; // Required for onClick

interface Props {
  task: Task;
  onToggle: (id: number) => void;
}

export function TaskItem({ task, onToggle }: Props) {
  return (
    <div>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)} // Client-side handler
      />
      <span>{task.title}</span>
    </div>
  );
}
```

**Alternatives Considered**:
1. **Pages Router**: Legacy, less performant, no Server Components
2. **All Client Components**: Larger bundle, worse performance, no SEO benefits
3. **Full SSR**: Complex, requires server deployment (not Vercel-friendly)

**Trade-offs**:
- ✅ Pro: Smaller JavaScript bundle (better performance)
- ✅ Pro: SEO-friendly (server-rendered HTML)
- ✅ Pro: Secure (API calls on server don't expose tokens)
- ❌ Con: Learning curve (Server/Client Component distinction)
- ❌ Con: Can't use React hooks in Server Components

## Decision 4: Tailwind CSS for Mobile-First Responsive Design

**Context**: Need a styling solution that supports responsive design (320px mobile to 1920px desktop).

**Decision**: Use Tailwind CSS with mobile-first utility classes.

**Rationale**:
- **Rapid Development**: Utility classes eliminate context switching (no separate CSS files)
- **Responsive Breakpoints**: Built-in sm, md, lg, xl breakpoints
- **Mobile-First**: Default styles apply to mobile, add breakpoints for larger screens
- **Tree-Shaking**: Tailwind purges unused styles in production (tiny bundle)
- **Consistency**: Design system in config (colors, spacing, fonts)
- **Documentation**: Excellent docs with searchable class reference

**Configuration**:
```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'sm': '640px',   // Mobile landscape
      'md': '768px',   // Tablet portrait
      'lg': '1024px',  // Tablet landscape / Desktop
      'xl': '1280px',  // Large desktop
    },
    extend: {
      colors: {
        primary: "#3B82F6", // Blue
        secondary: "#10B981", // Green
        danger: "#EF4444", // Red
      },
    },
  },
  plugins: [],
};
```

**Mobile-First Example**:
```tsx
<div className="text-sm sm:text-base md:text-lg lg:text-xl">
  {/* 14px mobile, 16px tablet, 18px laptop, 20px desktop */}
</div>

<div className="p-4 md:p-6 lg:p-8">
  {/* 16px padding mobile, 24px tablet, 32px desktop */}
</div>
```

**Alternatives Considered**:
1. **CSS Modules**: More verbose, requires separate CSS files, no utility classes
2. **styled-components**: Runtime overhead (CSS-in-JS), larger bundle
3. **Plain CSS**: No utility classes, harder to maintain, no design system

**Trade-offs**:
- ✅ Pro: Fast development (no CSS file switching)
- ✅ Pro: Consistent design (config-based)
- ✅ Pro: Small production bundle (purged unused styles)
- ❌ Con: Verbose HTML (many classes)
- ❌ Con: Learning curve (memorize class names)
- ❌ Con: HTML/CSS coupling (hard to reuse styles without components)

## Decision 5: TypeScript Strict Mode with Explicit Interfaces

**Context**: Need type safety to prevent runtime errors and ensure frontend-backend schema alignment.

**Decision**: Use TypeScript in strict mode with explicit interfaces for all data models and props.

**Rationale**:
- **Compile-Time Safety**: Catch errors before runtime
- **IntelliSense**: Autocomplete in VS Code (faster development)
- **Self-Documenting**: Interfaces serve as inline documentation
- **Refactoring**: Safe renames and type changes
- **Backend Alignment**: Frontend Task interface mirrors backend Pydantic schema

**Configuration**:
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true, // Enable all strict type checks
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

**Type Definitions**:
```typescript
// types/task.ts
export interface Task {
  id: number;
  title: string;
  description: string | null; // Nullable
  completed: boolean;
  owner_id: number;
  created_at: string; // ISO 8601 datetime
  updated_at: string;
}

export interface TaskCreateInput {
  title: string; // Required
  description?: string; // Optional
}

export interface TaskUpdateInput {
  title?: string; // Optional (partial updates)
  description?: string;
}
```

**Component Props**:
```typescript
// components/TaskItem.tsx
interface TaskItemProps {
  task: Task;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  // TypeScript ensures task has all required fields
}
```

**Alternatives Considered**:
1. **JavaScript without types**: No type safety, more runtime errors, worse DX
2. **TypeScript loose mode**: Allows implicit any, less safe
3. **Zod schemas**: Runtime validation, adds dependency (overkill for frontend)

**Trade-offs**:
- ✅ Pro: Catch errors at compile time
- ✅ Pro: Better IDE support (autocomplete)
- ✅ Pro: Self-documenting code
- ❌ Con: More boilerplate (interface definitions)
- ❌ Con: Learning curve (TypeScript syntax)

## Decision 6: Protected Route Middleware

**Context**: Protected routes (/dashboard, /tasks/*) must redirect unauthenticated users to /signin.

**Decision**: Use Next.js middleware to check authentication before rendering any protected route.

**Rationale**:
- **Centralized Logic**: Single place for auth checks (no duplication per page)
- **Server-Side**: Redirect happens on server (no flash of unauthenticated content)
- **Performance**: Runs before page render (fast redirect)
- **DRY**: Don't repeat authentication checks in every protected page

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

  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/tasks");

  // Redirect unauthenticated users to signin
  if (isProtectedRoute && !session?.user) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // Redirect authenticated users away from auth pages
  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/signin") ||
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
1. **Per-page auth checks**: Duplication, easy to forget, code smell
2. **Client-side redirect (useEffect)**: Flash of unauthenticated content (bad UX)
3. **Higher-order component (HOC)**: More React code, less performant than middleware

**Trade-offs**:
- ✅ Pro: Centralized authentication (DRY)
- ✅ Pro: Server-side redirect (no flash)
- ✅ Pro: Fast (runs before render)
- ❌ Con: Middleware runs on every request (Edge runtime overhead)
- ❌ Con: Can't use Node.js APIs in middleware (Edge runtime limitation)

## Technology Stack Summary

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Framework | Next.js | 16+ | App Router, Server Components, routing |
| Language | TypeScript | 5.3+ | Type safety, IDE support |
| Authentication | Better Auth | 1.0+ | JWT-based auth with backend integration |
| Styling | Tailwind CSS | 3.4+ | Mobile-first responsive design |
| HTTP Client | Fetch API | Built-in | Backend API calls with JWT |
| State | React Hooks | Built-in | Local component state (useState, useEffect) |
| Database | Neon PostgreSQL | Serverless | User storage (via Better Auth) |
| Build Tool | Next.js | Built-in | Turbopack (dev), Webpack (prod) |
| Deployment | Vercel | Latest | Production hosting (recommended) |

## Best Practices

### Security
- Store JWT in httpOnly cookies (not localStorage)
- Use `BETTER_AUTH_SECRET` from environment variables
- Validate all user input client-side AND server-side (backend is source of truth)
- HTTPS only in production

### Performance
- Use Server Components by default (smaller bundles)
- Add 'use client' only when needed (interactivity)
- Optimize images with Next.js Image component
- Lazy load components with next/dynamic

### Code Quality
- TypeScript strict mode enabled
- Explicit prop interfaces for all components
- Centralized API client (DRY)
- Mobile-first responsive design

### Testing
- Manual testing for MVP (automated tests post-MVP)
- Test on real devices (iOS Safari, Android Chrome)
- Lighthouse audits (performance, accessibility, SEO)

## References

- [Better Auth Documentation](https://better-auth.com/docs)
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Backend API Spec](../001-todo-api-backend/contracts/todo-api.yaml)
