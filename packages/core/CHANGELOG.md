# @a2ra/core

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
