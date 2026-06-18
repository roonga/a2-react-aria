# a2-react-aria — Expert Review & Release Plan

Status date: 2026-06-18
Target: open-source release · JSON trust model: first-party trusted (but OSS consumers will feed LLM output)

## Snapshot

**Strong foundation.** 18 React Aria Components wrappers with clean
schema/styles/component/barrel separation, an allowlist-based `A2Renderer` with an error boundary,
99 integration assertions, dual axe gates (Vitest + Storybook a11y), Playwright visual + e2e,
Biome, Turbo, and a working agent demo.

**Biggest gap.** The product's headline promise is unbuilt:

- `README.md` advertises `npx a2ui add button`, but there is **no CLI, no `registry/`, no
  `packages/vscode`** — only `packages/core`. The shadcn-style "consumers own the source"
  distribution does not exist yet.
- CLAUDE.md marks all 18 components "Done" — true as authored components, but none are
  *deliverable* to a consumer.
- **No code CI.** `.github/workflows` has only `docs.yml`; nothing runs lint/test/build/typecheck
  on PRs.

## P0 — Release blockers (the distribution must be real)

1. **Build `registry/` + `a2ui` CLI (`packages/cli`).** Shadcn-compatible registry descriptors plus a
   CLI that copies component source + `.styles.ts` + schema into a consumer repo and reconciles
   imports. Until `npx a2ui add button` works end-to-end, the README promises what the repo cannot
   deliver. This is milestone #1.
2. **Stand up code CI** (`.github/workflows/ci.yml`): `install → lint → typecheck → build → test →
   build:storybook`, matrix on Node 20/22, plus the Storybook a11y gate (`run-story-tests`) and the
   Playwright visual job. Must land before inviting external contributors.
3. **Fix the README vs reality drift now.** Gate the `npx a2ui add` examples behind a "coming soon"
   note until the CLI lands. A broken first-run install is the fastest way to lose OSS trust.

## P1 — OSS hardening & API stability

1. **API stability contract.** Before 1.0, freeze the public surface of `@a2ra/core` (`A2Renderer`,
   `createRegistry`, `registerComponent`, exported schemas/types). Add an `api-extractor` or
   typedoc-diff check in CI so prop renames break the build, not a consumer.
2. **Adopt Changesets** for semver + changelog (currently none).
3. **Security & supply chain.** Add `SECURITY.md` (disclosure path), `CONTRIBUTING.md`, issue/PR
   templates, Dependabot, and `pnpm audit` in CI.
4. **Document the trust boundary explicitly.** First-party JSON is trusted, but consumers render
   LLM-generated a2UI — their input is untrusted. The renderer's security posture must be a
   first-class, documented part of the public API.

## P2 — Renderer defense-in-depth (`A2Renderer`)

The allowlist is sound (`reg.get(type)` throws on unknown). The exposure is
`A2Renderer.tsx:27` — `<Component {...(node.props ?? {})}>` spreads **unvalidated props**.

1. **Optional strict mode: validate `props` against the component's Zod schema** before spreading.
   Per-component schemas already exist; they are just not wired into render. Add a `validateProps`
   registry option — default off (trusted/fast path), on for untrusted LLM output.
2. **Sanitize URL-bearing props** (`href`, `src`, any `*Url`) — reject `javascript:` and `data:`
   schemes to close a stored-XSS vector.
3. **Recursion depth cap.** `A2NodeSchema` (`z.lazy`) and `resolveChildren` recurse with no limit —
   deeply nested LLM JSON is a stack-overflow DoS. Thread a `maxDepth` (e.g. 50) through render.

## P3 — Accessibility (already strong; make it a consumer guarantee)

1. **Dev-mode runtime a11y assertion.** AI-generated JSON can produce unlabeled inputs that authored
   components forbid but nothing enforces at render. Warn (dev only) when an interactive component
   renders without a label or `aria-label`.
2. **Ship an "Accessibility guarantees & your responsibilities" doc page** — a real differentiator
   for an a11y-first OSS library.

## P4 — DX & demo / usability polish

1. **Demo port bug (real).** `Chat.tsx:27` defaults `API_BASE` to `http://localhost:9080`, but the
   agent runs on `6080` (`main.py:57`) and docker-compose injects `6080`. Local dev without the env
   var hits a dead port; `main.py:5`'s docstring also says 9080. Align all three on 6080.
2. **Stale config.** `.env.local` still references `GITHUB_PERSONAL_ACCESS_TOKEN` for a GitHub MCP
   that CLAUDE.md says was removed; `.mypy_cache/` is untracked but unignored (dirties
   `git status`). Prune both.
3. **Demo intent extraction is brittle regex** (`agent.py`). Fine for a demo, but since the showcase
   is "agent generates UI," consider a structured-output / tool-call path. The model is
   `google/gemma-4-12b-qat` via litellm; for a flagship showcase, Claude (e.g. `claude-opus-4-8` or
   `claude-haiku-4-5`) would produce far more reliable structured a2UI. Deliberate decision needed.

## Suggested sequencing

| Milestone | Theme | Items |
| --- | --- | --- |
| 1 | Make it real | P0 #1–3 (CLI + registry + code CI + honest README) |
| 2 | Make it safe to release | P1 #1–4 + P2 #1–3 |
| 3 | Polish & ship | P3 #1–2, P4 #1–3, then cut `v1.0.0` with Changesets |

**Fastest credibility win:** the port fix + stale-config cleanup (P4 #1–2) — small and verifiable.
**Critical path:** the CLI / registry (P0 #1) — the one piece of real engineering standing between
"nice component repo" and "the product the README describes."
