---
title: Table
description: An accessible data table with sorting and row selection.
sidebar:
  order: 19
---

A wrapper around React Aria's `Table`, `TableHeader`, `Column`, `TableBody`, and `Row`
components. Provides keyboard navigation, sortable columns, and selectable rows.

## Add via CLI

```bash
npx @a2ra/cli add table
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ariaLabel` | `string` | — | ARIA label for the table |
| `columns` | `TableColumn[]` | — | Column definitions (see below) |
| `rows` | `TableRow[]` | — | Row data (see below) |
| `selectionMode` | `"none" \| "single" \| "multiple"` | `"none"` | Row selection behaviour |
| `selectedKeys` | `string[]` | — | Controlled selected row IDs |
| `defaultSelectedKeys` | `string[]` | — | Uncontrolled default selection |
| `disabledKeys` | `string[]` | — | IDs of non-selectable rows |
| `sortDescriptor` | `{ column: string, direction: "ascending" \| "descending" }` | — | Current sort state |

### TableColumn shape

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Column identifier (must match keys in `row.data`) |
| `label` | `string` | Column heading text |
| `isRowHeader` | `boolean` | Whether this column is the row header (`th scope="row"`) |

### TableRow shape

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique row identifier |
| `data` | `Record<string, string>` | Cell values keyed by column ID |

## Example

```json
{
  "type": "Table",
  "props": {
    "ariaLabel": "Team members",
    "selectionMode": "multiple",
    "columns": [
      { "id": "name", "label": "Name", "isRowHeader": true },
      { "id": "role", "label": "Role" },
      { "id": "joined", "label": "Joined" }
    ],
    "rows": [
      { "id": "1", "data": { "name": "Alice", "role": "Engineer", "joined": "2023-01" } },
      { "id": "2", "data": { "name": "Bob", "role": "Designer", "joined": "2023-06" } },
      { "id": "3", "data": { "name": "Carol", "role": "Product", "joined": "2024-03" } }
    ]
  }
}
```

## Notes

- Mark one column as `isRowHeader: true` so screen readers announce it as the row label.
- When `selectionMode` is not `"none"`, a checkbox column is prepended automatically.
- `sortDescriptor` is a controlled prop — the agent or parent component is responsible for
  re-ordering `rows` in response to sort changes.
