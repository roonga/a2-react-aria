---
"@a2ra/core": minor
---

`Menu` opens its trigger and its rows to the host, additively: every existing call renders
exactly as before.

The component rendered its own trigger (`<Button>{triggerLabel}</Button>`, a bordered pill)
and its own rows (`{ id, label: string }`), and neither was reachable. A design system that
wants an icon-only trigger, a circular avatar, a check glyph beside a chosen row, an account
menu's "Signed in as" header, or a rule between two groups of actions had to abandon the
component and compose React Aria's `MenuTrigger` primitives itself, which is exactly where a
component catalog most wants to be the single source of the shape.

Five additions, all optional:

- `trigger?: ReactNode` is content for the trigger button in place of the plain label. The
  button stays this component's, so the keyboard contract is unchanged, and `triggerLabel`
  becomes its `aria-label`: an icon-only control has no other name.
- `menuLabel?: string` puts an `aria-label` on the popup. `MenuTrigger` also points the popup
  at its trigger with `aria-labelledby`, which wins the name computation, so this is
  forwarded rather than fought: overriding React Aria's own labelling would be an ARIA
  override with no good reason behind it.
- `header?: ReactNode` renders a non-interactive block above the rows, OUTSIDE `role="menu"`
  and followed by a rule. It is a label for the menu, not a stop in it: a first arrow-down
  that lands on an inert row is worse than one that lands on the first real action.
- An item's `label` widens from `string` to `ReactNode`, so a row can carry a glyph or an
  icon beside its text, and gains `textValue` (what type-to-select and screen readers use
  when the label is not plain text) and `href` (renders the row as a link, so it
  middle-clicks and copies like one). An item may instead be `{ id, kind: "separator" }`.
- `classNames` overrides the classes on any of the six slots (trigger, popover, menu, item,
  header, separator). A named slot REPLACES its defaults rather than adding to them, so a
  host with its own design language never leaves two sets of opinions on one element for the
  cascade to settle.

`disallowEmptySelection` is forwarded too, for a single-selection menu that must always have
a chosen row.

`MenuSchema` grows the parts an A2UI document can carry: `menuLabel`,
`disallowEmptySelection`, and an item's `textValue`, `href` and `kind`. `trigger`, `header`
and `classNames` are code-only and stay out of it, and `.strict()` keeps them out: a document
describes what a menu IS, and neither a node tree nor a class name belongs in that data.

The item type the component takes is now declared beside the component rather than inferred
from the schema, since a `ReactNode` label has no Zod equivalent. `MenuItemEntry` still names
it and is still exported; the JSON shape is exported alongside as `MenuItemNode`.
