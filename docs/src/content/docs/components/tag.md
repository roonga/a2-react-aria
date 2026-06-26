---
title: Tag / TagGroup
description: Selectable tags for filtering, labelling, and multi-select chip lists.
---

`Tag` and `TagGroup` are built on React Aria's `Tag` and `TagGroup` primitives. They support
keyboard navigation, single and multi-select, and disabled individual items.

## Add via CLI

```bash
npx @a2ra/cli add tag
```

## TagGroup props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Accessible label rendered above the tag list |
| `selectionMode` | `"none" \| "single" \| "multiple"` | `"none"` | Whether tags can be selected |
| `description` | `string` | — | Helper text rendered below the tag list |
| `children` | `Tag[]` | — | One or more `Tag` nodes |

## Tag props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | — | Stable identifier used by React Aria for selection tracking |
| `isDisabled` | `boolean` | `false` | Prevents selection of this tag |
| `children` | `string` | — | Tag label text |

## Example

Read-only labels:

```json
{
  "type": "TagGroup",
  "props": { "label": "Technologies" },
  "children": [
    { "type": "Tag", "props": { "id": "react" }, "children": "React" },
    { "type": "Tag", "props": { "id": "ts" },    "children": "TypeScript" },
    { "type": "Tag", "props": { "id": "rac" },   "children": "React Aria" }
  ]
}
```

Multi-select filter chips:

```json
{
  "type": "TagGroup",
  "props": {
    "label": "Filter by topic",
    "selectionMode": "multiple",
    "description": "Select one or more topics"
  },
  "children": [
    { "type": "Tag", "props": { "id": "ai" },      "children": "AI" },
    { "type": "Tag", "props": { "id": "design" },  "children": "Design" },
    { "type": "Tag", "props": { "id": "mobile" },  "children": "Mobile" }
  ]
}
```

## Notes

- `id` is required on each `Tag` when `selectionMode` is `"single"` or `"multiple"`;
  React Aria uses it to track selection state.
- Selected tags are highlighted with the primary colour; unselected tags show a bordered style.
- Use `selectionMode: "none"` (the default) for purely decorative or informational tag lists.
