---
"@a2ra/core": minor
---

`DatePicker` and `DateRangePicker` now render the required marker inside their `<Label>`,
matching the six controls that already did (`TextField`, `TextArea`, `NumberField`,
`CheckboxGroup`, `RadioGroup`, `Select`). The marker is `aria-hidden`, so the computed
accessible name is unchanged. `date-picker.styles.ts` gains the `requiredIndicator` token.

Every `parseDate` call in the date pickers is guarded. `parseDate` throws on anything that
is not a valid ISO day, so a `value`, `defaultValue`, `minValue` or `maxValue` the caller
had not already validated was a render-time exception rather than an empty control. An
unparseable value now renders as no selection. Two helpers, `parseDateOrNull` and
`parseDateRangeOrNull`, are exported from `date-picker.shared`.

`RadioGroup`, `Select`, `DatePicker` and `DateRangePicker` accept `value: string | null`
(`{ start, end } | null` for the range picker), matching the React Aria Components contract
rather than narrowing it. `null` is React Aria's own spelling of "no selection", so a
consumer can keep these controls controlled through an empty value instead of passing
`undefined` and taking React Stately's uncontrolled path. The `DatePicker` no longer
collapses an empty value to `undefined` internally, so it can be genuinely controlled.

`react-aria-components` moves to `^1.20.0` and `@internationalized/date` to `^3.12.3`, so a
consumer already on those versions resolves a single copy of each instead of two. Two
copies of `react-aria-components` mean two SSR id and context providers, which is a known
source of React hydration attribute mismatches.
