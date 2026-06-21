---
title: Menu
description: A trigger button that opens a listbox of actionable items.
sidebar:
  order: 15
---

A wrapper around React Aria's `MenuTrigger` and `Menu` components. Supports single and
multiple selection, disabled items, and full keyboard navigation.

## Add via CLI

```bash
npx @a2ra/cli add menu
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `triggerLabel` | `string` | — | Label for the trigger button |
| `items` | `MenuItemEntry[]` | — | Menu items (see below) |
| `placement` | `"top" \| "bottom" \| "left" \| "right"` | `"bottom"` | Preferred position |
| `isOpen` | `boolean` | — | Controlled open state |
| `selectionMode` | `"none" \| "single" \| "multiple"` | `"none"` | Selection behaviour |
| `selectedKeys` | `string[]` | — | Controlled selected item IDs |
| `defaultSelectedKeys` | `string[]` | — | Uncontrolled default selection |
| `disabledKeys` | `string[]` | — | IDs of non-interactive items |

### MenuItemEntry shape

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique item identifier |
| `label` | `string` | Visible item text |
| `isDisabled` | `boolean` | Disables this item |

## Example

```json
{
  "type": "Menu",
  "props": {
    "triggerLabel": "Actions",
    "items": [
      { "id": "edit", "label": "Edit" },
      { "id": "duplicate", "label": "Duplicate" },
      { "id": "delete", "label": "Delete" }
    ],
    "disabledKeys": ["delete"]
  }
}
```

With selection:

```json
{
  "type": "Menu",
  "props": {
    "triggerLabel": "View",
    "selectionMode": "single",
    "defaultSelectedKeys": ["grid"],
    "items": [
      { "id": "grid", "label": "Grid view" },
      { "id": "list", "label": "List view" },
      { "id": "compact", "label": "Compact view" }
    ]
  }
}
```

## Notes

- Arrow keys navigate items; `Enter` or `Space` activates the focused item.
- `selectionMode: "none"` (default) is for action menus. Use `"single"` or `"multiple"`
  for menus that represent a persistent state choice (e.g. view mode).
