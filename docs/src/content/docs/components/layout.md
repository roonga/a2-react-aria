---
title: Layout — Flex / Grid
description: Structural layout nodes for composing component trees.
sidebar:
  order: 11
---

Two layout primitives: `Flex` for one-dimensional layouts (row or column) and `Grid` for
two-dimensional column grids. Both are unstyled structural containers that use Tailwind
spacing tokens via CSS custom properties.

## Add via CLI

```bash
npx @a2ra/cli add layout
```

## Flex props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `direction` | `"row" \| "column" \| "row-reverse" \| "column-reverse"` | `"row"` | Flex direction |
| `gap` | `"none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl"` | `"md"` | Gap between children |
| `align` | `"start" \| "center" \| "end" \| "stretch" \| "baseline"` | `"start"` | Cross-axis alignment |
| `justify` | `"start" \| "center" \| "end" \| "between" \| "around" \| "evenly"` | `"start"` | Main-axis distribution |
| `wrap` | `boolean` | `false` | Allow children to wrap to the next line |
| `children` | `node[]` | — | Child nodes |

## Grid props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `number` (1–12) | `2` | Number of equal-width columns |
| `gap` | `"none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl"` | `"md"` | Gap between cells |
| `align` | `"start" \| "center" \| "end" \| "stretch"` | `"start"` | Row alignment |
| `children` | `node[]` | — | Child nodes |

## Examples

Flex row with space between:

```json
{
  "type": "Flex",
  "props": {
    "direction": "row",
    "justify": "between",
    "align": "center",
    "gap": "sm"
  },
  "children": [
    { "type": "Text", "props": { "weight": "semibold" }, "children": "Invoice #1042" },
    { "type": "Button", "props": { "variant": "ghost" }, "children": "Download" }
  ]
}
```

Three-column grid of cards:

```json
{
  "type": "Grid",
  "props": { "columns": 3, "gap": "md" },
  "children": [
    { "type": "Card", "children": [{ "type": "Text", "children": "Item 1" }] },
    { "type": "Card", "children": [{ "type": "Text", "children": "Item 2" }] },
    { "type": "Card", "children": [{ "type": "Text", "children": "Item 3" }] }
  ]
}
```

Nested column form layout:

```json
{
  "type": "Flex",
  "props": { "direction": "column", "gap": "md" },
  "children": [
    { "type": "TextField", "props": { "label": "First name" } },
    { "type": "TextField", "props": { "label": "Last name" } },
    { "type": "Button", "props": { "variant": "primary" }, "children": "Continue" }
  ]
}
```

## Notes

- `Flex` and `Grid` render as plain `<div>` elements with no semantic meaning.
- For form layouts, prefer `Form` over `Flex` — `Form` wires up React Aria validation context.
- `Grid` columns are always equal-width. For asymmetric layouts, nest multiple `Flex` nodes.
