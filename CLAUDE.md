# a2-react-aria

A React component catalog that renders **A2UI JSON** using **React Aria Components**.
Components are distributed shadcn-style: consumers own the source via `npx @a2ra/cli add <component>`.

## Rules

### Commits

Do not add `Co-Authored-By` attribution to commit messages.

### Package / library / tool / MCP approval

**Before suggesting or using any package, library, tool, MCP server, or VS Code extension,
you MUST verify it meets one of these criteria:**

| Criteria | Threshold |
| --- | --- |
| **Official** | Maintained by the primary org/company behind the tool (e.g. Adobe for `@react-aria/mcp`, GitHub for their MCP server) |
| **Popular: npm package** | ≥ 5,000 GitHub stars AND/OR ≥ 500,000 weekly npm downloads |
| **Popular: MCP server** | ≥ 1,000 GitHub stars (MCP ecosystem is newer, lower bar applies) |
| **Popular: VS Code extension** | ≥ 500,000 installs on the VS Code Marketplace |
| **Explicitly approved** | User has reviewed and approved it in this session or it appears in the approved list below |

**If a package does not meet any threshold: stop, state the concern, and ask for approval before proceeding.**

Do not assume popularity. Check GitHub stars or npm downloads before recommending anything not already in this project.

#### Approved community packages (explicitly reviewed)

| Package | Stars / Installs | Approved reason |
| --- | --- | --- |
| `@djankies/vitest-mcp` | community MCP | Reviewed and approved: best available vitest MCP |
| `@pinkpixel/npm-helper-mcp` | community MCP | Reviewed and approved: no official npm MCP exists |

### Component theming: no hardcoded styles

All component styles must use CSS custom properties (design tokens), never hardcoded Tailwind color values.

- ✅ `text-[var(--color-danger)]`, `bg-[var(--color-primary)]`, `border-[var(--color-border)]`
- ❌ `text-red-500`, `bg-blue-600`, `border-gray-300`

Spacing and layout utilities (`flex`, `gap-2`, `px-3`, `rounded`) are allowed as structural primitives.
Color, background, border-color, and text-color must always reference a `var(--color-*)` token.
This ensures components respect consumer themes and work correctly in dark mode.

### Component code quality

**Interface:** Use a plain `interface ComponentProps`; never derive props from the schema type with
`Omit<Required<Schema>["props"], ...>`. The schema and the component props are separate concerns.

**RAC prop names:** Match React Aria's API exactly: `onPress` not `onClick`, `isDisabled` not `disabled`,
`isRequired` not `required`. Do not alias RAC prop names to DOM equivalents.

**No unused props:** Every prop declared in the interface must be used in the component body.

**No style duplication:** All base styles (layout, focus rings, disabled states, transitions) belong in the
`*.styles.ts` file. The component `className` should only call style functions; never repeat classes
that are already returned by those functions.

### Accessibility

React Aria Components handle WCAG compliance by default. Do not fight it.

**Always:**

- Use RAC's a11y props (`isDisabled`, `isRequired`, `isInvalid`), not HTML attributes, so RAC manages
  the corresponding ARIA states correctly
- Every interactive component must have a visible `<Label>` or an explicit `aria-label`; never render
  an unlabeled input or button
- Validation errors must use RAC's `<Text slot="errorMessage">` so the message is programmatically
  associated with the field (not a raw `<span>`)
- Color contrast: all `var(--color-*)` token pairs used for text on background must meet WCAG AA (4.5:1)

**Never:**

- Suppress or override `:focus-visible` styles; keyboard users depend on them
- Add `tabIndex={-1}` or `role` overrides unless you have a documented reason
- Pass raw `disabled` or `aria-disabled` HTML attributes to RAC components; use `isDisabled`

**Two axe gates; both must pass:**

1. **Vitest** (`pnpm test`): `axe-core` runs on every component render in `integration.test.tsx`.
   Color-contrast is disabled here because jsdom cannot compute CSS. All other axe rules run.

2. **Storybook** (`run-story-tests`): `@storybook/addon-a11y` runs full axe after every story
   via an `afterEach` hook. `parameters.a11y.test` is set to `'error'` in `preview.tsx`, so
   any axe violation fails the story test. Color-contrast runs here because the CSS tokens are
   defined in `.storybook/tailwind.css`. Call `run-story-tests` after every story change.

### GitHub tasks: use `gh` CLI

For all GitHub operations (PRs, issues, CI status, releases) use the `gh` CLI via Bash.
The GitHub MCP server is not configured in `.mcp.json`.

```bash
gh pr list
gh pr create --title "..." --body "..."
gh pr view <number>
gh run list
gh run view <run-id>
gh release create v1.0.0
```

### Versioning: add a changeset for user-facing changes

Any PR that adds, changes, or removes a public API, export, CLI command, or behaviour that
consumers depend on **must** include a changeset file in `.changeset/`.

```bash
pnpm changeset   # interactive: choose package(s) and bump type, write a summary
```

Bump guidance:

| Change | Bump |
| --- | --- |
| New export, new CLI command, new component | `minor` |
| Bug fix, internal refactor, docs only | `patch` |
| Breaking change (removed export, renamed prop, changed CLI contract) | `major` |

PRs that only touch CI, tests, or repo tooling (no consumer-visible change) do not need a changeset.

### Markdown

- All `.md` files must pass `markdownlint` (rules in `.markdownlint.json`)
- 120 character line limit (tables and code blocks exempt)
- Fenced code blocks must declare a language
- Consistent heading hierarchy, no skipped levels
- No em dashes (`—`). Use a colon, comma, semicolon, or rewrite as two sentences instead.

## Architecture

- `packages/core` (`@a2ra/core`): A2Renderer, registry, Zod schemas
- `packages/cli` (`@a2ra/cli`): add/update/diff components from the registry
- `packages/vscode`: VS Code extension (planned): IntelliSense, live preview, CLI integration
- `registry/`: shadcn-compatible component templates, not npm-published
- `docs/`: Starlight docs site, auto-deployed to GitHub Pages on push

## Key commands

```bash
pnpm dev              # Vite dev server
pnpm storybook        # Storybook on :6006
pnpm test             # Vitest + Playwright docs link check
pnpm lint             # Biome check
pnpm lint --fix       # Biome auto-fix
pnpm format           # Biome format
pnpm typedoc          # Generate API reference docs
```

MCP servers are pre-configured in `.mcp.json` and activate automatically.
For component authoring rules and the new-component workflow, see [packages/core/CLAUDE.md](packages/core/CLAUDE.md).
For setup and contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).
