## Summary

<!-- 1-3 bullet points describing what changed and why. -->

## Test plan

<!-- How did you verify this? Check what applies, delete what doesn't. -->

- [ ] `pnpm test` passes (Vitest + axe-core, Playwright docs link check)
- [ ] `pnpm lint` passes with no new warnings
- [ ] Storybook story tests pass (axe gate via the Storybook MCP `run-story-tests` tool), if a
      component or story changed
- [ ] Manually verified in the browser (dev server / Storybook), if this is a UI change

## Changeset

- [ ] A changeset is included (`pnpm changeset`), if this adds/changes/removes a public API,
      export, CLI command, or consumer-visible behaviour
- [ ] Not applicable: this PR only touches CI, tests, or repo tooling
