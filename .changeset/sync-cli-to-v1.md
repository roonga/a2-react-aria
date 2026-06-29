---
"@a2ra/cli": major
---

Align `@a2ra/cli` major version with `@a2ra/core`.

`@a2ra/core` moved to `1.x` when the `withFormState`/`withAction` HOCs were removed.
The CLI is the companion tool for core and should carry the same major so consumers
can reason about compatibility with a single version number.

No breaking changes to the CLI itself.
