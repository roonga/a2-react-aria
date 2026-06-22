---
title: NumberField
description: A numeric input with increment/decrement controls, min/max, and step support.
sidebar:
  order: 4
---

A wrapper around React Aria's `NumberField` component. Provides keyboard-accessible
increment/decrement buttons and locale-aware number formatting.

## Add via CLI

```bash
npx @a2ra/cli add number-field
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Visible label |
| `placeholder` | `string` | — | Placeholder text |
| `minValue` | `number` | — | Minimum allowed value |
| `maxValue` | `number` | — | Maximum allowed value |
| `step` | `number` | `1` | Increment/decrement step |
| `value` | `number` | — | Controlled value |
| `defaultValue` | `number` | — | Uncontrolled default |
| `isRequired` | `boolean` | `false` | Marks field as required |
| `isDisabled` | `boolean` | `false` | Disables the input |
| `isReadOnly` | `boolean` | `false` | Prevents editing |
| `isInvalid` | `boolean` | `false` | Shows error styling |
| `isWheelDisabled` | `boolean` | `false` | Prevents mouse wheel changing the value |
| `validationBehavior` | `"aria" \| "native"` | `"aria"` | Validation reporting strategy |
| `name` | `string` | — | Form field name |
| `description` | `string` | — | Helper text |
| `errorMessage` | `string` | — | Error text shown when `isInvalid` is `true` |

## Example

```json
{
  "type": "NumberField",
  "props": {
    "label": "Quantity",
    "name": "qty",
    "minValue": 1,
    "maxValue": 100,
    "step": 1,
    "defaultValue": 1
  }
}
```

With validation:

```json
{
  "type": "NumberField",
  "props": {
    "label": "Price (USD)",
    "name": "price",
    "minValue": 0,
    "isInvalid": true,
    "errorMessage": "Price cannot be negative."
  }
}
```

## Notes

- `isWheelDisabled: true` is recommended in forms to prevent accidental value changes when
  the user scrolls the page.
- The increment/decrement buttons are keyboard-accessible and ARIA-labelled automatically.
