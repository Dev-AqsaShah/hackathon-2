# Research: In-Memory Console Todo Application

**Feature**: 001-console-todo-app
**Date**: 2026-01-18
**Phase**: 0 - Research & Discovery

## Overview

This document captures technical decisions and research findings for the Phase I Todo application. Since the technical context is well-defined (Python, standard library only, in-memory), research focuses on best practices for the chosen approach.

## Technical Decisions

### 1. Data Structure for Todo Storage

**Decision**: Use a Python `list` with a separate `int` counter for ID generation.

**Rationale**:
- Lists preserve insertion order (matches sequential ID display)
- O(n) lookup by ID is acceptable for small in-memory collections
- Simpler than dictionary for this scale
- Counter ensures IDs are never reused within a session

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| Dictionary (ID → Todo) | Over-engineering for Phase I; list iteration is sufficient |
| SQLite in-memory | Violates "no database" constraint |
| Named tuples | Less readable than dataclass; no default values |

### 2. Todo Model Implementation

**Decision**: Use `@dataclass` from standard library.

**Rationale**:
- Built-in to Python 3.7+
- Automatic `__init__`, `__repr__`, `__eq__`
- Supports default values (`completed=False`)
- Type hints for clarity
- No external dependencies

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| Plain dict | No type safety, less readable |
| Custom class | More boilerplate than dataclass |
| Pydantic | External dependency, over-engineering |
| NamedTuple | Immutable, harder to update status |

### 3. Console Menu Pattern

**Decision**: Numbered menu with input loop returning to menu after each operation.

**Rationale**:
- Matches FR-007 (numbered menu requirement)
- Simple to implement with `input()` and `match` statement
- Clear user flow per spec assumptions

**Menu Structure**:
```
=== Todo Application ===
1. Add todo
2. View all todos
3. Update todo
4. Mark todo complete
5. Delete todo
6. Exit
```

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| Command-line arguments | Less interactive, not per spec |
| Rich TUI library | External dependency |
| Single-letter commands | Less clear than numbered menu |

### 4. Input Validation Approach

**Decision**: Validate at Console Interface layer, return to menu on invalid input.

**Rationale**:
- Separation of concerns: CLI handles user input validation
- Service layer assumes valid inputs (defensive but not paranoid)
- Immediate feedback to user per FR-008

**Validation Rules**:
| Input | Validation |
|-------|------------|
| Menu choice | Must be 1-6 |
| Todo description | Must not be empty or whitespace-only |
| Todo ID | Must be positive integer, must exist in store |

### 5. Error Handling Strategy

**Decision**: Return error messages as strings; CLI displays them. No exceptions for expected errors.

**Rationale**:
- Simpler than exception hierarchy for this scope
- Service methods return `(success: bool, message: str)` or `Optional[Todo]`
- Matches constitution principle VI (explicit error handling)

**Error Categories**:
| Category | Example | Handling |
|----------|---------|----------|
| Invalid input | Empty description | CLI shows error, prompts again |
| Not found | Invalid ID | Service returns None, CLI shows error |
| Already done | Mark completed todo | Service returns message, CLI displays |

### 6. Application Entry Point

**Decision**: `main.py` as entry point with `if __name__ == "__main__"` guard.

**Rationale**:
- Standard Python convention
- Enables future importability
- Compatible with `python -m` invocation

**Invocation**:
```bash
uv run python src/main.py
```

## Extensibility Considerations (Phase II Preparation)

The following design choices enable future phases without requiring restructuring:

| Future Need | Current Design Support |
|-------------|------------------------|
| Database persistence | Service layer can accept storage adapter |
| Web API | Service layer is UI-agnostic |
| Different UI | CLI is separate from business logic |
| Authentication | Controller can add auth middleware |

**Note**: These are considerations only. No code is written for Phase II requirements.

## Unresolved Items

None. All technical context is clear from the specification and constitution constraints.

## References

- Python dataclasses: https://docs.python.org/3/library/dataclasses.html
- Python match statement: https://docs.python.org/3/tutorial/controlflow.html#match-statements
- UV package manager: https://github.com/astral-sh/uv
