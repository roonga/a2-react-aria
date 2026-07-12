---
applyTo: "**"
---

# Pull request review checklist

These apply specifically when reviewing a diff in this repository (as opposed to general chat
or code generation). See `.github/copilot-instructions.md` for the full background on each rule.

## Always flag

- A hardcoded Tailwind color (`text-red-500`, `bg-blue-600`, `border-gray-300`) instead of a
  `var(--color-*)` design token.
- A component prop derived from the Zod schema type (`Omit<Required<Schema>["props"], ...>`)
  instead of a plain `interface ComponentProps`.
- A DOM-style prop name (`onClick`, `disabled`, `required`) on a React Aria Components primitive
  instead of the RAC equivalent (`onPress`, `isDisabled`, `isRequired`).
- A prop declared in a component's interface but never read in the component body.
- Styling logic duplicated inline in a component's `className` that already exists in its
  `*.styles.ts` file.
- Any new or changed prop on `A2Renderer`, a registered component, or `sanitizeProps`/
  `sanitizeValue` in `packages/core/src/renderer/A2Renderer.tsx` that could let
  attacker-controlled JSON reach the DOM without going through URL-scheme sanitization or the
  `__proto__`/`constructor`/`prototype` key filter. `A2Renderer` is a trust boundary: treat every
  prop as agent-supplied and untrusted.
- An interactive element (button, field, link acting as control) with no visible `<Label>` and no
  `aria-label`.
- A validation error rendered as a raw `<span>` instead of React Aria's `<FieldError>` (or
  `<Text slot="errorMessage">`).
- `:focus-visible` being suppressed or overridden, or `tabIndex={-1}`/a `role` override added
  without a comment explaining why.
- A PR that adds, changes, or removes a public export, CLI command, or consumer-visible behavior
  with no file under `.changeset/`.
- A commit message that doesn't follow `type(scope): description`, or any commit made directly
  to `main`.

## Don't flag

- Structural Tailwind utilities (`flex`, `gap-2`, `px-3`, `rounded`) — these are not color/theme
  values and are allowed as-is.
- Missing changesets on PRs that only touch CI, tests, or repo tooling.
- Story or test files duplicating markup that would be a red flag in component source.
