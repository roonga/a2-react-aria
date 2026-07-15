---
"@a2ra/core": minor
---

Form-state support for multi-value fields and field descriptions below labels.

- `FormStateContext.setValue` now accepts `string | string[]` so multi-select
  components can report array values.
- `CheckboxGroup` now reports its selected values to `FormStateContext`
  (keyed by `name`, falling back to `label`) and seeds `defaultValue` on mount,
  matching the existing behaviour of `TextField`, `Select`, and `RadioGroup`.
- `A2Renderer` action payloads join array values with `", "` and omit empty arrays.
- Field descriptions (`<Text slot="description">`) in `TextField`, `Select`,
  `RadioGroup`, and `CheckboxGroup` now render between the label and the control
  instead of after it.
- Required indicators (`*`) are now `aria-hidden` in all field components.
