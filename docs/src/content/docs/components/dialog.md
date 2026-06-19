---
title: Dialog
description: A modal dialog with a trigger button, title, description, and dismissal support.
---

A wrapper around React Aria's `DialogTrigger`, `Modal`, and `Dialog` components.
Manages focus trapping, scroll locking, and `Escape` key dismissal automatically.

## Add via CLI

```bash
npx @a2ra/cli add dialog
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | Dialog heading shown at the top |
| `description` | `string` | — | Subtitle text below the title |
| `triggerLabel` | `string` | — | Label for the trigger button |
| `isDismissable` | `boolean` | `true` | Allow dismissal by clicking outside |
| `isKeyboardDismissDisabled` | `boolean` | `false` | Prevent `Escape` from closing |
| `role` | `"dialog" \| "alertdialog"` | `"dialog"` | ARIA role (`alertdialog` requires user action) |
| `isOpen` | `boolean` | — | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Open on mount |
| `children` | `node[]` | — | Content rendered inside the dialog body |

## Example

```json
{
  "type": "Dialog",
  "props": {
    "title": "Confirm deletion",
    "description": "This action cannot be undone.",
    "triggerLabel": "Delete account",
    "isDismissable": false,
    "role": "alertdialog"
  },
  "children": [
    {
      "type": "Flex",
      "props": { "direction": "row", "gap": "sm", "justify": "end" },
      "children": [
        { "type": "Button", "props": { "variant": "ghost" }, "children": "Cancel" },
        { "type": "Button", "props": { "variant": "danger" }, "children": "Delete" }
      ]
    }
  ]
}
```

## Notes

- `role: "alertdialog"` is for destructive or high-stakes confirmations. Screen readers
  announce it more urgently than a standard `dialog`.
- Focus is trapped inside the dialog while it is open and returned to the trigger on close.
- `isDismissable: false` combined with `isKeyboardDismissDisabled: true` forces the user
  to explicitly choose an action — use only for `alertdialog` scenarios.
