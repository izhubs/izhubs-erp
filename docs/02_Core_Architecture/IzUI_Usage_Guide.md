# IzUI Component Library: Usage & Best Practices Guide

IzUI (IzHubs UI) is the proprietary component library for the IzHubs ERP system. It is built natively on top of Radix UI Primitives and styled exclusively with SCSS Modules (`.module.scss`). You **MUST NOT** use Tailwind CSS for the core library components to avoid class-name pollution and guarantee style encapsulation.

This guide defines the unbreakable rules for utilizing, maintaining, and expanding IzUI.

---

## 1. Architectural Principles

### 1.1 Strict Encapsulation (SCSS Modules Only)
- Every component must pair with its own `.module.scss` file. (e.g., `IzButton.tsx` + `IzButton.module.scss`).
- **Do not** use Tailwind arbitrary values or utility classes inside the Component's TSX unless it's for absolute layout edge-cases within complex forms.
- Use `clsx` or `classNames` library to merge the `styles.root` class with any incoming `className` from props.

### 1.2 Radix UI as the Accessible Foundation
- Over 80% of interactive components (Dialog, DropdownMenu, Tabs, Accordion, Tooltip, Popover) are built on top of `@radix-ui/react-*` packages.
- Never build complex accessibility logic (focus traps, keyboard navigation, aria-attributes) from scratch. Always utilize the Radix primitives.
- Use `React.forwardRef` to pass standard HTML attributes and refs down to the Radix components to maintain polymorphic behavior.

### 1.3 Compound Components Pattern
- For complex elements (e.g., Table, Dropdown, Menu, Dialog), always export them as compound components.
Example:
```tsx
import { IzDropdownMenu, IzDropdownItem, IzDropdownTrigger } from '@/components/ui/IzDropdownMenu';
```

---

## 2. Forms and Data Input Rules

### 2.1 The Zod + React Hook Form Integration
All inputs used inside a form context MUST be wrapped with the `IzForm` and `IzForm[Component]` wrappers.
- `IzInput` = Standalone Input (for search bars, simple filters).
- `IzFormInput` = Form-connected Input (automatically binds to standard `Control` from RHF and parses `Zod` error messages).

### 2.2 Semantic HTML Elements
- Always use semantic tags (`<button type="button">`, `<form>`, `<ul>`, `<li>`).
- Avoid `appearance: none` bugs by properly scoping your SCSS resets (especially on Checkboxes and Radio buttons). IzUI implements custom CSS pseudo-elements (`::before`/`::after`) to draw custom ticks and dots.

---

## 3. Data Visualization (Recharts)

For dashboards and CRM pipelines:
- Utilize the `IzLineChart`, `IzBarChart`, and `IzPieChart` wrappers. 
- These components are built on `recharts` and automatically ingest theme colors from CSS variables (`--color-primary`, `--color-destructive`, etc.).
- Never hardcode HEX colors in chart implementation unless passed specifically through the `dataKeys` prop.

---

## 4. Maintenance Checklist for New Components

If you need to add a brand new Phase 14 component, follow this exact checklist:
1. **Analyze:** Does Radix UI have a primitive for this? If yes, `npm i @radix-ui/react-xyz`.
2. **Implement TSX:** Build `IzXyz.tsx`, wrap `React.forwardRef`, export standard sub-components.
3. **Style:** Create `IzXyz.module.scss`. Map the state using Radix data-attributes (e.g., `&[data-state="open"] { ... }`).
4. **Export:** Add the component to `/demo/iz-ui` to visually prove it works across Light/Dark modes.
5. **Update Roadmap:** Tick it off the `iz_ui_roadmap.md` checklist.

---

## 5. Feature Components & "Dumb" Layouts (e.g. IzKanbanBoard)

Some UI concepts (like Kanban Boards, App Shells, Rich Text Editors) are too complex to be simple primitives. We categorize them as **Feature/Presentational Components**.

**Example - `IzKanbanBoard` usage:**
We have provided the purely CSS-driven structure for a Kanban Board (`IzKanbanBoard`, `IzKanbanColumn`, `IzKanbanCard`) in `components/ui/IzKanbanBoard.tsx`. 

- **Pure Presentational Layer**: These components handle horizontal/vertical scrolling, drag styling (grabbable cursor, hover states), and borders without carrying heavy JavaScript dependencies.
- **Future Integration (`@dnd-kit`)**: When building the actual CRM Pipeline or Task Manager, you will wrap the existing `<IzKanbanColumn>` and `<IzKanbanCard>` elements with `@dnd-kit/core` hooks (`useDraggable`, `useDroppable`, `SortableContext`).
- **Separation of Concerns**: Never put specific API fetches or complex domain logic into the `components/ui/` folder. The UI folder only provides the generic "Skeleton / HTML shell". Pass data via props (`title`, `description`, `footerLeft`) from your main module pages.
