# @a2ra/core

## 1.0.0-preview.6

### Major Changes

- 2f9d443: `createRegistry` is now strict by default and takes an options object.

  - Every registry entry must provide a Zod-style schema (`safeParse`) unless you
    opt out with `{ strict: false }` for trusted, hand-written node trees.
  - The positional `jsonSchema` second argument is replaced by the `jsonSchema`
    option: `createRegistry(entries, { jsonSchema })`.
  - `createStrictRegistry` and `StrictRegistryEntryInput` are removed; use
    `createRegistry` (strict is the default). `CreateRegistryOptions` and
    `RegistryEntryInput` are now exported.

  Migration:

  ```ts
  // before
  createRegistry(entries, jsonSchema);
  createStrictRegistry(entries);

  // after
  createRegistry(entries, { jsonSchema });
  createRegistry(entries); // strict by default
  createRegistry(entries, { strict: false }); // trusted content only
  ```

### Minor Changes

- 2f9d443: Form-state support for multi-value fields and field descriptions below labels.

  - `FormStateContext.setValue` now accepts `string | string[]` so multi-select
    components can report array values.
  - `CheckboxGroup` now reports its selected values to `FormStateContext`
    (keyed by `name`, falling back to `label`) and seeds `defaultValue` on mount,
    matching the existing behaviour of `TextField`, `Select`, and `RadioGroup`.
  - `A2Renderer` action payloads join array values with `", "` and omit empty arrays.
  - Field descriptions (`<Text slot="description">`) in `TextField`, `Select`,
    `RadioGroup`, and `CheckboxGroup` now render between the label and the control
    instead of after it.
  - Required indicators (`*`) are now `aria-hidden` in all field components.

### Patch Changes

- 2f9d443: Breadcrumb no longer passes an empty `href` to links for items without an `href`
  (such as the current page). react-aria treats a present-but-undefined `href` as `""`,
  which triggered a React warning and rendered an anchor with an empty href.

## 1.0.0-preview.5

### Minor Changes

- 2519b78: Pin the default component registry to an immutable commit and add strict schema-backed registries for untrusted A2UI.

## 1.0.0-preview.4

### Major Changes

- fa435ab: Rename all component design tokens to a single, consistent kebab-case convention (shadcn style)
  and remove hardcoded colors.

  **Breaking:** the camelCase `--color-*` tokens have been renamed and the old names removed. Update
  your theme and any owned component copies:

  - `--color-primaryHover` to `--color-primary-hover`
  - `--color-primaryActive` to `--color-primary-active`
  - `--color-primaryForeground` to `--color-primary-foreground`
  - `--color-secondaryHover` to `--color-secondary-hover`
  - `--color-secondaryActive` to `--color-secondary-active`
  - `--color-dangerHover` to `--color-danger-hover`
  - `--color-dangerActive` to `--color-danger-active`
  - `--color-ghostHover` to `--color-ghost-hover`
  - `--color-ghostActive` to `--color-ghost-active`
  - `--color-backgroundMuted` to `--color-background-muted`
  - `--color-textMuted` to `--color-text-muted`
  - `--color-textOnPrimary` to `--color-text-on-primary`

  Alongside the rename, Button, Checkbox, DatePicker, Dialog, and Switch no longer use hardcoded
  `text-white`, `bg-white`, or `bg-black/50`; they reference `--color-primary-foreground`,
  `--color-secondary-foreground`, `--color-danger-foreground`, and `--color-overlay`, so they respect
  consumer themes and dark mode. The registry ships component source, not a theme, so consumers must
  define these tokens; the in-repo Storybook, demo, docs, and dev-survey themes have all been updated.

### Minor Changes

- 382ceb3: Fix code-review findings across the renderer, registry, and CLI:

  - **Security:** `A2Renderer` now recursively sanitizes nested URL props, so blocked schemes
    (`javascript:`, `data:`, `vbscript:`) hidden inside structured data such as `Breadcrumb`
    `items[].href` can no longer bypass the filter.
  - **Security (CLI):** `a2ra add` rejects registry file paths that escape the components
    directory (path traversal / zip-slip) before writing.
  - **Components:** `Accordion`, `AccordionItem`, `Alert`, `Tag`, and `TagGroup` are now
    registered in `defaultRegistry` and the generated a2UI schema (23 → 28 node types), so they
    render out of the box.
  - **Accessibility:** the `Dialog` description is associated via `slot="description"` for correct
    `aria-describedby` wiring.
  - **Correctness:** `Button` warns when an action-mode press resolves to no action, and
    `extractA2ui` returns `a2uiJson: null` for well-formed but non-array JSON.

### Patch Changes

- 9743261: Fix a URL sanitizer bypass where a blocked scheme (`javascript:`, `data:`, `vbscript:`) could
  evade detection by embedding an ASCII tab, newline, or carriage return inside the scheme name
  (e.g. `jav\tascript:alert(1)`). Browsers strip these characters from anywhere in a URL before
  parsing the scheme, so the previous `.trim()`-only check missed them. The sanitizer now mirrors
  the WHATWG URL parser's normalization: it strips ASCII tab/newline/CR from anywhere in the string
  in addition to trimming leading/trailing C0 controls and spaces, before testing against the
  blocked-scheme list.

## 1.0.0-preview.3

### Minor Changes

- e313ade: Add registry schema export for backend validation.

  `@a2ra/core` now exports `buildRegistrySchema(registry)` and `toJsonSchema(registry)` to generate
  a JSON Schema covering every component type in a registry (including custom components). The
  `ComponentEntry` interface gains an optional `schema` field; all built-in entries in
  `defaultRegistry` are pre-populated with their Zod schemas.

  `@a2ra/cli` gains an `a2ra schema` command that fetches and prints the pre-built
  `registry/a2ui-schema.json` for the configured registry. Use `--out <file>` to write to disk.
  `pnpm build:registry` now also regenerates `registry/a2ui-schema.json` via a new
  `pnpm build:schema` script in `@a2ra/core`.

## 1.0.0-preview.2

### Major Changes

- 4f95775: Remove `withFormState` and `withAction` HOCs from the public API.

  Form-state collection and action firing are now built into the built-in components
  (`TextField`, `Select`, `RadioGroup`, `NumberField`, `DatePicker`, `Button`). They
  read from `FormStateContext` / `ActionContext` automatically when present, and behave
  as pure stateless components when the contexts are absent.

  **Migration:** Remove `withFormState(...)` and `withAction(...)` wrappers from your
  registry entries. `FormStateContext` and `ActionContext` remain public for custom
  components that need to integrate with the action pipeline directly.

## 0.1.0-preview.1

### Minor Changes

- 51ba85e: Add `defaultRegistry` and `registerAllComponents` exports so consumers can render all
  built-in components without manually wiring a registry.
