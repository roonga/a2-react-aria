---
title: Tooltip
description: A non-interactive overlay that provides context for a trigger element.
---

A wrapper around React Aria's `TooltipTrigger` and `Tooltip` components. Shows on hover
and focus, hides on `Escape`, and follows WCAG tooltip pattern (role="tooltip").

## Add via CLI

```bash
npx @a2ra/cli add tooltip
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | — | Tooltip text |
| `triggerLabel` | `string` | — | Label for the trigger button |
| `placement` | `"top" \| "bottom" \| "left" \| "right"` | `"top"` | Preferred position |
| `isOpen` | `boolean` | — | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Open on mount |
| `offset` | `number` | `8` | Distance from the trigger in pixels |
| `crossOffset` | `number` | `0` | Perpendicular offset in pixels |
| `shouldFlip` | `boolean` | `true` | Flip to opposite side when out of bounds |

## Example

```json
{
  "type": "Tooltip",
  "props": {
    "content": "Save your progress",
    "triggerLabel": "Save",
    "placement": "bottom"
  }
}
```

## Notes

- Tooltips must not contain interactive content (links, buttons). Use `Popover` for that.
- The tooltip is announced by screen readers via `aria-describedby` on the trigger.
- A 1.5 s hover delay is applied by React Aria to avoid flashing tooltips during mouse traversal.
