---
"@a2ra/core": patch
---

`TextField` no longer discards what was typed before React attached. React Aria renders a
CONTROLLED input whatever it is handed (`useTextField` always puts `value` into
`inputProps`, seeded from `defaultValue || ""`), so on a server-rendered page the commit
that hydrates the field wrote that initial state onto the DOM and silently threw away
anything typed into the input while the bundle was still downloading. On a `required` field
the loss was worse than a lost keystroke: the browser's own constraint validation then
refused the submit, with no submit event, no request and nothing on screen to explain it.
Measured downstream on an idle machine, React attached 76ms to 404ms after the document
commit and wiped the typed value in 12 of 20 trials.

The field now reads its server-rendered input once, during the hydrating render, and seeds
its initial value from it. Only a value that DIFFERS from what the server rendered is
adopted, so a page nobody typed into early behaves exactly as before; a controlled field is
left alone, since its value is the consumer's to decide. The hydrating render is identified
with `useSyncExternalStore`, the mechanism React Aria's own `useIsSSR` is built on, so an
ordinary client mount never reaches into the document. `TextField` now passes React Aria an
explicit `id` (a `useId`, stable across server and client) so it can find its own input.

`NumberField`'s required marker is `aria-hidden`, matching the other seven controls. It was
the one control whose marker was announced, so its computed accessible name ended in " *"
instead of reading as the question.

`Checkbox` no longer defaults `isRequired` to `false`. Inside a `CheckboxGroup`, React Aria
resolves an item's required state as `props.isRequired ?? state.isRequired`, so a literal
`false` won over the group and the required state of a required group reached none of its
checkboxes: the group conveyed required visually (`data-required`) and said nothing to
assistive technology. ARIA does not allow `aria-required` on `role="group"`, so the state
belongs on the items, where each checkbox now carries `aria-required` (aria validation) or
`required` (native validation) for exactly as long as nothing in the group is selected,
which is React Aria's own encoding of "at least one".

The registry generator now follows a component's imports out of its own directory and ships
what it finds under the components root as part of that item. `group-schema-fields.ts` is
imported by the checkbox and radio schemas and was in no registry item at all, so
`a2ra add checkbox` (or `radio`) copied source with a dangling import. Both items now carry
it. Imports that resolve above the components root stay the consumer's own runtime.
