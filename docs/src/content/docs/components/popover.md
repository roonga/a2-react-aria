---
title: Popover
description: An interactive overlay anchored to a trigger, for rich contextual content.
---

A wrapper around React Aria's `DialogTrigger` and `Popover` components. Unlike `Tooltip`,
a `Popover` can contain interactive elements such as forms, links, or buttons.

## Add via CLI

```bash
npx @a2ra/cli add popover
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `triggerLabel` | `string` | — | Label for the trigger button |
| `placement` | `"top" \| "bottom" \| "left" \| "right"` | `"bottom"` | Preferred position |
| `isOpen` | `boolean` | — | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Open on mount |
| `offset` | `number` | `8` | Distance from the trigger in pixels |
| `crossOffset` | `number` | `0` | Perpendicular offset in pixels |
| `shouldFlip` | `boolean` | `true` | Flip to opposite side when out of bounds |
| `isKeyboardDismissDisabled` | `boolean` | `false` | Prevent `Escape` from closing |
| `maxHeight` | `number` | — | Maximum height in pixels before scrolling |
| `children` | `node[]` | — | Content rendered inside the popover |

## Example

```json
{
  "type": "Popover",
  "props": {
    "triggerLabel": "Filter options",
    "placement": "bottom"
  },
  "children": [
    {
      "type": "Form",
      "props": { "gap": "sm" },
      "children": [
        { "type": "Checkbox", "props": { "label": "In stock only", "value": "instock" } },
        { "type": "Select", "props": {
          "label": "Sort by",
          "items": [
            { "label": "Price: low to high", "value": "price_asc" },
            { "label": "Price: high to low", "value": "price_desc" }
          ]
        }}
      ]
    }
  ]
}
```

## Notes

- Use `Tooltip` for non-interactive hints. Use `Popover` when the content has clickable elements.
- `Escape` closes the popover and returns focus to the trigger by default.
- `maxHeight` enables internal scrolling for long content without affecting the page layout.
