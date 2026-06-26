---
title: Alert
description: A contextual status message with info, success, warning, and error variants.
sidebar:
  order: 2
---

A non-interactive status banner with an optional title. Uses `role="alert"` so screen readers
announce it immediately when it appears.

## Add via CLI

```bash
npx @a2ra/cli add alert
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"info" \| "success" \| "warning" \| "error"` | `"info"` | Color scheme and semantic meaning |
| `title` | `string` | — | Bold heading rendered above the body |
| `children` | `string \| node[]` | — | Body content |

## Example

```json
{
  "type": "Alert",
  "props": {
    "variant": "success",
    "title": "Payment received"
  },
  "children": "Your order has been confirmed."
}
```

Error state:

```json
{
  "type": "Alert",
  "props": {
    "variant": "error",
    "title": "Something went wrong"
  },
  "children": "Please try again or contact support."
}
```

## Notes

- The element carries `role="alert"`, which triggers an ARIA live-region announcement on mount.
  Only render it when the message is genuinely new information; avoid re-rendering the same alert
  on every tick.
- `variant` controls both the color scheme and the implied severity. Choose the variant that
  matches the semantic meaning, not just the desired colour.
