# @a2ra/core

## 1.0.0-preview.8

### Minor Changes

- 075c3a9: `DatePicker` and `DateRangePicker` now render the required marker inside their `<Label>`,
  matching the six controls that already did (`TextField`, `TextArea`, `NumberField`,
  `CheckboxGroup`, `RadioGroup`, `Select`). The marker is `aria-hidden`, so the computed
  accessible name is unchanged. `date-picker.styles.ts` gains the `requiredIndicator` token.

  Every `parseDate` call in the date pickers is guarded. `parseDate` throws on anything that
  is not a valid ISO day, so a `value`, `defaultValue`, `minValue` or `maxValue` the caller
  had not already validated was a render-time exception rather than an empty control. An
  unparseable value now renders as no selection. Two helpers, `parseDateOrNull` and
  `parseDateRangeOrNull`, are exported from `date-picker.shared`.

  `RadioGroup`, `Select`, `DatePicker` and `DateRangePicker` accept `value: string | null`
  (`{ start, end } | null` for the range picker), matching the React Aria Components contract
  rather than narrowing it. `null` is React Aria's own spelling of "no selection", so a
  consumer can keep these controls controlled through an empty value instead of passing
  `undefined` and taking React Stately's uncontrolled path. The `DatePicker` no longer
  collapses an empty value to `undefined` internally, so it can be genuinely controlled.

  `react-aria-components` moves to `^1.20.0` and `@internationalized/date` to `^3.12.3`, so a
  consumer already on those versions resolves a single copy of each instead of two. Two
  copies of `react-aria-components` mean two SSR id and context providers, which is a known
  source of React hydration attribute mismatches.

- 009d447: `Menu` opens its trigger and its rows to the host, additively: every existing call renders
  exactly as before.

  The component rendered its own trigger (`<Button>{triggerLabel}</Button>`, a bordered pill)
  and its own rows (`{ id, label: string }`), and neither was reachable. A design system that
  wants an icon-only trigger, a circular avatar, a check glyph beside a chosen row, an account
  menu's "Signed in as" header, or a rule between two groups of actions had to abandon the
  component and compose React Aria's `MenuTrigger` primitives itself, which is exactly where a
  component catalog most wants to be the single source of the shape.

  Five additions, all optional:

  - `trigger?: ReactNode` is content for the trigger button in place of the plain label. The
    button stays this component's, so the keyboard contract is unchanged. `triggerLabel`
    becomes its `aria-label` when the two are given together, and is never defaulted in that
    branch: a trigger with its own visible text is named from that content, and an icon-only
    control needs an explicit `triggerLabel` or it has no accessible name at all, which an
    accessibility scan catches rather than a mismatched "Options" masking it.
  - `menuLabel?: string` puts an `aria-label` on the popup. `MenuTrigger` also points the popup
    at its trigger with `aria-labelledby`, which wins the name computation, so this is
    forwarded rather than fought: overriding React Aria's own labelling would be an ARIA
    override with no good reason behind it.
  - `header?: ReactNode` renders a non-interactive block above the rows, OUTSIDE `role="menu"`
    and followed by a rule. It is a label for the menu, not a stop in it: a first arrow-down
    that lands on an inert row is worse than one that lands on the first real action.
  - An item's `label` widens from `string` to `ReactNode`, so a row can carry a glyph or an
    icon beside its text, and gains `textValue` (what type-to-select and screen readers use
    when the label is not plain text) and `href` (renders the row as a link, so it
    middle-clicks and copies like one). An item may instead be `{ id, kind: "separator" }`.
  - `classNames` overrides the classes on any of the six slots (trigger, popover, menu, item,
    header, separator). A named slot REPLACES its defaults rather than adding to them, so a
    host with its own design language never leaves two sets of opinions on one element for the
    cascade to settle.

  `disallowEmptySelection` is forwarded too, for a single-selection menu that must always have
  a chosen row.

  `MenuSchema` grows the parts an A2UI document can carry: `menuLabel`,
  `disallowEmptySelection`, and an item's `textValue`, `href` and `kind`. `trigger`, `header`
  and `classNames` are code-only and stay out of it, and `.strict()` keeps them out: a document
  describes what a menu IS, and neither a node tree nor a class name belongs in that data.

  The item type the component takes is now declared beside the component rather than inferred
  from the schema, since a `ReactNode` label has no Zod equivalent. `MenuItemEntry` still names
  it and is still exported; the JSON shape is exported alongside as `MenuItemNode`.

