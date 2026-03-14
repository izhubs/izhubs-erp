---
name: add-entity
description: How to safely add a new core entity to izhubs ERP.
---

# Add a New Core Entity

## When to use this
When you need a new first-class object in the system (e.g., `Project`, `Property`, `Ticket`).
If you just need extra fields on an existing entity, use `add-custom-field` instead.

## Steps

### 1. Define the schema (core/schema/entities.ts)
```typescript
export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['active', 'completed', 'archived']),
  ownerId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Project = z.infer<typeof ProjectSchema>;
```

### 2. Add events (core/schema/events.ts)
```typescript
'project.created': { project: Project }
'project.updated': { project: Project, changes: Partial<Project> }
'project.deleted': { projectId: string }
```

### 3. Create DB migration (database/migrations/00X_add_projects.sql)
```sql
CREATE TABLE IF NOT EXISTS projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  status      VARCHAR(50)  NOT NULL DEFAULT 'active',
  owner_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  custom_fields JSONB DEFAULT '{}',
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_projects_owner ON projects(owner_id);
```

### 4. Add to entity engine (core/engine/entity-engine.ts)
Add CRUD functions: `createProject`, `getProject`, `updateProject`, `deleteProject`.
Always emit events after mutations.

### 5. Add API route (core/api/v1/projects.ts)
Follow existing patterns in `contacts.ts` or `deals.ts`.

### 6. Write contract test (tests/contracts/project-api.contract.test.ts)
```typescript
test('Project API v1 — required fields always present', () => {
  const project = createProjectFixture();
  expect(project).toHaveProperty('id');
  expect(project).toHaveProperty('name');
  expect(project).toHaveProperty('createdAt');
});
```

### 7. Export from index (core/schema/index.ts)
```typescript
export { ProjectSchema, type Project } from './entities';
```

## Checklist
- [ ] Schema defined with Zod
- [ ] Events defined  
- [ ] Migration created with sequential number
- [ ] Entity engine functions added
- [ ] API route created
- [ ] Contract test written
- [ ] Exported from core/schema/index.ts
