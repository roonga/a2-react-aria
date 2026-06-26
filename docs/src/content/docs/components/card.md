---
title: Card
description: A surface container with configurable padding, shadow, and border radius.
---

A layout primitive for grouping content into a visually distinct surface. All visual
properties (shadow, radius, border) use design tokens so cards respect the consumer's theme.

## Add via CLI

```bash
npx @a2ra/cli add card
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `padding` | `"none" \| "sm" \| "md" \| "lg"` | `"md"` | Internal padding |
| `shadow` | `"none" \| "sm" \| "md" \| "lg"` | `"sm"` | Drop shadow depth |
| `radius` | `"none" \| "sm" \| "md" \| "lg"` | `"md"` | Border radius |
| `border` | `boolean` | `true` | Show a border |
| `children` | `node[]` | — | Content rendered inside the card |

## Example

```json
{
  "type": "Card",
  "props": {
    "padding": "lg",
    "shadow": "md"
  },
  "children": [
    { "type": "Text", "props": { "as": "h3", "weight": "semibold" }, "children": "Usage this month" },
    { "type": "Text", "props": { "size": "2xl", "weight": "bold" }, "children": "12,483" },
    { "type": "Text", "props": { "size": "sm", "color": "muted" }, "children": "API calls" }
  ]
}
```

## Notes

- `Card` has no semantic HTML role; it is a plain `<div>`. Wrap with `<article>` or `<section>`
  via a parent layout node if the content warrants a landmark.
- `border: false` combined with a shadow is the standard "floating card" look.
- Nest `Form` or `Flex` inside `Card` to build structured layouts.
