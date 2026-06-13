# a2-react-aria

A React component catalog that renders **a2UI JSON** using **React Aria Components**.
Components are distributed shadcn-style — consumers own the source via `npx a2ui add <component>`.

## Rules

### Package / library / tool / MCP approval

**Before suggesting or using any package, library, tool, MCP server, or VS Code extension,
you MUST verify it meets one of these criteria:**

| Criteria | Threshold |
| --- | --- |
| **Official** | Maintained by the primary org/company behind the tool (e.g. Adobe for `@react-aria/mcp`, GitHub for their MCP server) |
| **Popular — npm package** | ≥ 5,000 GitHub stars AND/OR ≥ 500,000 weekly npm downloads |
| **Popular — MCP server** | ≥ 1,000 GitHub stars (MCP ecosystem is newer, lower bar applies) |
| **Popular — VS Code extension** | ≥ 500,000 installs on the VS Code Marketplace |
| **Explicitly approved** | User has reviewed and approved it in this session or it appears in the approved list below |

**If a package does not meet any threshold: stop, state the concern, and ask for approval before proceeding.**

Do not assume popularity. Check GitHub stars or npm downloads before recommending anything not already in this project.

#### Approved community packages (explicitly reviewed)

| Package | Stars / Installs | Approved reason |
| --- | --- | --- |
| `@djankies/vitest-mcp` | community MCP | Reviewed and approved — best available vitest MCP |
| `@pinkpixel/npm-helper-mcp` | community MCP | Reviewed and approved — no official npm MCP exists |

### Storybook MCP — component authoring

When `pnpm storybook` is running the `storybook` MCP server is live at `http://localhost:6006/mcp`.

**Never invent component props or story variants.** Always verify against the live docs before writing code:

1. Call `list-all-documentation` at the start of any component or story task to discover available IDs.
2. Call `get-documentation` with the ID to read actual props, variants, and usage examples.
3. Call `get-storybook-story-instructions` before creating or editing a story.
4. Call `preview-stories` after every change and include the returned URLs in your response.
5. Call `run-story-tests` after every change and fix failures before reporting success.

If the storybook server is not running, state that clearly rather than guessing.

### Component theming — no hardcoded styles

All component styles must use CSS custom properties (design tokens), never hardcoded Tailwind color values.

- ✅ `text-[var(--color-danger)]`, `bg-[var(--color-primary)]`, `border-[var(--color-border)]`
- ❌ `text-red-500`, `bg-blue-600`, `border-gray-300`

Spacing and layout utilities (`flex`, `gap-2`, `px-3`, `rounded`) are allowed as structural primitives.
Color, background, border-color, and text-color must always reference a `var(--color-*)` token.
This ensures components respect consumer themes and work correctly in dark mode.

### Component code quality

**Interface:** Use a plain `interface ComponentProps` — never derive props from the schema type with
`Omit<Required<Schema>["props"], ...>`. The schema and the component props are separate concerns.

**RAC prop names:** Match React Aria's API exactly — `onPress` not `onClick`, `isDisabled` not `disabled`,
`isRequired` not `required`. Do not alias RAC prop names to DOM equivalents.

**No unused props:** Every prop declared in the interface must be used in the component body.

**No style duplication:** All base styles (layout, focus rings, disabled states, transitions) belong in the
`*.styles.ts` file. The component `className` should only call style functions — never repeat classes
that are already returned by those functions.

### Accessibility

React Aria Components handle WCAG compliance by default — do not fight it.

**Always:**

- Use RAC's a11y props (`isDisabled`, `isRequired`, `isInvalid`) — not HTML attributes — so RAC manages
  the corresponding ARIA states correctly
- Every interactive component must have a visible `<Label>` or an explicit `aria-label` — never render
  an unlabeled input or button
- Validation errors must use RAC's `<Text slot="errorMessage">` so the message is programmatically
  associated with the field (not a raw `<span>`)
- Color contrast: all `var(--color-*)` token pairs used for text on background must meet WCAG AA (4.5:1)

**Never:**

