---
"@a2ra/core": minor
---

`react-aria-components` moves from a hard dependency of `@a2ra/core` to a **peer dependency**, at
the same `^1.20.0` range it declared before, with a matching `devDependency` so this workspace
still resolves it for the package's own tests, build and stories. No export, prop or behaviour
changes.

The documented install is already the peer-dependency install. `README.md` and the
getting-started guide both say `pnpm add @a2ra/core react-aria-components`, and `a2ra add` ends by
printing `react-aria-components` under "Install required dependencies" because every component it
copies imports it by name. The manifest was the one place that said otherwise, and this is the
manifest catching up to the contract the docs and the CLI have always stated.

The reason it matters is that a hard dependency can fork and a peer dependency cannot.

Both arms resolve independently today: the consumer's own `react-aria-components` range and this
package's. They agree only for as long as they happen to resolve to the same version, and an
ordinary bump on the consumer's side is enough to end that, because only their arm moves. From
that point the consumer has two copies, one nested under `@a2ra/core`, and every later bump widens
the gap rather than closing it.

Two copies of `react-aria-components` in one React tree is not a disk-space question. The library
ships React context objects and SSR id state at module scope, so a second copy is a second set of
both, and a subtree rendered against one copy no longer shares provider state with the rest of the
tree. A downstream consumer (`roonga/qcms` issue 151) is carrying exactly this split:
`pnpm why react-aria-components` reports 1.21.1 on the direct arm and 1.20.0 nested under
`@a2ra/core@1.0.0-preview.7`, which is the published preview's `^1.18.0` frozen at an older
resolution. Declaring the dependency as a peer is what makes that state unreachable rather than
something each consumer has to notice and dedupe.

This is also how the package already declares `react` and `react-dom`, for the same reason: a
library that has to be a singleton in the host's React tree states the constraint instead of
satisfying it privately.

**What a consumer has to do: nothing**, if they followed the documented install. A project that
somehow had `@a2ra/core` without a direct `react-aria-components` now needs one, and npm 7+, pnpm
and yarn all report an unmet peer plainly.
