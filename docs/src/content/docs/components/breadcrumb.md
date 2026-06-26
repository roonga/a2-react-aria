---
title: Breadcrumb
description: A navigation trail showing the current page's location in the hierarchy.
---

A wrapper around React Aria's `Breadcrumbs` and `Breadcrumb` components.
Renders a `<nav>` with `aria-label` and marks the last item as the current page.

## Add via CLI

```bash
npx @a2ra/cli add breadcrumb
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `BreadcrumbItem[]` | — | Ordered list of crumbs (see below) |
| `ariaLabel` | `string` | `"Breadcrumb"` | ARIA label for the `<nav>` element |
| `isDisabled` | `boolean` | `false` | Disables all breadcrumb links |

### BreadcrumbItem shape

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier |
| `label` | `string` | Visible text |
| `href` | `string` | Link destination (omit for the current page) |

## Example

```json
{
  "type": "Breadcrumb",
  "props": {
    "ariaLabel": "Page location",
    "items": [
      { "id": "home", "label": "Home", "href": "/" },
      { "id": "products", "label": "Products", "href": "/products" },
      { "id": "detail", "label": "Wireless Keyboard" }
    ]
  }
}
```

## Notes

- The last item (no `href`) is automatically marked `aria-current="page"`.
- Items without `href` render as plain text, not links.
- Breadcrumbs are wrapped in `<nav>` with the `aria-label` for landmark navigation.
