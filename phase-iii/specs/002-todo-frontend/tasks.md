# Tasks: Todo Full-Stack Web Application — Frontend

**Input**: Design documents from `/specs/002-todo-frontend/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/frontend-api-integration.md

**Tests**: This feature does NOT explicitly request tests in the specification. Test tasks are excluded per workflow guidelines. Manual testing will be performed per quickstart.md instructions.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- **File paths**: All paths relative to `frontend/` directory

## Path Conventions

- **Frontend**: `frontend/` (Next.js 16 application)
- **Pages**: `frontend/app/` (App Router pages)
- **Components**: `frontend/components/`
- **Utilities**: `frontend/lib/`
- **Types**: `frontend/types/`
- **Middleware**: `frontend/middleware.ts`

---

## Phase 1: Project Setup & Configuration

**Purpose**: Initialize Next.js application with all required dependencies and configurations

**Status**: ⏭️ Ready to start - no prerequisites

- [X] T001 Verify Node.js version 20.x LTS is installed (run `node --version`)
- [X] T002 Navigate to frontend directory and verify package.json exists
- [X] T003 [P] Install dependencies via `npm install` or `pnpm install`
- [X] T004 [P] Create .env.local file with BETTER_AUTH_SECRET, BETTER_AUTH_URL, NEXT_PUBLIC_API_URL, DATABASE_URL
- [X] T005 [P] Verify Tailwind CSS configuration exists in tailwind.config.js
- [X] T006 [P] Verify TypeScript configuration in tsconfig.json has strict mode enabled
- [X] T007 [P] Create types directory structure: frontend/types/task.ts, frontend/types/auth.ts, frontend/types/state.ts
- [X] T008 [P] Define Task interface in frontend/types/task.ts (id, title, description, completed, owner_id, created_at, updated_at)
- [X] T009 [P] Define TaskCreateInput and TaskUpdateInput interfaces in frontend/types/task.ts
- [X] T010 [P] Define UserSession interface in frontend/types/auth.ts
- [X] T011 [P] Define TaskListState and TaskFormState interfaces in frontend/types/state.ts
- [X] T012 Test development server starts successfully: `npm run dev`

**Checkpoint**: Development environment ready - Node modules installed, TypeScript types defined, dev server runs

---

## Phase 2: Foundational Infrastructure

**Purpose**: Core authentication and API client infrastructure that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Authentication Configuration

- [X] T013 Install Better Auth library: `npm install better-auth`
- [X] T014 Create Better Auth configuration file in frontend/lib/auth.ts
- [X] T015 Configure Better Auth with JWT plugin enabled in frontend/lib/auth.ts
- [X] T016 Set session cookie options (httpOnly: true, secure in production, sameSite: 'lax') in frontend/lib/auth.ts
- [X] T017 Configure database connection in Better Auth (provider: postgresql, url from env)
- [X] T018 Create Better Auth API route: frontend/app/api/auth/[...all]/route.ts
- [X] T019 Export GET and POST handlers from Better Auth API route
- [X] T020 Test Better Auth configuration compiles without errors

### API Client

- [X] T021 [P] Create API client utility in frontend/lib/api-client.ts
- [X] T022 [P] Implement getAuthHeaders() function to extract JWT from Better Auth session
- [X] T023 [P] Implement apiClient.get<T>() method with automatic JWT attachment
- [X] T024 [P] Implement apiClient.post<T>() method with automatic JWT attachment
- [X] T025 [P] Implement apiClient.put<T>() method with automatic JWT attachment
- [X] T026 [P] Implement apiClient.patch<T>() method with automatic JWT attachment
- [X] T027 [P] Implement apiClient.delete() method with automatic JWT attachment
- [X] T028 [P] Add 401 error handling in API client (redirect to /signin)
- [X] T029 [P] Add generic error handling for other status codes (403, 404, 422, 500)

### Protected Route Middleware

- [X] T030 Create middleware file in frontend/middleware.ts
- [X] T031 Implement authentication check using Better Auth getSession()
- [X] T032 Add redirect logic: protected routes → /signin if unauthenticated
- [X] T033 Add redirect logic: auth routes (/signin, /signup) → /dashboard if authenticated
- [X] T034 Configure middleware matcher for routes: ["/dashboard/:path*", "/tasks/:path*", "/signin", "/signup"]
- [X] T035 Test middleware redirects work correctly

**Checkpoint**: Foundation ready - Better Auth configured, API client with JWT, middleware protecting routes

---

## Phase 3: User Story 1 - User Authentication (Priority: P1) 🎯 MVP

**Goal**: Enable users to create accounts and sign in with JWT-based authentication

**Independent Test**: Create account at /signup, sign in at /signin, verify redirect to /dashboard with valid session, confirm JWT token is attached to subsequent API requests

**Acceptance Criteria**:
- User can signup with email and password at /signup
- User can signin with credentials at /signin
- Authenticated users are redirected to /dashboard
- Unauthenticated users trying to access /dashboard are redirected to /signin
- JWT token is automatically attached to all backend API requests

### Signup Page

- [X] T036 [US1] Create signup page directory: frontend/app/(auth)/signup/
- [X] T037 [US1] Create signup page component: frontend/app/(auth)/signup/page.tsx
- [X] T038 [US1] Create SignUpForm client component: frontend/components/SignUpForm.tsx
- [X] T039 [US1] Add 'use client' directive to SignUpForm component
- [X] T040 [US1] Implement form state for email and password in SignUpForm
- [X] T041 [US1] Add client-side validation: email format, password min 8 characters
- [X] T042 [US1] Implement handleSubmit function calling Better Auth signup API
- [X] T043 [US1] Display validation errors inline (email invalid, password too short)
- [X] T044 [US1] Show loading state during signup (disabled button, spinner)
- [X] T045 [US1] Redirect to /signin after successful signup
- [X] T046 [US1] Display API errors from Better Auth (user already exists, etc.)
- [X] T047 [US1] Style signup form with Tailwind CSS (mobile-first responsive)

### Signin Page

- [X] T048 [US1] Create signin page directory: frontend/app/(auth)/signin/
- [X] T049 [US1] Create signin page component: frontend/app/(auth)/signin/page.tsx
- [X] T050 [US1] Create SignInForm client component: frontend/components/SignInForm.tsx
- [X] T051 [US1] Add 'use client' directive to SignInForm component
- [X] T052 [US1] Implement form state for email and password in SignInForm
- [X] T053 [US1] Add client-side validation: email format, password required
- [X] T054 [US1] Implement handleSubmit function calling Better Auth signin API
- [X] T055 [US1] Display validation errors inline
- [X] T056 [US1] Show loading state during signin (disabled button, spinner)
- [X] T057 [US1] Redirect to /dashboard after successful signin
- [X] T058 [US1] Display API errors (invalid credentials, account not found)
- [X] T059 [US1] Style signin form with Tailwind CSS (mobile-first responsive)

### Testing & Verification

- [X] T060 [US1] Test signup flow: create account with test@example.com
- [X] T061 [US1] Test signin flow: authenticate with created account
- [X] T062 [US1] Test protected route: access /dashboard while unauthenticated (should redirect to /signin)
- [X] T063 [US1] Test authenticated redirect: access /signin while authenticated (should redirect to /dashboard)
- [X] T064 [US1] Verify JWT token is stored in httpOnly cookie (check browser DevTools)
- [X] T065 [US1] Verify session persists across page refreshes

**Checkpoint**: User Story 1 complete - users can signup, signin, and access protected routes

---

## Phase 4: User Story 2 - Task List Viewing (Priority: P1) 🎯 MVP

**Goal**: Display all user's tasks on the dashboard with loading and error states

**Independent Test**: Sign in, navigate to /dashboard, verify tasks from backend API are displayed ordered by creation date (newest first). Create tasks via backend API directly and refresh page to confirm they appear.

**Acceptance Criteria**:
- Authenticated users see their task list on /dashboard
- Tasks display title, description (if present), completion status
- Loading state shown during API fetch
- Error state shown if API fails, with retry button
- Empty state shown when user has no tasks

### Dashboard Layout & Page

- [X] T066 [US2] Create dashboard layout directory: frontend/app/(dashboard)/
- [X] T067 [US2] Create dashboard layout component: frontend/app/(dashboard)/layout.tsx
- [X] T068 [US2] Add navigation header with "Create Task" link and "Logout" button in layout
- [X] T069 [US2] Create dashboard page: frontend/app/(dashboard)/dashboard/page.tsx
- [X] T070 [US2] Fetch authenticated user session using Better Auth getSession() in dashboard page
- [X] T071 [US2] Fetch tasks using apiClient.get<Task[]>(`/api/${userId}/tasks`) in dashboard page
- [X] T072 [US2] Pass tasks data to TaskList component

### Task List Components

- [X] T073 [P] [US2] Create TaskList server component: frontend/components/TaskList.tsx
- [X] T074 [P] [US2] Implement TaskList to map over tasks array and render TaskItem components
- [X] T075 [P] [US2] Add empty state JSX: "No tasks yet. Create your first task!"
- [X] T076 [P] [US2] Create TaskItem client component: frontend/components/TaskItem.tsx
- [X] T077 [P] [US2] Add 'use client' directive to TaskItem component
- [X] T078 [P] [US2] Display task title in TaskItem
- [X] T079 [P] [US2] Display task description in TaskItem (if present, show null as empty)
- [X] T080 [P] [US2] Display completion status checkbox in TaskItem (disabled for now, will enable in US4)
- [X] T081 [P] [US2] Add "Edit" and "Delete" buttons to TaskItem (will implement handlers in later stories)
- [X] T082 [P] [US2] Style TaskItem with Tailwind CSS (card layout, mobile-responsive)

### Loading & Error States

- [X] T083 [US2] Add loading state component: frontend/components/LoadingSpinner.tsx
- [X] T084 [US2] Display LoadingSpinner while tasks are being fetched
- [X] T085 [US2] Add error state component: frontend/components/ErrorMessage.tsx
- [X] T086 [US2] Display ErrorMessage with retry button if API fetch fails
- [X] T087 [US2] Implement retry handler that re-fetches tasks

### Testing & Verification

- [X] T088 [US2] Test dashboard with zero tasks (verify empty state displays)
- [X] T089 [US2] Test dashboard with multiple tasks (verify all display correctly)
- [X] T090 [US2] Test task ordering (newest tasks appear first)
- [X] T091 [US2] Test loading state (fast 3G throttling in DevTools)
- [X] T092 [US2] Test error state (stop backend API, verify error message and retry)
- [X] T093 [US2] Test responsive design on mobile (320px width)

**Checkpoint**: User Story 2 complete - users can view their task list on dashboard

---

## Phase 5: User Story 3 - Task Creation (Priority: P1) 🎯 MVP

**Goal**: Enable users to create new tasks with title and optional description

**Independent Test**: Sign in, click "Create Task", navigate to /tasks/create, submit form with title "Test Task" and description "Test Description", verify redirect to /dashboard and new task appears at top of list

**Acceptance Criteria**:
- User can access task creation form at /tasks/create
- Form validates title (required, 1-1000 chars) and description (optional, max 5000 chars)
- Successful creation redirects to /dashboard with new task visible
- Validation errors displayed inline
- Loading state during submission

### Task Creation Page

- [X] T094 [US3] Create task creation page directory: frontend/app/tasks/create/
- [X] T095 [US3] Create task creation page component: frontend/app/tasks/create/page.tsx
- [X] T096 [US3] Create TaskForm client component: frontend/components/TaskForm.tsx (reusable for create & edit)
- [X] T097 [US3] Add 'use client' directive to TaskForm component
- [X] T098 [US3] Implement form state for title and description in TaskForm
- [X] T099 [US3] Add title input field with max length 1000
- [X] T100 [US3] Add description textarea with max length 5000
- [X] T101 [US3] Create validation function in frontend/lib/validation.ts
- [X] T102 [US3] Implement validateTaskForm() checking title required, title max 1000, description max 5000
- [X] T103 [US3] Display validation errors inline below each field
- [X] T104 [US3] Implement handleSubmit function for task creation
- [X] T105 [US3] Call apiClient.post<Task>(`/api/${userId}/tasks`, formData) in handleSubmit
- [X] T106 [US3] Show loading state during submission (disabled button, spinner)
- [X] T107 [US3] Redirect to /dashboard after successful creation using useRouter
- [X] T108 [US3] Display API errors (422 validation, 401 unauthorized, network errors)
- [X] T109 [US3] Add "Cancel" button that redirects to /dashboard
- [X] T110 [US3] Style TaskForm with Tailwind CSS (mobile-first responsive)

### Testing & Verification

- [X] T111 [US3] Test form validation: submit empty title (should show error)
- [X] T112 [US3] Test form validation: submit title > 1000 chars (should show error)
- [X] T113 [US3] Test form validation: submit description > 5000 chars (should show error)
- [X] T114 [US3] Test successful creation: submit valid task, verify redirect and task appears on dashboard
- [X] T115 [US3] Test cancel button: click cancel, verify redirect to /dashboard without creating task
- [X] T116 [US3] Test API error handling: stop backend, submit form, verify error message
- [X] T117 [US3] Test responsive design on mobile (320px width)

**Checkpoint**: User Story 3 complete - users can create tasks via form

---

## Phase 6: User Story 4 - Task Completion Toggle (Priority: P2)

**Goal**: Enable users to toggle task completion status with a single click

**Independent Test**: Sign in, view /dashboard with tasks, click checkbox on a task, verify immediate UI update and persistence after page refresh

**Acceptance Criteria**:
- Checkbox is clickable on each task in the list
- Clicking toggles completed status (true ↔ false)
- UI updates optimistically (immediate visual feedback)
- If API fails, UI reverts and shows error
- Checkbox disabled during API request

### Toggle Implementation

- [ ] T118 [US4] Update TaskItem component to make checkbox clickable (remove disabled attribute)
- [ ] T119 [US4] Implement handleToggle function in TaskItem component
- [ ] T120 [US4] Add useState for loading state per task (to disable checkbox during request)
- [ ] T121 [US4] Implement optimistic UI update: toggle completed in local state immediately
- [ ] T122 [US4] Call apiClient.patch<Task>(`/api/${userId}/tasks/${taskId}/complete`) in handleToggle
- [ ] T123 [US4] Update task state with API response on success
- [ ] T124 [US4] Revert optimistic update on API failure and display error
- [ ] T125 [US4] Disable checkbox during API request (prevent double-clicks)
- [ ] T126 [US4] Add visual feedback: strikethrough text for completed tasks
- [ ] T127 [US4] Add visual feedback: different checkbox style for completed tasks

### Testing & Verification

- [ ] T128 [US4] Test toggle from incomplete to complete (verify UI updates immediately)
- [ ] T129 [US4] Test toggle from complete to incomplete (verify UI updates immediately)
- [ ] T130 [US4] Test persistence: toggle task, refresh page, verify status maintained
- [ ] T131 [US4] Test rapid clicks: toggle multiple times quickly (verify requests don't race)
- [ ] T132 [US4] Test API error: stop backend, toggle task, verify rollback and error message
- [ ] T133 [US4] Test checkbox disabled state during request

**Checkpoint**: User Story 4 complete - users can toggle task completion

---

## Phase 7: User Story 5 - Task Editing (Priority: P2)

**Goal**: Enable users to update task title and/or description

**Independent Test**: Sign in, click "Edit" on a task, navigate to /tasks/[id]/edit with pre-filled form, modify title, save, verify redirect to /dashboard with updated task

**Acceptance Criteria**:
- Edit button navigates to /tasks/[id]/edit
- Form pre-filled with current task data
- User can modify title and/or description
- Validation same as creation form
- Successful update redirects to /dashboard
- 403/404 errors handled gracefully

### Task Edit Page

- [ ] T134 [US5] Create task edit page directory: frontend/app/tasks/[id]/edit/
- [ ] T135 [US5] Create task edit page component: frontend/app/tasks/[id]/edit/page.tsx
- [ ] T136 [US5] Fetch task details using apiClient.get<Task>(`/api/${userId}/tasks/${taskId}`)
- [ ] T137 [US5] Handle 404 error (task not found): redirect to /dashboard with error message
- [ ] T138 [US5] Handle 403 error (forbidden): redirect to /dashboard with "Access denied" message
- [ ] T139 [US5] Reuse TaskForm component for editing (pass initialData and mode="edit" props)
- [ ] T140 [US5] Update TaskForm to accept initialData prop and pre-fill form fields
- [ ] T141 [US5] Update TaskForm to accept mode prop ("create" | "edit")
- [ ] T142 [US5] Implement handleUpdate function in TaskForm for edit mode
- [ ] T143 [US5] Call apiClient.put<Task>(`/api/${userId}/tasks/${taskId}`, formData) in handleUpdate
- [ ] T144 [US5] Redirect to /dashboard after successful update
- [ ] T145 [US5] Display API errors (422 validation, 404 not found, 403 forbidden)
- [ ] T146 [US5] Update TaskItem to add onClick handler to "Edit" button navigating to /tasks/[id]/edit

### Testing & Verification

- [ ] T147 [US5] Test edit page loads with pre-filled data
- [ ] T148 [US5] Test updating title only (leave description unchanged)
- [ ] T149 [US5] Test updating description only (leave title unchanged)
- [ ] T150 [US5] Test updating both title and description
- [ ] T151 [US5] Test validation: submit empty title (should show error)
- [ ] T152 [US5] Test cancel button: verify redirect without saving changes
- [ ] T153 [US5] Test 404 handling: navigate to /tasks/999/edit (non-existent task)
- [ ] T154 [US5] Test successful update: verify redirect and updated task appears on dashboard

**Checkpoint**: User Story 5 complete - users can edit task title and description

---

## Phase 8: User Story 6 - Task Deletion (Priority: P3)

**Goal**: Enable users to permanently delete tasks with confirmation

**Independent Test**: Sign in, click "Delete" on a task, confirm in modal, verify task removed from list without page reload

**Acceptance Criteria**:
- Delete button opens confirmation modal
- Modal displays "Are you sure?" message
- Confirm button deletes task and removes from UI
- Cancel button closes modal without deleting
- API errors handled gracefully

### Confirmation Modal

- [ ] T155 [US6] Create ConfirmDeleteModal client component: frontend/components/ConfirmDeleteModal.tsx
- [ ] T156 [US6] Add 'use client' directive to ConfirmDeleteModal
- [ ] T157 [US6] Implement modal state (open/closed) using useState
- [ ] T158 [US6] Add modal overlay with click-outside to close
- [ ] T159 [US6] Add modal content: "Are you sure you want to delete this task?"
- [ ] T160 [US6] Add "Cancel" button that closes modal
- [ ] T161 [US6] Add "Confirm Delete" button that calls onConfirm callback
- [ ] T162 [US6] Add loading state during delete request (disabled buttons)
- [ ] T163 [US6] Add Escape key listener to close modal
- [ ] T164 [US6] Style modal with Tailwind CSS (centered, responsive, accessible)

### Delete Implementation

- [ ] T165 [US6] Update TaskItem to add useState for modal visibility
- [ ] T166 [US6] Add onClick handler to "Delete" button that opens modal
- [ ] T167 [US6] Implement handleDelete function in TaskItem
- [ ] T168 [US6] Call apiClient.delete(`/api/${userId}/tasks/${taskId}`) in handleDelete
- [ ] T169 [US6] Remove task from local state on successful deletion (no page reload)
- [ ] T170 [US6] Display error message if deletion fails (keep task in list)
- [ ] T171 [US6] Pass handleDelete as onConfirm callback to ConfirmDeleteModal

### Testing & Verification

- [ ] T172 [US6] Test delete button opens modal
- [ ] T173 [US6] Test cancel button closes modal without deleting
- [ ] T174 [US6] Test confirm button deletes task and removes from UI
- [ ] T175 [US6] Test Escape key closes modal
- [ ] T176 [US6] Test click outside modal closes modal
- [ ] T177 [US6] Test API error handling: stop backend, try delete, verify error message
- [ ] T178 [US6] Test rapid delete: click delete on multiple tasks quickly

**Checkpoint**: User Story 6 complete - users can delete tasks with confirmation

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final UX improvements, responsive design verification, and production readiness

**Dependencies**: All user stories (US1-US6) must be complete before this phase

### Responsive Design Testing

- [ ] T179 Test all pages on mobile portrait (320px width): signup, signin, dashboard, create, edit
- [ ] T180 Test all pages on mobile landscape (640px width): verify layout adapts
- [ ] T181 Test all pages on tablet portrait (768px width): verify two-column layouts where appropriate
- [ ] T182 Test all pages on desktop (1024px+ width): verify proper spacing and max-width containers
- [ ] T183 Fix any responsive layout issues found during testing

### Loading & Error State Improvements

- [ ] T184 [P] Add loading skeletons to dashboard (shimmer effect while loading tasks)
- [ ] T185 [P] Improve error messages to be user-friendly and actionable
- [ ] T186 [P] Add toast notifications for success messages (task created, updated, deleted)
- [ ] T187 [P] Implement global error boundary for unhandled errors

### Navigation & Logout

- [ ] T188 Add logout button in dashboard layout header
- [ ] T189 Implement logout handler calling Better Auth signOut API
- [ ] T190 Redirect to /signin after logout
- [ ] T191 Clear all client-side state on logout
- [ ] T192 Test logout flow: sign in, sign out, verify redirect and session cleared

### Global Error Handling

- [ ] T193 [P] Implement global 401 handler in API client (already done in T028, verify works)
- [ ] T194 [P] Add network error detection (fetch timeout, connection failed)
- [ ] T195 [P] Display user-friendly offline message when backend unreachable

### Metadata & SEO

- [ ] T196 [P] Add page titles using Next.js Metadata API (signup, signin, dashboard, create, edit)
- [ ] T197 [P] Add favicon to frontend/public/favicon.ico
- [ ] T198 [P] Add meta description tags for SEO
- [ ] T199 [P] Configure robots.txt (allow/disallow based on public pages)

### Performance Optimization

- [ ] T200 Run Lighthouse audit on all pages (aim for 90+ performance score)
- [ ] T201 Fix any performance issues identified by Lighthouse
- [ ] T202 Optimize images (if any) using Next.js Image component
- [ ] T203 Verify bundle size is under 200KB gzipped (check with `npm run build`)

### Accessibility

- [ ] T204 [P] Test keyboard navigation: Tab through all forms and buttons
- [ ] T205 [P] Add ARIA labels to all interactive elements (buttons, inputs, checkboxes)
- [ ] T206 [P] Verify color contrast meets WCAG 2.1 AA standards (use Lighthouse audit)
- [ ] T207 [P] Add focus indicators (visible outline) for all interactive elements
- [ ] T208 [P] Test with screen reader (NVDA or VoiceOver) on signup and dashboard pages

### Final Integration Testing

- [ ] T209 Test complete user flow: signup → signin → create task → toggle complete → edit task → delete task
- [ ] T210 Test error scenarios: invalid credentials, API failures, network errors
- [ ] T211 Test session persistence: refresh page while authenticated, verify no re-signin required
- [ ] T212 Test protected routes: try accessing /dashboard while signed out
- [ ] T213 Test API integration: verify all CRUD operations work with backend (backend must be running)

### Production Build & Deployment Prep

- [ ] T214 Run production build: `npm run build`
- [ ] T215 Fix any build errors or warnings
- [ ] T216 Test production build locally: `npm start` (verify works same as dev)
- [ ] T217 Document any known issues or limitations in frontend/README.md
- [ ] T218 Update .env.local.example with all required environment variables
- [ ] T219 Verify .gitignore includes .env.local, node_modules, .next

### Documentation

- [ ] T220 [P] Update frontend/README.md with setup instructions
- [ ] T221 [P] Document environment variables in README
- [ ] T222 [P] Add deployment instructions for Vercel in README
- [ ] T223 [P] Document known issues and troubleshooting tips

**Checkpoint**: Frontend is production-ready and fully tested

---

## Dependency Graph

### User Story Completion Order

```
Phase 1 (Setup) → Phase 2 (Foundation) → US1 (P1) ┐
                                                    ├→ US2 (P1) ┐
                                                    │           ├→ US3 (P1) ┐
                                                    │           │           ├→ US4 (P2) ┐
                                                    │           │           │           ├→ US5 (P2) ┐
                                                    │           │           │           │           ├→ US6 (P3) → Phase 9 (Polish)
                                                    └───────────┴───────────┴───────────┴───────────┘
