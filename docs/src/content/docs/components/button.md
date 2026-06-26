---
title: Button
description: A pressable button with variants, sizes, and pending state.
---

A wrapper around React Aria's `Button` component. Handles keyboard, mouse, and touch
activation with full accessibility support.

## Add via CLI

```bash
npx @a2ra/cli add button
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"primary" \| "secondary" \| "danger" \| "ghost"` | `"secondary"` | Visual style |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Button size |
| `isDisabled` | `boolean` | `false` | Prevents interaction and applies disabled styles |
| `isPending` | `boolean` | `false` | Shows a loading indicator; disables the button |
| `type` | `"button" \| "reset" \| "submit"` | `"button"` | HTML button type |
| `name` | `string` | — | Form field name |
| `value` | `string` | — | Form field value |
| `children` | `string \| node[]` | — | Button label text or child nodes |

## Example

```json
{
  "type": "Button",
  "props": {
    "variant": "primary",
    "size": "md"
  },
  "children": "Save changes"
}
```

Disabled state:

```json
{
  "type": "Button",
  "props": {
    "variant": "danger",
    "isDisabled": true
  },
  "children": "Delete"
}
```

## Notes

- Use `type: "submit"` inside a `Form` node to trigger form submission.
- `isPending` disables the button and shows a spinner; use it while an async action is running.
- `variant: "ghost"` renders no background or border; suitable for icon buttons inside toolbars.
