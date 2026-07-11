# Copilot instructions for a2-react-aria

A React component catalog that renders A2UI JSON using React Aria Components. Components are
distributed shadcn-style: consumers own the source via `npx @a2ra/cli add <component>`.

Full contributor rules live in the repo's `CLAUDE.md` files; the points below are the ones most
relevant to reviewing a diff.

## Theming

Color, background, border-color, and text-color must reference a `var(--color-*)` design token
(e.g. `text-[var(--color-danger)]`), never a hardcoded Tailwind color (e.g. `text-red-500`).
Structural utilities (`flex`, `gap-2`, `px-3`, `rounded`) are fine as-is.

## Component code quality

- Use a plain `interface ComponentProps`; never derive props from the Zod schema type.
- Match React Aria's API exactly: `onPress` not `onClick`, `isDisabled` not `disabled`,
  `isRequired` not `required`, `isInvalid`. Never pass raw `disabled`/`aria-disabled` to RAC
  components.
- Every prop declared in the interface must be used in the component body.
- Base styles (layout, focus rings, disabled states, transitions) belong in `*.styles.ts`; the
  component's `className` should only call style functions, never repeat classes already
  returned by them.

## Accessibility

- Every interactive component needs a visible `<Label>` or explicit `aria-label`.
- Validation errors must use `<Text slot="errorMessage">`, not a raw `<span>`.
- Never suppress `:focus-visible`, add `tabIndex={-1}`, or override `role` without a documented
  reason.

## Security

`A2Renderer` is a trust boundary: it renders arbitrary agent-supplied JSON. Flag anything that
could let attacker-controlled props reach the DOM unsanitized, especially `javascript:`/`data:`/
`vbscript:` URL schemes in `href`/`src`/`action`/`formaction`/`*Url`/`*Href`/`*Src` props, or
`__proto__`/`constructor`/`prototype` keys that could pollute the prototype chain.

## Versioning

A PR that adds, changes, or removes a public export, CLI command, or consumer-visible behavior
should include a changeset in `.changeset/` (`pnpm changeset`). PRs that only touch CI, tests, or
repo tooling don't need one.

## Commits and branches

- No direct commits to `main`; all changes go through a PR branch.
- Commit messages follow `type(scope): description` (conventional commits).