- Suppress or override `:focus-visible` styles — keyboard users depend on them
- Add `tabIndex={-1}` or `role` overrides unless you have a documented reason
- Pass raw `disabled` or `aria-disabled` HTML attributes to RAC components — use `isDisabled`

**Two axe gates — both must pass:**

1. **Vitest** (`pnpm test`) — `axe-core` runs on every component render in `integration.test.tsx`.
   Color-contrast is disabled here because jsdom cannot compute CSS. All other axe rules run.

2. **Storybook** (`run-story-tests`) — `@storybook/addon-a11y` runs full axe after every story
   via an `afterEach` hook. `parameters.a11y.test` is set to `'error'` in `preview.tsx`, so
   any axe violation fails the story test. Color-contrast runs here because the CSS tokens are
   defined in `.storybook/tailwind.css`. Call `run-story-tests` after every story change.

### GitHub tasks — use `gh` CLI

For all GitHub operations (PRs, issues, CI status, releases) use the `gh` CLI via Bash.
Do not use the GitHub MCP server — it has been removed from `.mcp.json`.

```bash
gh pr list
gh pr create --title "..." --body "..."
gh pr view <number>
gh run list
gh run view <run-id>
gh release create v1.0.0
```

### Markdown

- All `.md` files must pass `markdownlint` (rules in `.markdownlint.json`)
- 120 character line limit (tables and code blocks exempt)
- Fenced code blocks must declare a language
- Consistent heading hierarchy — no skipped levels

## Architecture

- `packages/core` — `@a2ui/core`: A2Renderer, registry, Zod schemas
- `packages/cli` — `a2ui` CLI: add/update/diff components from the registry
- `packages/vscode` — VS Code extension: IntelliSense, live preview, CLI integration
- `registry/` — shadcn-compatible component templates (not npm-published)
- `docs/` — Starlight docs site (auto-deployed to GitHub Pages on push)

## First-time setup (after cloning)

> **Shortcut:** run `/setup` in Claude Code to automate all steps below.

### 1. Install dependencies

```bash
pnpm install
pnpm run build
```

### 2. Install the Biome Claude Code plugin (once per machine)

```bash
/plugin install biome@kingstinct-skills
```

### 3. MCP servers — automatic

`.mcp.json` is committed to the repo. Claude Code reads it automatically when you open this project.
On first use each server shows a **⏸ Pending approval** prompt — approve each one once.

The `react-aria`, `copilotkit`, `vitest`, and `npm-registry` servers start immediately (no local service needed).
The `storybook` server only works when `pnpm storybook` is running.

### 4. VS Code extensions — semi-automatic

Open the project in VS Code. You will see a prompt:
**"Do you want to install the recommended extensions?"** → click **Install All**.

This installs: Biome, Tailwind IntelliSense, Vitest, axe linter, Error Lens, Pretty TS Errors, GitLens, Import Cost, markdownlint.

## Key commands

```bash
pnpm dev              # Vite dev server
pnpm storybook        # Storybook on :6006
pnpm test             # Vitest
pnpm lint             # Biome check
pnpm format           # Biome format
pnpm typedoc          # Generate API reference docs
```

## MCP servers

MCP servers are pre-configured in `.mcp.json` and activate automatically when you open this project in Claude Code.

| Server | Status | What it gives Claude |
| --- | --- | --- |
| `react-aria` | Official (Adobe) | Full RAC docs — use before writing any component wrapper |
| `copilotkit` | Official (CopilotKit) | AG-UI / CopilotKit API signatures and integration patterns |
| `storybook` | Official (Storybook team) | Story listing, screenshots, component docs — needs `pnpm storybook` running first |
| `vitest` | Community (approved) | AI-safe test runner, structured output, coverage analysis |
| `npm-registry` | Community (approved) | Package search, version checks, vulnerability audits |

## Claude Code plugins

No plugins required for this project.

Biome runs via `pnpm lint` / `pnpm format` — Claude Code calls these directly.
The Biome VS Code extension (`biomejs.biome`) handles editor-side feedback.
No third-party plugin marketplace is needed.

## Environment variables

Copy `.env.example` to `.env.local` for local secrets.
Never commit tokens — `.env.local` is gitignored.

