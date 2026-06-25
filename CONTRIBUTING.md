# Contributing

Thank you for your interest in contributing to a2-react-aria.

## Before you start

Read [CLAUDE.md](./CLAUDE.md) for the full project rules, architecture overview, and
component backlog. It covers:

- Package/library approval policy
- Component authoring workflow (schema, styles, component, tests, Storybook)
- Theming rules (no hardcoded colors)
- Accessibility requirements
- Commit and PR standards

## Getting started

```bash
git clone https://github.com/roonga/a2-react-aria.git
cd a2-react-aria
pnpm install
pnpm build
```

## Workflow

1. **Open an issue first** for non-trivial changes so we can align before you invest time.
2. Create a branch: `git checkout -b type/short-description`
3. Make your changes following the rules in CLAUDE.md.
4. Run checks before pushing:

```bash
pnpm lint
pnpm test
pnpm build
```

1. Open a pull request with a conventional commit title (`type(scope): description`)
   and a Summary + Test plan body.

## Adding a component

Follow the 10-step workflow in the "Adding a new component" section of [CLAUDE.md](./CLAUDE.md).
Components must pass lint, all tests, and Storybook story tests before merging.

## Commit style

Use conventional commits: `feat`, `fix`, `docs`, `refactor`, `ci`, `chore`.
One logical commit per branch. Do not stack WIP commits.

## Code of conduct

Be constructive. Reviews should focus on the code, not the author.
