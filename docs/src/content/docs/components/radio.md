---
title: RadioGroup
description: A labelled group of mutually exclusive radio buttons.
sidebar:
  order: 7
---

Two components: `RadioGroup` (the container) and `Radio` (individual options). Built on
React Aria's `RadioGroup` and `Radio` primitives with full keyboard and screen reader support.

## Add via CLI

```bash
npx @a2ra/cli add radio
```

## RadioGroup props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Group label |
| `value` | `string` | — | Controlled selected value |
| `defaultValue` | `string` | — | Uncontrolled default |
| `isDisabled` | `boolean` | `false` | Disables all radios |
| `isRequired` | `boolean` | `false` | Marks group as required |
| `isReadOnly` | `boolean` | `false` | Prevents selection changes |
| `isInvalid` | `boolean` | `false` | Shows error styling |
| `validationBehavior` | `"aria" \| "native"` | `"aria"` | Validation strategy |
| `orientation` | `"horizontal" \| "vertical"` | `"vertical"` | Layout direction |
| `name` | `string` | — | Form field name |
| `description` | `string` | — | Helper text |
| `errorMessage` | `string` | — | Error text when `isInvalid` is `true` |
| `children` | `node[]` | — | `Radio` child nodes |

## Radio props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | **required** | The value submitted when this radio is selected |
| `label` | `string` | — | Visible label text |
| `isDisabled` | `boolean` | `false` | Disables just this option |

## Example

```json
{
  "type": "RadioGroup",
  "props": {
    "label": "Subscription plan",
    "name": "plan",
    "defaultValue": "monthly",
    "orientation": "horizontal"
  },
  "children": [
    { "type": "Radio", "props": { "value": "monthly", "label": "Monthly" } },
    { "type": "Radio", "props": { "value": "annual", "label": "Annual" } },
    { "type": "Radio", "props": { "value": "lifetime", "label": "Lifetime" } }
  ]
}
```

## Notes

- `Radio.value` is required. The `RadioGroup` uses it to track and submit the selection.
- Arrow keys move focus between options; `Space` selects the focused option.
- Only one `Radio` per group can be selected at a time.
