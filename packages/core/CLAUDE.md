# packages/core

Rules and workflow for authoring components in `@a2ra/core`.
Root [CLAUDE.md](../../CLAUDE.md) rules also apply.

## Storybook MCP: component authoring

When `pnpm storybook` is running the `storybook` MCP server is live at `http://localhost:6006/mcp`.

**Never invent component props or story variants.** Always verify against the live docs before writing code:

1. Call `list-all-documentation` at the start of any component or story task to discover available IDs.
2. Call `get-documentation` with the ID to read actual props, variants, and usage examples.
3. Call `get-storybook-story-instructions` before creating or editing a story.
4. Call `preview-stories` after every change and include the returned URLs in your response.
5. Call `run-story-tests` after every change and fix failures before reporting success.

If the storybook server is not running, state that clearly rather than guessing.

## Adding a new component

One component at a time, in this exact order. Do not skip steps or batch multiple components.

### 1. Schema: `src/components/<name>/<name>.schema.ts`

- Define a Zod schema (e.g. `ButtonSchema`)
- Export a TypeScript type inferred from it (e.g. `export type ButtonNode = z.infer<typeof ButtonSchema>`)
- Consult `react-aria` MCP before defining props; never invent prop names

### 2. Styles: `src/components/<name>/<name>.styles.ts`

- Define all Tailwind class variants as plain functions or typed constants
- Include all base styles here (layout, transitions, disabled states, focus rings); not in the component
- No hardcoded color values; see theming rule in root CLAUDE.md

### 3. Component: `src/components/<name>/<Name>.tsx`

- Wrap the correct React Aria Components primitive (consult `react-aria` MCP first)
- Use a plain `interface ComponentProps`; do not derive from the schema type
- Use RAC prop names exactly: `onPress`, `isDisabled`, `isRequired`, `isInvalid`
- Every interactive element must be labeled (see accessibility rule in root CLAUDE.md)
- `className` calls style functions only; no inline class strings that duplicate the styles file

### 4. Barrel: `src/components/<name>/index.ts`

Export component, schema, and type:

```ts
export { Name } from "./<Name>"
export type { NameNode } from "./<name>.schema"
export { NameSchema } from "./<name>.schema"
```

### 5. Core index: `src/index.ts`

Add the three exports (component, schema, type) following the existing pattern.

### 6. Storybook story: `stories/<Name>.stories.tsx`

Call `get-storybook-story-instructions` from the Storybook MCP first. After writing the story,
call `preview-stories` and include the returned URLs in your response.

### 7. Lint

```bash
pnpm lint
```

Fix all issues before continuing. Do not proceed with failing lint.

### 8. Tests: `src/__tests__/`

Add to `schema.test.ts` and `integration.test.tsx` (or create `<name>.test.ts` for larger components).

**Schema tests: minimum coverage:**

- Valid minimal node (`{ type: "ComponentName" }`) parses successfully
- Every valid enum value is accepted
- Every invalid enum value is rejected
- Wrong `type` literal is rejected (e.g. `"button"` when schema expects `"Button"`)
- Invalid prop type is rejected (e.g. number where string is expected)

**Integration tests: minimum coverage:**

- Renders via `A2Renderer` with correct DOM output
- Key props are reflected in the DOM (label text, input type, disabled state)
- Fallback renders when type is unregistered

### 9. Run tests

```bash
pnpm test
```

All tests must pass before committing. Fix failures; do not skip or comment them out.

### 10. Commit

One commit per component.
