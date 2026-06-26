---
title: Accordion
description: Collapsible disclosure panels for FAQs, settings sections, and expandable content.
sidebar:
  order: 1
---

`Accordion` and `AccordionItem` are built on React Aria's `DisclosureGroup` and `Disclosure`
primitives. Each item has a trigger button and a collapsible panel.

## Add via CLI

```bash
npx @a2ra/cli add accordion
```

## Accordion props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `allowsMultipleExpanded` | `boolean` | `false` | When `true`, multiple items can be open at once |
| `isDisabled` | `boolean` | `false` | Disables all items in the group |
| `children` | `AccordionItem[]` | — | One or more `AccordionItem` nodes |

## AccordionItem props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `heading` | `string` | — | Trigger button label (required) |
| `id` | `string` | — | Stable identifier for the disclosure |
| `defaultExpanded` | `boolean` | `false` | Whether the item starts open |
| `isDisabled` | `boolean` | `false` | Disables this item's trigger |
| `children` | `string \| node[]` | — | Panel content |

## Example

Basic FAQ:

```json
{
  "type": "Accordion",
  "children": [
    {
      "type": "AccordionItem",
      "props": { "id": "q1", "heading": "What is A2UI?" },
      "children": "A2UI is a JSON schema for describing UI components that agents can emit."
    },
    {
      "type": "AccordionItem",
      "props": { "id": "q2", "heading": "Do I need to install React Aria separately?" },
      "children": "Yes. React Aria Components is a peer dependency."
    }
  ]
}
```

Multiple panels open at once with one pre-expanded:

```json
{
  "type": "Accordion",
  "props": { "allowsMultipleExpanded": true },
  "children": [
    {
      "type": "AccordionItem",
      "props": { "id": "s1", "heading": "Section 1", "defaultExpanded": true },
      "children": "This section is open by default."
    },
    {
      "type": "AccordionItem",
      "props": { "id": "s2", "heading": "Section 2" },
      "children": "This section starts closed."
    }
  ]
}
```

## Notes

- `heading` is required on every `AccordionItem`; it becomes the accessible trigger button label.
- By default only one item can be open at a time (`allowsMultipleExpanded: false`). Opening a
  new item automatically closes the previous one.
- The chevron rotates 180° when the panel is expanded via a CSS transition on `[data-expanded]`.
