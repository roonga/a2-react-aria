---
"@a2ra/core": major
---

Rename all component design tokens to a single, consistent kebab-case convention (shadcn style)
and remove hardcoded colors.

**Breaking:** the camelCase `--color-*` tokens have been renamed and the old names removed. Update
your theme and any owned component copies:

- `--color-primaryHover` to `--color-primary-hover`
- `--color-primaryActive` to `--color-primary-active`
- `--color-primaryForeground` to `--color-primary-foreground`
- `--color-secondaryHover` to `--color-secondary-hover`
- `--color-secondaryActive` to `--color-secondary-active`
- `--color-dangerHover` to `--color-danger-hover`
- `--color-dangerActive` to `--color-danger-active`
- `--color-ghostHover` to `--color-ghost-hover`
- `--color-ghostActive` to `--color-ghost-active`
- `--color-backgroundMuted` to `--color-background-muted`
- `--color-textMuted` to `--color-text-muted`
- `--color-textOnPrimary` to `--color-text-on-primary`

Alongside the rename, Button, Checkbox, DatePicker, Dialog, and Switch no longer use hardcoded
`text-white`, `bg-white`, or `bg-black/50`; they reference `--color-primary-foreground`,
`--color-secondary-foreground`, `--color-danger-foreground`, and `--color-overlay`, so they respect
consumer themes and dark mode. The registry ships component source, not a theme, so consumers must
define these tokens; the in-repo Storybook, demo, docs, and dev-survey themes have all been updated.
