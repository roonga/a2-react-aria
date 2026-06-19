---
title: Text
description: A polymorphic text node for headings, paragraphs, and inline text.
---

Renders any semantic text element — `h1`–`h4`, `p`, `span`, or `label` — with size,
weight, colour, and alignment variants driven by design tokens.

## Add via CLI

```bash
npx @a2ra/cli add text
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `as` | `"h1" \| "h2" \| "h3" \| "h4" \| "p" \| "span" \| "label"` | `"p"` | HTML element to render |
| `size` | `"xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl"` | `"md"` | Font size |
| `weight` | `"normal" \| "medium" \| "semibold" \| "bold"` | `"normal"` | Font weight |
| `color` | `"default" \| "muted" \| "primary" \| "danger"` | `"default"` | Text colour token |
| `align` | `"left" \| "center" \| "right" \| "justify"` | `"left"` | Text alignment |
| `italic` | `boolean` | `false` | Italic style |
| `truncate` | `boolean` | `false` | Truncate with ellipsis on overflow |
| `children` | `string \| node[]` | — | Text content or child nodes |

## Example

```json
{
  "type": "Text",
  "props": {
    "as": "h2",
    "size": "xl",
    "weight": "semibold"
  },
  "children": "Account settings"
}
```

Muted helper text:

```json
{
  "type": "Text",
  "props": {
    "as": "p",
    "size": "sm",
    "color": "muted"
  },
  "children": "Changes are saved automatically."
}
```

## Notes

- All colours reference `var(--color-*)` tokens, so `Text` inherits the consumer's theme.
- `truncate: true` adds `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` —
  the parent must have a constrained width for this to take effect.
