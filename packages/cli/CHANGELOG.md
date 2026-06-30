# @a2ra/cli

## 1.0.0-preview.2

### Major Changes

- 634f3a3: Align `@a2ra/cli` major version with `@a2ra/core`.

  `@a2ra/core` moved to `1.x` when the `withFormState`/`withAction` HOCs were removed.
  The CLI is the companion tool for core and should carry the same major so consumers
  can reason about compatibility with a single version number.

  No breaking changes to the CLI itself.

## 0.1.0-preview.1

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
