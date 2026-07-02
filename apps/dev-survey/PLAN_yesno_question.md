# Plan: Yes/No Question Type

> Status: DRAFT
> Created: 2026-07-03

## Summary

Adds a `YesNo` convenience question type to the Survey Manager step editor. It renders
as a `RadioGroup` with two fixed options (`yes` / `no`) in the A2UI JSON, so no new
`@a2ra/core` component is required. The editor gains a `+YesNo` button in the question
type picker; the form for a YesNo question shows only label, field name, and required
toggle (no free-text options textarea, since the options are fixed). The flow rule editor
already reads options from the prior step's questions, so `yes` and `no` will be offered
as auto-suggestions immediately. Because YesNo serialises as a standard `RadioGroup` node,
it is fully backwards-compatible with the existing survey renderer and the public
`GET /api/survey/steps` endpoint requires no change.

## Architecture

YesNo is a **pure editor convenience type**: it lives in the client-side `QuestionType`
union, is created by the `+YesNo` button, and serialises to a `RadioGroup` A2UI node
with `Radio` children `"yes"` and `"no"`. When a step is reloaded the editor will show
it as a RadioGroup (since round-trip detection is intentionally omitted to avoid
ambiguity with user-authored RadioGroups that happen to have yes/no options). This
trade-off is acceptable for a local admin tool.

```text
Editor state                A2UI JSON (stored in DB / served to Survey.tsx)
──────────────────────────────────────────────────────────────────────────
{ type: "YesNo",          → { type: "RadioGroup",
  label: "…",                 props: { label: "…", name: "…", isRequired: true },
  name: "…",                  children: [
  isRequired: true }            { type: "Radio", props: { value: "yes" }, children: "yes" },
                                { type: "Radio", props: { value: "no" },  children: "no"  }
                              ] }
```

Flow rule editor: `prevStepNames` already maps `q.options` for RadioGroup questions,
so a YesNo field will expose `["yes", "no"]` as dropdown suggestions automatically.

### Files to create

None.

### Files to modify

| File | Change |
|---|---|
| `apps/dev-survey/app/admin/surveys/[id]/steps/[stepId]/page.tsx` | All logic changes (type, serialise, form, picker) |

## Security

- [x] Input validation: label and name fields are free-text strings, validated by the
  existing `StepUpdate` Pydantic model on the backend. No new input surface.
- [x] Authentication / authorisation: N/A — local dev tool, no auth layer.
- [x] SQL / injection: no DB changes; existing parameterised queries unchanged.
- [x] XSS: Next.js escapes React-rendered values by default; no `dangerouslySetInnerHTML`.
- [x] Secrets: N/A — no secrets involved.
- [x] Dependency risk: no new dependencies.
- [x] Data exposure: serialised node is a standard RadioGroup; no new fields exposed.

## Implementation steps

Each step is a single committed unit. A step is done when its code is committed, linted,
type-checked, and its own tests pass.

- [ ] **Step 1 — Add `YesNo` to the editor type system**
  - In `page.tsx` line 10, add `"YesNo"` to the `QuestionType` union.
  - Add `YesNo: "Yes / No"` to `TYPE_LABELS`.
  - In `addQuestion`, handle `"YesNo"` by pre-populating
    `{ options: ["yes", "no"], isRequired: true }`.
  - In `questionToNode`, add a `"YesNo"` branch that produces the same node as
    `"RadioGroup"` but with hardcoded `["yes", "no"]` options (ignores `q.options`).
  - Add `"YesNo"` to the type picker button array so the `+YesNo` button appears.
  - Acceptance: `pnpm lint` and `pnpm --filter @a2ra/core exec tsc --noEmit` pass;
    clicking `+YesNo` in the editor adds a question whose JSON preview shows a
    `RadioGroup` node with two Radio children `"yes"` and `"no"`.

- [ ] **Step 2 — Add the `YesNo` question form**
  - In `QuestionForm`, add a `q.type === "YesNo"` branch that renders:
    label input, field-name input, required checkbox. No options textarea (fixed).
  - Show a read-only hint: "Renders as Yes / No radio options".
  - Acceptance: selecting a YesNo question shows the simplified form; saving
    persists the correct RadioGroup node in the DB (verify via JSON preview toggle).

