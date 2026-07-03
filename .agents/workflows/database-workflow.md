# Database Change Workflow

When adding, modifying, or removing database tables or columns, follow this strict procedure:

1. **Architect** (`/architect`):
   - Design the schema changes.
   - Update `.agents/context/database-schema.md` to reflect the new truth.
   - Present the changes to the user for approval.

2. **Develop (Migration)**:
   - Generate or write the migration script using our chosen ORM.
   - Ensure you are not dropping columns destructively without a fallback or backup plan.
   - Add necessary indexes for fields that will be queried often.

3. **Develop (Application)**:
   - Update the application code (repositories, controllers, actions) to use the new schema safely.
   - Ensure proper TypeScript types are exported and used.

4. **Review & Imprint** (`/review`, `/remember` save):
   - Verify the code changes align with the architecture.
   - Verify `database-schema.md` is fully up-to-date and represents the current migration state.
