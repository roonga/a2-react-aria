---
title: Switch
description: A toggle switch for binary on/off settings.
---

A wrapper around React Aria's `Switch` component. Renders as a toggle with ARIA `role="switch"`
and full keyboard support.

## Add via CLI

```bash
npx @a2ra/cli add switch
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Visible label text |
| `isSelected` | `boolean` | — | Controlled on/off state |
| `defaultSelected` | `boolean` | `false` | Uncontrolled default |
| `isDisabled` | `boolean` | `false` | Disables the switch |
| `isRequired` | `boolean` | `false` | Marks as required |
| `isInvalid` | `boolean` | `false` | Shows error styling |
| `isReadOnly` | `boolean` | `false` | Prevents toggling |
| `autoFocus` | `boolean` | `false` | Focuses on mount |
| `validationBehavior` | `"aria" \| "native"` | `"aria"` | Validation strategy |
| `name` | `string` | — | Form field name |
| `value` | `string` | — | Value submitted when selected |
| `description` | `string` | — | Helper text |
| `errorMessage` | `string` | — | Error text when `isInvalid` is `true` |

## Example

```json
{
  "type": "Switch",
  "props": {
    "label": "Enable notifications",
    "name": "notifications",
    "defaultSelected": true
  }
}
```

Disabled:

```json
{
  "type": "Switch",
  "props": {
    "label": "Dark mode",
    "isDisabled": true,
    "isSelected": false
  }
}
```

## Notes

- `Space` toggles the switch when focused.
- Prefer `Switch` over `Checkbox` for settings that take immediate effect (no form submit required).
- Prefer `Checkbox` for opt-in consent flows inside forms.