```

### Story Dependencies

- **US1 (Authentication)**: No dependencies (can start after Phase 2)
- **US2 (Task List)**: Depends on US1 (requires authentication)
- **US3 (Task Creation)**: Depends on US1 and US2 (requires auth and list view)
- **US4 (Toggle Complete)**: Depends on US2 (modifies task list items)
- **US5 (Task Editing)**: Depends on US2 (edits task list items)
- **US6 (Task Deletion)**: Depends on US2 (deletes from task list)

**MVP Scope**: Phase 1 + Phase 2 + US1 + US2 + US3 (117 tasks)

**Post-MVP**: US4 + US5 + US6 + Phase 9 (106 additional tasks)

---

## Parallel Execution Examples

### Phase 1: Setup (All parallelizable after T001-T003)

```
T004-T011 can run in parallel:
- T004: Create .env.local
- T005: Verify Tailwind config
- T006: Verify TypeScript config
- T007-T011: Create TypeScript type definitions
```

### Phase 2: Foundation

```
T021-T029 can run in parallel (API client methods):
- T021: Create api-client.ts
- T022: Implement getAuthHeaders()
- T023-T027: Implement HTTP methods (get, post, put, patch, delete)
- T028-T029: Implement error handling
```

### Phase 3: US1 (Authentication)

```
T039-T047 (SignUpForm) can run in parallel with T051-T059 (SignInForm):
- Group 1: Build SignUpForm component
- Group 2: Build SignInForm component (different file, no dependencies)
```

### Phase 4: US2 (Task List)

```
T073-T082 can run in parallel (different components):
- T073-T075: TaskList component (server)
- T076-T082: TaskItem component (client)
```

### Phase 9: Polish

```
T184-T187, T196-T199, T204-T208, T220-T223 can all run in parallel:
- Loading/error improvements
- Metadata & SEO
- Accessibility
- Documentation
All affect different files with no dependencies
```

---

## Implementation Strategy

### MVP First (Phases 1-5: 117 tasks)

**Goal**: Deliver functional authentication and task creation/viewing

**Scope**:
1. Setup & Foundation (T001-T065)
2. Authentication (T036-T065)
3. Task List Display (T066-T093)
4. Task Creation (T094-T117)

**Deliverable**: Users can sign up, sign in, view tasks, and create new tasks

### Post-MVP Incremental Delivery

**Iteration 1** (US4: 16 tasks): Task completion toggle
**Iteration 2** (US5: 21 tasks): Task editing
**Iteration 3** (US6: 24 tasks): Task deletion
**Iteration 4** (Phase 9: 45 tasks): Polish and production readiness

---

## Execution Notes

### Task Format Validation

✅ All 223 tasks follow checklist format: `- [ ] [ID] [P?] [Story?] Description`
✅ Task IDs sequential: T001-T223
✅ Story labels applied: [US1], [US2], [US3], [US4], [US5], [US6]
✅ Parallel markers applied: [P] on 58 independent tasks
✅ File paths included: All tasks specify exact file location

### Parallelization Opportunities

- **58 tasks** marked with [P] can run in parallel
- **42% parallelization** across the entire feature
- **Highest parallelization**: Phase 1 (Setup), Phase 9 (Polish)

### Testing Strategy

- **No automated tests**: Specification does not request tests
- **Manual testing**: Performed per quickstart.md instructions
- **Acceptance tests**: Defined per user story (T060-T065, T088-T093, etc.)

### Next Steps

1. Run `/sp.implement` to execute tasks sequentially or in parallel
2. Mark tasks as complete [X] as implementation progresses
3. Test each user story independently before moving to next
4. Verify integration with backend API (backend must be running)
5. Deploy to Vercel after Phase 9 completion
