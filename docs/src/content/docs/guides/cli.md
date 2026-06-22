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

## Flags

| Flag | Description |
|------|-------------|
| `--dir <path>` | Override the target directory (ignores `a2ra.json`) |
| `--overwrite` | Replace existing files without prompting |
| `--registry <url-or-path>` | Use an alternative or local registry |

The registry URL can also be set via the `A2RA_REGISTRY` environment variable.
This is useful for monorepos that host their own private registry.