## Linting and formatting

Biome handles all linting, formatting, and import sorting. One config file: `biome.json`.
Format on save is pre-configured in `.vscode/settings.json`.

Run manually:

```bash
pnpm lint          # Check only
pnpm lint --fix    # Fix auto-fixable issues
pnpm format        # Format all files
```

## Component backlog

Implement in roughly this order — simpler form controls first, complex overlays and layout last.

| # | Component | Status |
| --- | --- | --- |
| 1 | Button | ✅ Done |
| 2 | TextField | ✅ Done |
| 3 | Checkbox / CheckboxGroup | ✅ Done |
| 4 | RadioGroup | ✅ Done |
| 5 | Switch | ✅ Done |
| 6 | Select / ComboBox | ✅ Done |
| 7 | Form (layout container) | ✅ Done |
| 8 | Dialog / Modal | ⬜ Todo |
| 9 | Tooltip / Popover | ⬜ Todo |
| 10 | Menu / MenuTrigger | ⬜ Todo |
| 11 | Tabs | ⬜ Todo |
| 12 | Breadcrumb | ⬜ Todo |
| 13 | DatePicker / DateRangePicker | ⬜ Todo |
| 14 | Table | ⬜ Todo |
| 15 | Grid / Flex layout nodes | ⬜ Todo |

Update the status column to ✅ Done when a component passes all 10 workflow steps.

## Adding a new component

One component at a time, in this exact order. Do not skip steps or batch multiple components.

### 1. Schema — `packages/core/src/components/<name>/<name>.schema.ts`

- Define a Zod schema (e.g. `ButtonSchema`)
- Export a TypeScript type inferred from it (e.g. `export type ButtonNode = z.infer<typeof ButtonSchema>`)
- Consult `react-aria` MCP before defining props — never invent prop names

### 2. Styles — `packages/core/src/components/<name>/<name>.styles.ts`

- Define all Tailwind class variants as plain functions or typed constants
- Include all base styles here (layout, transitions, disabled states, focus rings) — not in the component
- No hardcoded color values — see theming rule above

### 3. Component — `packages/core/src/components/<name>/<Name>.tsx`

- Wrap the correct React Aria Components primitive (consult `react-aria` MCP first)
- Use a plain `interface ComponentProps` — do not derive from the schema type
- Use RAC prop names exactly: `onPress`, `isDisabled`, `isRequired`, `isInvalid`
- Every interactive element must be labeled (see accessibility rule above)
- `className` calls style functions only — no inline class strings that duplicate the styles file

### 4. Barrel — `packages/core/src/components/<name>/index.ts`

Export component, schema, and type:

```ts
export { Name } from "./<Name>"
export type { NameNode } from "./<name>.schema"
export { NameSchema } from "./<name>.schema"
```

### 5. Core index — `packages/core/src/index.ts`

Add the three exports (component, schema, type) following the existing pattern.

### 6. Storybook story — `stories/<Name>.stories.tsx`

Call `get-storybook-story-instructions` from the Storybook MCP first. After writing the story,
call `preview-stories` and include the returned URLs in your response.

### 7. Lint

```bash
pnpm lint
```

Fix all issues before continuing. Do not proceed with failing lint.

### 8. Tests — `packages/core/src/__tests__/`

Add to `schema.test.ts` and `integration.test.tsx` (or create `<name>.test.ts` for larger components).

**Schema tests — minimum coverage:**

- Valid minimal node (`{ type: "ComponentName" }`) parses successfully
- Every valid enum value is accepted
- Every invalid enum value is rejected
- Wrong `type` literal is rejected (e.g. `"button"` when schema expects `"Button"`)
- Invalid prop type is rejected (e.g. number where string is expected)

**Integration tests — minimum coverage:**

- Renders via `A2Renderer` with correct DOM output
- Key props are reflected in the DOM (label text, input type, disabled state)
- Fallback renders when type is unregistered

### 9. Run tests

```bash
pnpm test
```

All tests must pass before committing. Fix failures — do not skip or comment them out.

### 10. Commit

One commit per component.