- [ ] **Step 3 — Verify flow rule integration**
  - Add a YesNo question to a step, save, then open a later step's flow rule editor.
  - Confirm the YesNo field appears in the field dropdown and "yes" / "no" are
    offered as value suggestions.
  - No code change required if the existing `prevStepNames` logic works correctly
    (it reads `q.options` which will be `["yes", "no"]`). If it does not, fix
    `prevStepNames` to also handle YesNo questions explicitly.
  - Acceptance: flow rule `{ field: "fieldName", one_of: ["yes"] }` is saved and
    the step is correctly skipped in the preview page.

## Testing plan

### Unit tests

| Subject | Cases to cover |
|---|---|
| `questionToNode({ type: "YesNo", label: "Employed?", name: "employed", isRequired: true })` | Returns `RadioGroup` node with `label`, `name`, `isRequired: true`, and two Radio children with values `"yes"` and `"no"` |
| `questionToNode({ type: "YesNo", label: "…", name: "…" })` | Options are always `["yes", "no"]` regardless of `q.options` content |
| `addQuestion("YesNo")` initial state | `options` is `["yes", "no"]`, `isRequired` is `true` |

Files: `apps/dev-survey/app/admin/surveys/[id]/steps/[stepId]/page.test.ts`
(create this file; extract and unit-test `questionToNode` and `nodeToQuestion` as
pure functions — they have no DOM dependency so Vitest can run them without jsdom.)

### Component tests

| Component | Scenarios |
|---|---|
| `QuestionForm` with `type="YesNo"` | Renders label input, field-name input, required checkbox; does NOT render an options textarea; shows the read-only hint text |
| `QuestionForm` with `type="YesNo"` | `onChange` fires with updated label when label input changes |

Files: `apps/dev-survey/app/admin/surveys/[id]/steps/[stepId]/page.test.tsx`
(extend the above test file with component tests using `@testing-library/react`.)

### E2E tests

- [ ] User clicks `+YesNo` in the step editor, sets label to "Are you employed?" and
  field name to "employed", saves, and re-opens the step — JSON preview shows a
  `RadioGroup` with Radio children `"yes"` and `"no"`.
- [ ] User opens a later step's flow rule editor, selects "employed" from the field
  dropdown, and "yes" / "no" appear as value suggestions.
- [ ] Survey preview: answering "yes" to the YesNo question triggers the correct
  conditional skip on the following step.

Files: `apps/dev-survey/tests/survey-manager.spec.ts` (extend existing spec or create
if it does not exist).

### Axe / accessibility

- [ ] `QuestionForm` with `type="YesNo"` passes axe in Vitest (all `htmlFor`/`id` pairs
  must be present — label, name, required inputs).
- [ ] The rendered `RadioGroup` in the survey preview passes axe (handled by React Aria
  Components; no new markup needed).

## Static code analysis

- [ ] `pnpm lint` — Biome: zero errors, zero warnings
- [ ] `pnpm lint:md` — markdownlint: zero errors on this plan file
- [ ] `pnpm --filter @a2ra/core exec tsc --noEmit` — zero type errors (core not changed,
  but run to confirm no cross-package regressions)
- [ ] `pnpm build:registry && git diff --exit-code registry` — registry unchanged
- [ ] SonarQube gate: OK, zero new violations

  ```powershell
  $env:SONAR_TOKEN = "sqa_92caaa7a83b4d17546d60c1fa62b42d93afd6316"
  docker compose -f docker-compose.sonarqube.yml run --rm scanner
  ```

## Definition of done

- [ ] Every implementation step above is checked off
- [ ] All unit, component, and E2E tests are written and passing (`pnpm test`)
- [ ] Axe gates pass in Vitest integration tests
- [ ] All static analysis checks are green
- [ ] No changeset needed (change is internal to `apps/dev-survey`, not a published package)
- [ ] A PR is open and CI is green (`/pr` then `/pr-merge`)
