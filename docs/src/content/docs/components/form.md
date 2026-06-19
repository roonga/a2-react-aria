---
title: Form
description: A layout container that groups form fields with consistent spacing.
---

A wrapper around React Aria's `Form` component. Handles server-side validation errors,
form-wide disabled state, and vertical spacing between fields.

## Add via CLI

```bash
npx @a2ra/cli add form
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `gap` | `"sm" \| "md" \| "lg"` | `"md"` | Vertical spacing between child fields |
| `validationBehavior` | `"aria" \| "native"` | `"aria"` | Validation reporting strategy |
| `validationErrors` | `Record<string, string \| string[]>` | — | Server-side errors keyed by field name |
| `action` | `string` | — | Form action URL |
| `method` | `"get" \| "post"` | — | HTTP method |
| `encType` | `"application/x-www-form-urlencoded" \| "multipart/form-data" \| "text/plain"` | — | Encoding type |
| `autoComplete` | `"on" \| "off"` | — | Browser autocomplete hint |
| `target` | `string` | — | Form submission target |
| `children` | `node[]` | — | Form field nodes |

## Example

```json
{
  "type": "Form",
  "props": {
    "gap": "md"
  },
  "children": [
    {
      "type": "TextField",
      "props": { "label": "Full name", "name": "name", "isRequired": true }
    },
    {
      "type": "TextField",
      "props": { "label": "Email", "name": "email", "type": "email", "isRequired": true }
    },
    {
      "type": "Button",
      "props": { "variant": "primary", "type": "submit" },
      "children": "Create account"
    }
  ]
}
```

With server-side validation errors:

```json
{
  "type": "Form",
  "props": {
    "validationErrors": {
      "email": "This email is already registered."
    }
  },
  "children": [
    { "type": "TextField", "props": { "label": "Email", "name": "email" } }
  ]
}
```

## Notes

- `validationErrors` keys must match the `name` prop of the field they target.
- Use `validationBehavior: "native"` when submitting to a plain HTML form endpoint.
- `Form` does not submit on its own — pair it with a `Button` with `type: "submit"`.
