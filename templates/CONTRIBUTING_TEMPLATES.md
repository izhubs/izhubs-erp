# Contributing Industry Templates

> Help businesses worldwide start faster by contributing a pre-configured template for your industry.

---

## What is a template?

A template is a **pre-configured starting point** for a specific business type. It defines:
- **Pipeline stages** — the deal flow for that industry
- **Custom fields** — extra data points that industry needs
- **Automations** — common recurring tasks, pre-built
- **Suggested modules** — which ERP modules are most relevant

Templates are applied once at setup. The business can always customize further after.

---

## How to contribute

### 1. Copy the example template

```bash
cp templates/industry/agency.ts templates/industry/YOUR_INDUSTRY.ts
```

### 2. Fill in your template

```typescript
import type { IndustryTemplate } from '../engine/template.schema';

const myTemplate: IndustryTemplate = {
  id: 'your-industry',           // unique slug, kebab-case
  name: 'Your Industry Name',
  description: 'One sentence: who this is for and what it helps with.',
  icon: '🏷️',                   // relevant emoji
  category: 'services',          // see categories below
  tags: ['tag1', 'tag2'],

  pipelineStages: [
    { key: 'stage_1', label: 'Stage Name', color: '#60a5fa' },
    // ... 4-8 stages recommended
  ],

  customFields: [
    {
      entity: 'deal',            // contact | company | deal | activity
      key: 'field_key',          // lowercase_with_underscores
      label: 'Field Label',
      type: 'text',              // text | number | date | boolean | select | multiselect | url | email | phone
      options: ['A', 'B'],       // only for select/multiselect
    },
  ],

  automations: [
    {
      name: 'Human readable name',
      trigger: 'deal.stage_changed',
      condition: "toStage == 'your_stage'",
      action: 'create_activity',
      actionConfig: { type: 'task', subject: 'Task subject', daysFromNow: 1 },
    },
  ],

  suggestedModules: ['crm', 'contracts', 'invoices', 'reports'],
  demoData: false,
  version: '1.0.0',
  author: 'your-github-username',
};

export default myTemplate;
```

### 3. Register it

In `templates/index.ts`, add your import and include it in `TEMPLATES`:

```typescript
import myTemplate from './industry/your-industry';

export const TEMPLATES: IndustryTemplate[] = [
  // existing templates...
  myTemplate,  // add here
];
```

### 4. Submit a PR

```bash
git checkout -b template/your-industry
git add templates/industry/your-industry.ts templates/index.ts
git commit -m "feat(templates): add [Your Industry] template"
git push origin template/your-industry
```

Open a Pull Request on GitHub with:
- Title: `feat(templates): add [Industry Name] template`
- Description: Who this template is for and what makes it useful

---

## Categories

| Category | Examples |
|----------|---------|
| `hospitality` | Restaurant, Hotel, Cafe, Event venue |
| `retail` | E-commerce, Physical store, Dropshipping |
| `services` | Agency, Freelancer, Consulting, Law firm |
| `technology` | SaaS, Dev shop, IT services |
| `real_estate` | Property sales, Coworking, Property rental |
| `other` | Anything that doesn't fit above |

---

## Template quality checklist

Before submitting, make sure your template:

- [ ] Has 4–8 pipeline stages (not too few, not too many)
- [ ] Custom field keys are `lowercase_with_underscores`
- [ ] Has at least 1 automation that saves real time
- [ ] Description clearly states who it's for
- [ ] `author` field is your GitHub username
- [ ] Passes TypeScript check: `npx tsc --noEmit`

---

## Need inspiration?

Look at existing templates in `templates/industry/` — especially `agency.ts` as the reference implementation.

Questions? Open a GitHub Discussion or ping `@izhubs` on the repo.
