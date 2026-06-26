---
title: Select
description: A dropdown selector with keyboard navigation and search support.
---

A wrapper around React Aria's `Select` component. Renders a button that opens a listbox
with full keyboard navigation, typeahead search, and screen reader announcements.

## Add via CLI

```bash
npx @a2ra/cli add select
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Visible label |
| `placeholder` | `string` | — | Placeholder shown when nothing is selected |
| `items` | `SelectItem[]` | — | List of options (see below) |
| `value` | `string` | — | Controlled selected value |
| `defaultValue` | `string` | — | Uncontrolled default |
| `isDisabled` | `boolean` | `false` | Disables the select |
| `isRequired` | `boolean` | `false` | Marks as required |
| `isOpen` | `boolean` | — | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Opens the listbox on mount |
| `disabledKeys` | `string[]` | — | Values of disabled options |
| `isInvalid` | `boolean` | `false` | Shows error styling |
| `validationBehavior` | `"aria" \| "native"` | `"aria"` | Validation strategy |
| `name` | `string` | — | Form field name |
| `description` | `string` | — | Helper text |
| `errorMessage` | `string` | — | Error text when `isInvalid` is `true` |

### SelectItem shape

| Field | Type | Description |
|-------|------|-------------|
| `label` | `string` | Visible option text |
| `value` | `string` | Submitted value |
| `isDisabled` | `boolean` | Disables this option |

## Example

```json
{
  "type": "Select",
  "props": {
    "label": "Country",
    "name": "country",
    "placeholder": "Select a country",
    "isRequired": true,
    "items": [
      { "label": "Australia", "value": "AU" },
      { "label": "United Kingdom", "value": "GB" },
      { "label": "United States", "value": "US" }
    ]
  }
}
```

With a disabled option:

```json
{
  "type": "Select",
  "props": {
    "label": "Plan",
    "items": [
      { "label": "Starter", "value": "starter" },
      { "label": "Pro", "value": "pro" },
      { "label": "Enterprise (contact us)", "value": "enterprise", "isDisabled": true }
    ]
  }
}
```

## Notes

- Type any character to jump to the first option starting with that letter (typeahead).
- Arrow keys navigate options; `Enter` or `Space` confirms the selection.