- d1677b6: `react-aria-components` moves from a hard dependency of `@a2ra/core` to a **peer dependency**, at
  the same `^1.20.0` range it declared before, with a matching `devDependency` so this workspace
  still resolves it for the package's own tests, build and stories. No export, prop or behaviour
  changes.

  The documented install is already the peer-dependency install. `README.md` and the
  getting-started guide both say `pnpm add @a2ra/core react-aria-components`, and `a2ra add` ends by
  printing `react-aria-components` under "Install required dependencies" because every component it
  copies imports it by name. The manifest was the one place that said otherwise, and this is the
  manifest catching up to the contract the docs and the CLI have always stated.

  The reason it matters is that a hard dependency can fork and a peer dependency cannot.

  Both arms resolve independently today: the consumer's own `react-aria-components` range and this
  package's. They agree only for as long as they happen to resolve to the same version, and an
  ordinary bump on the consumer's side is enough to end that, because only their arm moves. From
  that point the consumer has two copies, one nested under `@a2ra/core`, and every later bump widens
  the gap rather than closing it.

  Two copies of `react-aria-components` in one React tree is not a disk-space question. The library
  ships React context objects and SSR id state at module scope, so a second copy is a second set of
  both, and a subtree rendered against one copy no longer shares provider state with the rest of the
  tree. A downstream consumer (`roonga/qcms` issue 151) is carrying exactly this split:
  `pnpm why react-aria-components` reports 1.21.1 on the direct arm and 1.20.0 nested under
  `@a2ra/core@1.0.0-preview.7`, which is the published preview's `^1.18.0` frozen at an older
  resolution. Declaring the dependency as a peer is what makes that state unreachable rather than
  something each consumer has to notice and dedupe.

  This is also how the package already declares `react` and `react-dom`, for the same reason: a
  library that has to be a singleton in the host's React tree states the constraint instead of
  satisfying it privately.

  **What a consumer has to do: nothing**, if they followed the documented install. A project that
  somehow had `@a2ra/core` without a direct `react-aria-components` now needs one, and npm 7+, pnpm
  and yarn all report an unmet peer plainly.

### Patch Changes

- 7347b3b: `TextField` no longer discards what was typed before React attached. React Aria renders a
  CONTROLLED input whatever it is handed (`useTextField` always puts `value` into
  `inputProps`, seeded from `defaultValue || ""`), so on a server-rendered page the commit
  that hydrates the field wrote that initial state onto the DOM and silently threw away
  anything typed into the input while the bundle was still downloading. On a `required` field
  the loss was worse than a lost keystroke: the browser's own constraint validation then
  refused the submit, with no submit event, no request and nothing on screen to explain it.
  Measured downstream on an idle machine, React attached 76ms to 404ms after the document
  commit and wiped the typed value in 12 of 20 trials.

  The field now reads its server-rendered input once, during the hydrating render, and seeds
  its initial value from it. Only a value that DIFFERS from what the server rendered is
  adopted, so a page nobody typed into early behaves exactly as before; a controlled field is
  left alone, since its value is the consumer's to decide. The hydrating render is identified
  with `useSyncExternalStore`, the mechanism React Aria's own `useIsSSR` is built on, so an
  ordinary client mount never reaches into the document. `TextField` now passes React Aria an
  explicit `id` (a `useId`, stable across server and client) so it can find its own input.

  `NumberField`'s required marker is `aria-hidden`, matching the other seven controls. It was
  the one control whose marker was announced, so its computed accessible name ended in " \*"
  instead of reading as the question.

  `Checkbox` no longer defaults `isRequired` to `false`. Inside a `CheckboxGroup`, React Aria
  resolves an item's required state as `props.isRequired ?? state.isRequired`, so a literal
  `false` won over the group and the required state of a required group reached none of its
  checkboxes: the group conveyed required visually (`data-required`) and said nothing to
  assistive technology. ARIA does not allow `aria-required` on `role="group"`, so the state
  belongs on the items, where each checkbox now carries `aria-required` (aria validation) or
  `required` (native validation) for exactly as long as nothing in the group is selected,
  which is React Aria's own encoding of "at least one".

  The registry generator now follows a component's imports out of its own directory and ships
  what it finds under the components root as part of that item. `group-schema-fields.ts` is
  imported by the checkbox and radio schemas and was in no registry item at all, so
  `a2ra add checkbox` (or `radio`) copied source with a dangling import. Both items now carry
  it. Imports that resolve above the components root stay the consumer's own runtime.

## 1.0.0-preview.7

### Minor Changes

- e3be565: Add `TextArea` — a labeled multiline text input (React Aria `TextField` + `TextArea` element)
  with `rows`, length constraints, description, and error-message support. Registered in
  `defaultRegistry`, exported from the package index, available via `a2ra add text-area`. Closes #68.

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
