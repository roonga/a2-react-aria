---
"@a2ra/core": minor
"@a2ra/cli": patch
---

Fix code-review findings across the renderer, registry, and CLI:

- **Security:** `A2Renderer` now recursively sanitizes nested URL props, so blocked schemes
  (`javascript:`, `data:`, `vbscript:`) hidden inside structured data such as `Breadcrumb`
  `items[].href` can no longer bypass the filter.
- **Security (CLI):** `a2ra add` rejects registry file paths that escape the components
  directory (path traversal / zip-slip) before writing.
- **Components:** `Accordion`, `AccordionItem`, `Alert`, `Tag`, and `TagGroup` are now
  registered in `defaultRegistry` and the generated a2UI schema (23 → 28 node types), so they
  render out of the box.
- **Accessibility:** the `Dialog` description is associated via `slot="description"` for correct
  `aria-describedby` wiring.
- **Correctness:** `Button` warns when an action-mode press resolves to no action, and
  `extractA2ui` returns `a2uiJson: null` for well-formed but non-array JSON.
