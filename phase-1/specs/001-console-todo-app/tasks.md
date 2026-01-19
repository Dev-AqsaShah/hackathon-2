# Tasks: In-Memory Console Todo Application

**Input**: Design documents from `/specs/001-console-todo-app/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/

**Tests**: Not requested for Phase I - manual validation per acceptance scenarios.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project directory structure: src/, src/models/, src/services/, src/cli/
- [x] T002 Initialize UV project with pyproject.toml (Python 3.13+, no external dependencies)
- [x] T003 [P] Create src/__init__.py package marker
- [x] T004 [P] Create src/models/__init__.py package marker
- [x] T005 [P] Create src/services/__init__.py package marker
- [x] T006 [P] Create src/cli/__init__.py package marker

**Checkpoint**: Project structure ready for implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create Todo dataclass model in src/models/todo.py per data-model.md specification
- [x] T008 Create TodoService class skeleton with __init__ (empty todos list, next_id counter) in src/services/todo_service.py
- [x] T009 Create console display functions (display_menu, display_message) in src/cli/console.py per cli-interface.md
- [x] T010 Create console input functions (get_menu_choice, get_description, get_todo_id) in src/cli/console.py per cli-interface.md
- [x] T011 Create main.py entry point with main loop skeleton and KeyboardInterrupt handler in src/main.py

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Add Todo Item (Priority: P1) 🎯 MVP

**Goal**: Users can add new todo items with descriptions

**Independent Test**: Run app, select "1", enter "Buy groceries", verify confirmation message shows "Added todo #1"

### Implementation for User Story 1

- [x] T012 [US1] Implement add_todo method in src/services/todo_service.py per service-interface.md
- [x] T013 [US1] Implement add todo menu handler (option 1) in src/main.py calling service.add_todo
- [x] T014 [US1] Add input validation for empty description in add_todo flow

**Checkpoint**: User Story 1 complete - users can add todos

---

## Phase 4: User Story 2 - View All Todos (Priority: P1) 🎯 MVP

**Goal**: Users can view all todos with their ID, description, and completion status

**Independent Test**: Add 2-3 todos, select "2", verify all todos display with [ ] status indicators

### Implementation for User Story 2

- [x] T015 [US2] Implement get_all_todos method in src/services/todo_service.py per service-interface.md
- [x] T016 [US2] Implement display_todos function in src/cli/console.py showing formatted todo list
- [x] T017 [US2] Implement view todos menu handler (option 2) in src/main.py calling service and display

**Checkpoint**: User Stories 1 + 2 complete - MVP functional (add and view)

---

## Phase 5: User Story 3 - Mark Todo as Completed (Priority: P2)

**Goal**: Users can mark todos as completed to track progress

**Independent Test**: Add a todo, select "4", enter ID, verify [X] shows when viewing

### Implementation for User Story 3

- [x] T018 [US3] Implement complete_todo method in src/services/todo_service.py per service-interface.md
- [x] T019 [US3] Implement mark complete menu handler (option 4) in src/main.py calling service.complete_todo
- [x] T020 [US3] Add validation for invalid ID and already-completed scenarios

**Checkpoint**: User Story 3 complete - users can track completion

---

## Phase 6: User Story 4 - Update Todo Item (Priority: P2)

**Goal**: Users can update todo descriptions to correct or refine tasks

**Independent Test**: Add a todo, select "3", enter ID and new description, view to confirm change

### Implementation for User Story 4

- [x] T021 [US4] Implement update_todo method in src/services/todo_service.py per service-interface.md
- [x] T022 [US4] Implement update todo menu handler (option 3) in src/main.py calling service.update_todo
- [x] T023 [US4] Add validation for invalid ID and empty description scenarios

**Checkpoint**: User Story 4 complete - users can update todos

---

## Phase 7: User Story 5 - Delete Todo Item (Priority: P3)

**Goal**: Users can delete todos to clean up their list

**Independent Test**: Add a todo, select "5", enter ID, view to confirm removal

### Implementation for User Story 5

- [x] T024 [US5] Implement delete_todo method in src/services/todo_service.py per service-interface.md
- [x] T025 [US5] Implement delete todo menu handler (option 5) in src/main.py calling service.delete_todo
- [x] T026 [US5] Add validation for invalid ID scenario

**Checkpoint**: All 5 user stories complete

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and validation

- [x] T027 Implement exit menu handler (option 6) with "Goodbye!" message in src/main.py
- [x] T028 Add error handling for invalid menu choices (not 1-6) in src/main.py
- [x] T029 Verify all error messages match specification (FR-008) across all handlers
- [x] T030 Run quickstart.md validation - test complete workflow end-to-end
- [x] T031 Code review for constitution compliance (simplicity, separation of concerns)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-7)**: All depend on Foundational phase completion
  - US1 and US2 can proceed in parallel (both P1)
  - US3 and US4 can proceed in parallel after US1+US2 (both P2)
  - US5 can start after Foundational (P3)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2 - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Phase 2 - Independent of US1
- **User Story 3 (P2)**: Can start after Phase 2 - Benefits from US1+US2 for testing
- **User Story 4 (P2)**: Can start after Phase 2 - Benefits from US1+US2 for testing
- **User Story 5 (P3)**: Can start after Phase 2 - Benefits from US1+US2 for testing

### Within Each User Story

- Service method before menu handler
- Validation as final task in story

### Parallel Opportunities

- T003, T004, T005, T006 can run in parallel (package markers)
- US1 and US2 can run in parallel after Foundational
- US3 and US4 can run in parallel after MVP

---

## Parallel Execution Examples

### Phase 1 Parallel Tasks

```
# Launch all package markers together:
Task: "Create src/__init__.py package marker"
Task: "Create src/models/__init__.py package marker"
Task: "Create src/services/__init__.py package marker"
Task: "Create src/cli/__init__.py package marker"
```

### MVP Parallel Tasks (US1 + US2)

```
# After Foundational, launch US1 and US2 service methods:
Task: "Implement add_todo method in src/services/todo_service.py"
Task: "Implement get_all_todos method in src/services/todo_service.py"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 1 (Add)
4. Complete Phase 4: User Story 2 (View)
5. **STOP and VALIDATE**: Test add + view workflow
6. Demo: Can add todos and see them

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 + US2 → MVP! (add and view)
3. Add US3 → Track completion
4. Add US4 → Update descriptions
5. Add US5 → Delete todos
6. Polish → Production ready

---

## Summary

| Phase | Tasks | Stories |
|-------|-------|---------|
| Setup | T001-T006 | - |
| Foundational | T007-T011 | - |
| US1 Add | T012-T014 | P1 |
| US2 View | T015-T017 | P1 |
| US3 Complete | T018-T020 | P2 |
| US4 Update | T021-T023 | P2 |
| US5 Delete | T024-T026 | P3 |
| Polish | T027-T031 | - |

**Total Tasks**: 31
**MVP Tasks**: 17 (Setup + Foundational + US1 + US2)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently testable per spec.md acceptance scenarios
- No automated tests - manual validation per plan.md
- Commit after each task or logical group
- Stop at any checkpoint to validate independently
