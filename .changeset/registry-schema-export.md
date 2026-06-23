---
"@a2ra/core": minor
"@a2ra/cli": minor
---

Add registry schema export for backend validation.

`@a2ra/core` now exports `buildRegistrySchema(registry)` and `toJsonSchema(registry)` to generate
a JSON Schema covering every component type in a registry (including custom components). The
`ComponentEntry` interface gains an optional `schema` field; all built-in entries in
`defaultRegistry` are pre-populated with their Zod schemas.

`@a2ra/cli` gains an `a2ra schema` command that fetches and prints the pre-built
`registry/a2ui-schema.json` for the configured registry. Use `--out <file>` to write to disk.
`pnpm build:registry` now also regenerates `registry/a2ui-schema.json` via a new
`pnpm build:schema` script in `@a2ra/core`.
