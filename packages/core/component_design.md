# Component Design Rules

Canonical design decisions for a2ui component schemas and component interfaces.
These rules apply to every current and future component in `@a2ra/core`.

The root [CLAUDE.md](../../CLAUDE.md) and [CLAUDE.md](CLAUDE.md) also apply.
When in doubt, prefer the most specific document.

## Schema: props must be strict

Every `props` object schema must call `.strict()` so that unknown props throw a validation
error instead of being silently stripped. The same applies to any nested object within props.

```ts
// Correct
props: z.object({
  label: z.string().optional(),
  isDisabled: z.boolean().optional(),
}).strict().optional()

// Wrong — silently drops unknown keys
props: z.object({
  label: z.string().optional(),
}).optional()
```

Item sub-schemas used inside props arrays must also be strict:

```ts
// Correct
const SelectItemSchema = z.object({
  label: z.string(),
  value: z.string(),
  isDisabled: z.boolean().optional(),
}).strict()
```

## Schema: children must be typed by component role

`z.unknown()` is never acceptable as a children item type. Choose the type that matches
what the component actually renders:

### Plain-text children: `z.string()`

Use when the component body is always plain text. No embedded node trees.

```ts
// Button, Text, Alert, Tag
children: z.string().optional()
```

Rationale: a button label, alert message, or text node is never a tree of other components.
Allowing arrays here would accept structurally invalid JSON.

### Single child type: `z.array(SpecificSchema)`

Use when only one specific component type is valid as a direct child.

```ts
// RadioGroup only holds Radio nodes
children: z.array(RadioSchema).optional()

// CheckboxGroup only holds Checkbox nodes
children: z.array(CheckboxSchema).optional()

// Accordion only holds AccordionItem nodes
children: z.array(AccordionItemSchema).optional()

// TagGroup only holds Tag nodes
children: z.array(TagSchema).optional()
```

### Open containers: `z.array(A2NodeSchema)`

Use only when the component is a genuine layout or overlay shell that can embed any
registered component. `A2NodeSchema` validates the node envelope (type string, optional
props record, optional children) without enumerating every possible component type.

```ts
import { A2NodeSchema } from "../../schema"

// Card, Dialog, Flex, Form, Grid, Popover, Tabs, AccordionItem
children: z.array(A2NodeSchema).optional()
```

Valid open containers in the current registry:

| Component | Reason |
| --- | --- |
| `Card` | Layout shell that wraps any combination of content components |
| `Dialog` | Overlay that holds text, action buttons, and optional forms |
| `Flex` | Pure layout primitive; child types are unrestricted by design |
| `Form` | Holds field components, labels, and submit actions |
| `Grid` | Pure layout primitive; child types are unrestricted by design |
| `Popover` | Overlay shell; may hold menus, text, or action panels |
| `Tabs` | Tab panel content areas; each panel holds arbitrary content |
| `AccordionItem` | Panel body; may hold text, forms, or lists of components |

**Before using `A2NodeSchema`:** confirm the component is genuinely an open container.
A component is open when its purpose is to arrange or reveal other components, not when
it merely happens to render some nested elements internally.

## Schema: leaf label text belongs in `props.label`, not `children`

Leaf components such as `Radio` and `Checkbox` display a text label. That label must be
passed via `props.label`, not as node `children`.

```json
// Correct
{ "type": "Radio", "props": { "value": "Full-time", "label": "Full-time" } }

// Wrong — children on a leaf node is ambiguous with container-node patterns
{ "type": "Radio", "props": { "value": "Full-time" }, "children": "Full-time" }
```

Rationale: `A2Renderer` unconditionally passes resolved `children` to every component.
Using `props.label` keeps the schema contract explicit in `RadioSchema`/`CheckboxSchema`
and avoids conflating string-body leaves with open-container nodes.

## Testing: every new function must have tests

Any new function, hook, or renderer behaviour added to `@a2ra/core` must be covered by tests
before the PR is merged. This includes schema changes, renderer logic, and utility functions.

Minimum coverage for renderer or logic changes:

- Happy path: valid input produces the expected output
- Rejection path: invalid input triggers the expected error or fallback
- No-op path: absent optional feature does not affect other behaviour

Tests live in `packages/core/src/__tests__/`. Add to an existing file when the scope is narrow;
create a new `<feature>.test.ts(x)` file when the feature warrants its own describe block.

## Package changes: run SonarQube scan before opening a PR

Any change to `packages/core` or `packages/cli` must be scanned with SonarQube before the
PR is opened. Fix all new issues before requesting review.

## Accessibility

React Aria Components handle WCAG compliance by default. Work with it, not around it.

### Props

Always use RAC's a11y props so RAC manages the corresponding ARIA states correctly:

```ts
// Correct
isDisabled, isRequired, isInvalid, isReadOnly

// Wrong — bypasses RAC's ARIA management
disabled, required, aria-disabled
```

### Labels

Every interactive component must be labelled. No unlabelled inputs or buttons.

```tsx
// Correct — visible label
<Label>{label}</Label>

// Correct — screen-reader-only label
<Button aria-label={ariaLabel} />

// Wrong — no label at all
<TextField />
```

### Validation errors

Validation error messages must use RAC's `<Text slot="errorMessage">` so the message is
programmatically associated with the field. Never use a raw `<span>` or `<p>`.

```tsx
// Correct
<Text slot="errorMessage">{errorMessage}</Text>

// Wrong
<span className="error">{errorMessage}</span>
```

### Focus

Never suppress `:focus-visible` styles. Keyboard users depend on them. Do not add
`tabIndex={-1}` or `role` overrides without a documented reason.

### Two axe gates: both must pass before merging

1. **Vitest** (`pnpm test`): `axe-core` runs on every component render in `integration.test.tsx`.
   Color contrast is disabled here because jsdom cannot compute CSS. All other axe rules run.

2. **Storybook** (`run-story-tests`): `@storybook/addon-a11y` runs full axe after every story.
   `parameters.a11y.test` is set to `'error'` in `preview.tsx`, so any axe violation fails the
   story test. Color contrast runs here because CSS tokens are defined in `.storybook/tailwind.css`.
   Run story tests after every component or story change.

## Component interface

- Use a plain `interface ComponentProps`. Never derive props from the schema type with
  `Omit<Required<Schema>["props"], ...>`. The schema and the component props are separate
  concerns.
- Every prop declared in the interface must be used in the component body. No dead props.
- Match React Aria's API exactly: `onPress` not `onClick`, `isDisabled` not `disabled`,
  `isRequired` not `required`.
- All base styles belong in the `*.styles.ts` file. The component `className` only calls
  style functions; it never repeats classes already returned by those functions.
