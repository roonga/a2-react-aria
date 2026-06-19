---
title: Checkbox / CheckboxGroup
description: A single checkbox or a labelled group of checkboxes with validation support.
---

Two components: `Checkbox` for a standalone toggle, and `CheckboxGroup` for a labelled
set of related checkboxes. Both wrap the corresponding React Aria primitives.

## Add via CLI

```bash
npx @a2ra/cli add checkbox
```

## Checkbox props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Visible label text |
| `value` | `string` | — | Value submitted with the form |
| `name` | `string` | — | Form field name |
| `isSelected` | `boolean` | — | Controlled checked state |
| `defaultSelected` | `boolean` | `false` | Uncontrolled default |
| `isDisabled` | `boolean` | `false` | Disables the checkbox |
| `isRequired` | `boolean` | `false` | Marks as required |
| `isIndeterminate` | `boolean` | `false` | Shows indeterminate (`—`) state |
| `isReadOnly` | `boolean` | `false` | Prevents toggling |
| `isInvalid` | `boolean` | `false` | Shows error styling |
| `autoFocus` | `boolean` | `false` | Focuses on mount |
| `validationBehavior` | `"aria" \| "native"` | `"aria"` | Validation strategy |
| `errorMessage` | `string` | — | Error text when `isInvalid` is `true` |

## CheckboxGroup props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Group label |
| `value` | `string[]` | — | Controlled selected values |
| `defaultValue` | `string[]` | `[]` | Uncontrolled default |
| `isDisabled` | `boolean` | `false` | Disables all checkboxes |
| `isRequired` | `boolean` | `false` | Marks group as required |
| `isReadOnly` | `boolean` | `false` | Prevents any changes |
| `isInvalid` | `boolean` | `false` | Shows error styling on the group |
| `validationBehavior` | `"aria" \| "native"` | `"aria"` | Validation strategy |
| `orientation` | `"horizontal" \| "vertical"` | `"vertical"` | Layout direction |
| `name` | `string` | — | Form field name |
| `description` | `string` | — | Helper text |
| `errorMessage` | `string` | — | Error text when `isInvalid` is `true` |
| `children` | `node[]` | — | `Checkbox` child nodes |

## Examples

Standalone checkbox:

```json
{
  "type": "Checkbox",
  "props": {
    "label": "I agree to the terms",
    "name": "terms",
    "value": "agreed",
    "isRequired": true
  }
}
```

Group of checkboxes:

```json
{
  "type": "CheckboxGroup",
  "props": {
    "label": "Interests",
    "name": "interests",
    "orientation": "horizontal"
  },
  "children": [
    { "type": "Checkbox", "props": { "label": "Design", "value": "design" } },
    { "type": "Checkbox", "props": { "label": "Engineering", "value": "eng" } },
    { "type": "Checkbox", "props": { "label": "Product", "value": "product" } }
  ]
}
```

## Notes

- `CheckboxGroup` manages keyboard navigation and ARIA group labelling automatically.
- `isIndeterminate` is a visual-only state; it does not affect the submitted form value.
