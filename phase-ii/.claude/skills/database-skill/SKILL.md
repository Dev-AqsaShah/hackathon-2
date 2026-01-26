Skill name: Database Skill

Purpose:
Enable safe, consistent, and maintainable database design and operations,
including schema definition, table creation, and migrations.

Scope:
This skill focuses exclusively on the database layer. It governs how data
structures are designed, created, evolved, and validated over time.

Capabilities:
- Design relational database schemas
- Create database tables with proper constraints
- Define primary keys, foreign keys, and indexes
- Normalize data structures where appropriate
- Plan and execute schema migrations safely
- Manage schema evolution without data loss
- Ensure referential integrity and consistency
- Support PostgreSQL-compatible databases (e.g., Neon)

Design principles enforced:
- Schema-first design
- Explicit constraints over implicit assumptions
- Consistent naming conventions
- Minimal but sufficient normalization
- Forward- and backward-safe migrations
- Deterministic and reviewable changes

Input handling:
- Accepts entity definitions and data requirements
- Validates schema changes before application
- Rejects unsafe or destructive migrations unless explicitly approved

Constraints:
- Database layer only
- No business logic
- No UI or API concerns
- No speculative schema additions

Dependencies:
- Validation Skill (for schema and migration safety checks)
- Migration tooling as specified (e.g., Alembic, SQLModel migrations)

Output standards:
- Clear, readable table definitions
- Explicit constraints and indexes
- Well-documented migrations
- Predictable schema evolution
- Minimal, maintainable database structures

Success definition:
- Tables accurately represent required data
- Migrations apply cleanly and safely
- Schema changes are traceable and reversible
- Data integrity is consistently preserved
- Database structure supports current and future application needs
