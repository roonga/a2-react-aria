---
title: TextField
description: A labeled text input with validation, description, and error message support.
---

A wrapper around React Aria's `TextField` component. Manages label association,
validation state, and error messages automatically.

## Add via CLI

```bash
npx @a2ra/cli add text-field
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Visible label (required for accessibility) |
| `placeholder` | `string` | — | Placeholder text |
| `type` | `"text" \| "email" \| "password" \| "number" \| "tel" \| "url"` | `"text"` | Input type |
| `name` | `string` | — | Form field name |
| `value` | `string` | — | Controlled value |
| `defaultValue` | `string` | — | Uncontrolled default |
| `isDisabled` | `boolean` | `false` | Disables the input |
| `isRequired` | `boolean` | `false` | Marks field as required |
| `isReadOnly` | `boolean` | `false` | Prevents editing |
| `isInvalid` | `boolean` | `false` | Shows error styling |
| `autoFocus` | `boolean` | `false` | Focuses the field on mount |
| `autoComplete` | `string` | — | Browser autocomplete hint |
| `inputMode` | `"text" \| "numeric" \| "decimal" \| "email" \| "tel" \| "url" \| "search"` | — | Virtual keyboard hint |
| `validationBehavior` | `"aria" \| "native"` | `"aria"` | Validation reporting strategy |
| `minLength` | `number` | — | Minimum character length |
| `maxLength` | `number` | — | Maximum character length |
| `pattern` | `string` | — | Regex validation pattern |
| `description` | `string` | — | Helper text shown below the input |
| `errorMessage` | `string` | — | Error text shown when `isInvalid` is `true` |

## Example

```json
{
  "type": "TextField",
  "props": {
    "label": "Email address",
    "type": "email",
    "name": "email",
    "isRequired": true,
    "autoComplete": "email",
    "description": "We'll never share your email."
  }
}
```

With validation error:

```json
{
  "type": "TextField",
  "props": {
    "label": "Username",
    "name": "username",
    "isInvalid": true,
    "errorMessage": "Username is already taken."
  }
}
```

## Notes

- Always provide a `label`. React Aria associates it with the input via ARIA attributes.
- `errorMessage` is only shown when `isInvalid: true`.
- Use `validationBehavior: "native"` for HTML form constraint validation with browser-native messages.
