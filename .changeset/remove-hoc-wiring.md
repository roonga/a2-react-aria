---
"@a2ra/core": major
---

Remove `withFormState` and `withAction` HOCs from the public API.

Form-state collection and action firing are now built into the built-in components
(`TextField`, `Select`, `RadioGroup`, `NumberField`, `DatePicker`, `Button`). They
read from `FormStateContext` / `ActionContext` automatically when present, and behave
as pure stateless components when the contexts are absent.

**Migration:** Remove `withFormState(...)` and `withAction(...)` wrappers from your
registry entries. `FormStateContext` and `ActionContext` remain public for custom
components that need to integrate with the action pipeline directly.
