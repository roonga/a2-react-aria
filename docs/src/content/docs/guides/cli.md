---
title: CLI Reference
description: Use @a2ra/cli to add, update, and diff components in your project.
sidebar:
  order: 4
---

The `@a2ra/cli` copies component source files into your project so you own and control the code.
There is nothing to version-pin; you pull updates deliberately with `diff`.

## Init

```bash
npx @a2ra/cli init
```

Creates an `a2ra.json` config file at the project root:

```json
{
  "componentsDir": "components/a2ui"
}
```

Edit `componentsDir` to set where components are copied. The default is `components/a2ui/`.

Pass `--entry` to also scaffold the schema block so `a2ra schema` works out of the box:

```bash
npx @a2ra/cli init --entry lib/registry-schemas.ts
```

This produces:

```json
{
  "componentsDir": "components/a2ui",
  "schema": {
    "entry": "lib/registry-schemas.ts",
    "out": "a2ui-schema.json",
    "title": "a2UI Schema",
    "description": "JSON Schema for a2UI nodes accepted by this app."
  }
}
```

Edit `title` and `description` to match your app. They appear as top-level fields in the
generated JSON Schema file.

## List

```bash
npx @a2ra/cli list
```

Lists all components available in the registry with their names and descriptions.

## Add

```bash
npx @a2ra/cli add <component...>
```

Copies one or more components into `componentsDir`. Each component ships four files:

| File | Description |
|------|-------------|
| `<name>.tsx` | React component |
| `<name>.styles.ts` | Tailwind class variants |
| `<name>.schema.ts` | Zod schema for the a2UI JSON node |
| `index.ts` | Barrel export |

After adding, the CLI prints the npm peer dependencies to install:

```bash
npx @a2ra/cli add button text-field form
pnpm add react-aria-components  # printed by the CLI
```

## Diff

```bash
npx @a2ra/cli diff [component]
```

Compares your installed source against the upstream registry and shows a unified diff.
Run without an argument to diff all installed components at once.

Use this before pulling upstream updates so you can review what changed and decide
whether to accept, merge, or skip each change.

## Schema

```bash
npx @a2ra/cli schema
```

Generates a JSON Schema file from your app's component registry. The schema covers all
registered types (built-in and custom) and their prop shapes. Commit it alongside your
code so the backend can load it as a static file for validation.

Reads `schema.entry`, `schema.out`, `schema.title`, and `schema.description` from
`a2ra.json`. Pass flags to override any of them:

```bash
npx @a2ra/cli schema --entry lib/registry-schemas.ts --out a2ui-schema.json
```

The entry file must export a `registrySchemas` object (or a default export) mapping
component names to Zod schemas:

```ts
// lib/registry-schemas.ts
import { ButtonSchema, TextFieldSchema } from "@a2ra/core"
import { MyWidgetSchema } from "./components/custom/my-widget.schema"

export const registrySchemas = {
  Button: ButtonSchema,
  TextField: TextFieldSchema,
  MyWidget: MyWidgetSchema,
}
```

Run this command whenever you add or change a component.
Requires Node 22.6+ for TypeScript entry files.

## Flags

| Flag | Command | Description |
|------|---------|-------------|
| `--dir <path>` | add, diff | Override the target directory (ignores `a2ra.json`) |
| `--overwrite` | add | Replace existing files without prompting |
| `--registry <url>` | all | Use an alternative or local registry |
| `--entry <file>` | init, schema | Path to file exporting `registrySchemas` |
| `--out <file>` | schema | Output path for the generated schema file |
| `--title <string>` | schema | Top-level `title` in the generated schema |
| `--description <str>` | schema | Top-level `description` in the generated schema |
| `--force` | init | Overwrite an existing `a2ra.json` |
| `--json` | list | Machine-readable output |

The registry URL can also be set via the `A2RA_REGISTRY` environment variable.
This is useful for monorepos that host their own private registry.
