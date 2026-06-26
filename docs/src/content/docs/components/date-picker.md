---
title: DatePicker / DateRangePicker
description: Calendar date pickers for single dates and date ranges.
---

Two components: `DatePicker` for a single date and `DateRangePicker` for a start–end range.
Both wrap the corresponding React Aria primitives with full keyboard and screen reader support.

## Add via CLI

```bash
npx @a2ra/cli add date-picker
```

## DatePicker props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Visible label |
| `name` | `string` | — | Form field name |
| `value` | `string` | — | Controlled date in ISO 8601 format (`YYYY-MM-DD`) |
| `defaultValue` | `string` | — | Uncontrolled default |
| `minValue` | `string` | — | Earliest selectable date |
| `maxValue` | `string` | — | Latest selectable date |
| `isDisabled` | `boolean` | `false` | Disables the picker |
| `isRequired` | `boolean` | `false` | Marks as required |
| `isInvalid` | `boolean` | `false` | Shows error styling |
| `isReadOnly` | `boolean` | `false` | Prevents editing |
| `autoFocus` | `boolean` | `false` | Focuses on mount |
| `isOpen` | `boolean` | — | Controlled calendar open state |
| `defaultOpen` | `boolean` | `false` | Opens calendar on mount |
| `granularity` | `"day" \| "hour" \| "minute" \| "second"` | `"day"` | Time granularity shown |
| `firstDayOfWeek` | `"sun" \| "mon" \| ...` | locale default | First day of the week |
| `validationBehavior` | `"aria" \| "native"` | `"aria"` | Validation strategy |
| `description` | `string` | — | Helper text |
| `errorMessage` | `string` | — | Error text when `isInvalid` is `true` |

## DateRangePicker props

Same as `DatePicker` plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `startName` | `string` | — | Form field name for the start date |
| `endName` | `string` | — | Form field name for the end date |
| `allowsNonContiguousRanges` | `boolean` | `false` | Allow ranges with disabled dates in the middle |
| `value` | `{ start: string, end: string }` | — | Controlled range (ISO dates) |
| `defaultValue` | `{ start: string, end: string }` | — | Uncontrolled default range |

## Examples

Single date:

```json
{
  "type": "DatePicker",
  "props": {
    "label": "Appointment date",
    "name": "date",
    "minValue": "2025-01-01",
    "maxValue": "2025-12-31"
  }
}
```

Date range:

```json
{
  "type": "DateRangePicker",
  "props": {
    "label": "Stay dates",
    "startName": "check_in",
    "endName": "check_out",
    "minValue": "2025-06-01"
  }
}
```

## Notes

- Date values are plain ISO 8601 strings (`YYYY-MM-DD`). Time values include a time component
  when `granularity` is `"hour"` or finer.
- The calendar popup is keyboard-navigable with arrow keys; `Enter` selects a date.
