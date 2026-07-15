# Plan: SurveyPage and SurveyQuestion Composite Components

> Status: IN PROGRESS
> Created: 2026-07-05

## Summary

Replaces the ad-hoc `Card > [Text title, ...questionNodes, Flex navButtons]` node structure
with two domain composites: `SurveyPage` (page root with heading and optional description) and
`SurveyQuestion` (question wrapper with label, hint text, and required marker). Each step's
`nodes` array becomes a single `SurveyPage` root whose `props.title` is always identical to
`step.title`, making the admin title field and the respondent-facing heading one source of truth.
Navigation buttons (Back, Next, Submit) move out of stored nodes and into the renderer
(`Survey.tsx` and the admin `preview/page.tsx`), so they are structurally invisible to non-technical
authors and cannot be accidentally removed. Composites are registered in a local
`apps/dev-survey` registry overlay; `@a2ra/core` stays generic.

## Architecture

### Node shape: before and after

```text
Before
step.nodes = [
  {
    type: "Card", props: { padding: "lg" },
    children: [
      { type: "Text", props: { as: "h2" }, children: "Step title" },
      { type: "RadioGroup", props: { label: "Q1", name: "q1" }, children: [...] },
      { type: "Flex", props: { gap: "sm", justify: "end" }, children: [
        { type: "Button", props: { value: "__back__" }, children: "Back" },
        { type: "Button", props: { value: "__next__" }, children: "Next" }
      ]}
    ]
  }
]

After
step.nodes = [
  {
    type: "SurveyPage",
    props: { title: "Step title", description?: "Optional intro paragraph" },
    children: [
      {
        type: "SurveyQuestion",
        props: { label: "Q1", description?: "Hint text", required?: true },
        children: { type: "RadioGroup", props: { name: "q1" }, children: [...] }
      }
    ]
  }
]
```

### Data flow

```text
step.title (DB)
  └── SurveyPage.props.title (nodes JSON, always synced by editor on save)
       └── <h2> visible to respondent (rendered by SurveyPage)

Survey.tsx
  ├── A2UIBlock renders SurveyPage → SurveyQuestion → input components
  └── JSX nav bar (Back / Next / Start Survey) rendered below A2UIBlock
       based on step.slug and step position — NOT stored in nodes
```

### New file/directory structure

```text
apps/dev-survey/components/
  survey-composites/
    SurveyPage.tsx          # page root: heading, description, renders children
    SurveyQuestion.tsx      # question wrapper: label, hint, required asterisk
    index.ts                # re-exports both components
```

### Files to create

| File | Purpose |
|---|---|
| `apps/dev-survey/components/survey-composites/SurveyPage.tsx` | Page root composite — renders title as h2, optional description, children |
| `apps/dev-survey/components/survey-composites/SurveyQuestion.tsx` | Question wrapper — renders label, hint, required marker, single input child |
| `apps/dev-survey/components/survey-composites/index.ts` | Barrel re-export |

### Files to modify

| File | Change |
|---|---|
| `apps/dev-survey/components/A2UIBlock.tsx` | Add `SurveyPage` and `SurveyQuestion` to local registry overlay |
| `apps/dev-survey/components/Survey.tsx` | Render nav buttons (Back/Next) as JSX below A2UIBlock; update `evaluateSkip` and `BackendSurveyStep` type for new skip_if group format |
| `apps/dev-survey/app/admin/surveys/[id]/steps/[stepId]/page.tsx` | `buildNodes` emits `SurveyPage`; `extractQuestions` reads `SurveyPage.children`; add optional `description` field to step meta section; add `buildLabelToNameMap` for preview |
| `apps/dev-survey/app/admin/surveys/[id]/preview/page.tsx` | Render nav buttons as JSX below A2UIBlock (same pattern as Survey.tsx) |
| `apps/dev-survey/hooks/useSurveyData.ts` | Update `BackendSurveyStep.skipIf` to support both old `{ field, oneOf }` and new `{ groups_op, groups }` shapes |
| `apps/dev-survey/agent/survey_agent/survey_data.py` | Update seed data to emit `SurveyPage > SurveyQuestion` nodes; remove `_nav()` helper |
| `apps/dev-survey/agent/survey_agent/db.py` | Add startup migration to rewrite all existing `Card`-rooted step nodes to `SurveyPage` format |

## Security

- [ ] Input validation: `SurveyPage.props.title` and `SurveyQuestion.props.label` originate from
  the admin step editor form, which already requires non-empty strings before save. No new
  untrusted inputs added.
- [ ] Authentication / authorisation: Admin routes are gated by existing admin auth middleware.
  No new routes added.
- [ ] SQL / injection: Migration reads and rewrites `nodes` column via parameterised UPDATE. No raw string interpolation.
- [ ] XSS: React JSX auto-escapes all string props. No `dangerouslySetInnerHTML` used. The
  `description` field is plain text, not HTML.
- [ ] Secrets: No secrets involved. N/A.
- [ ] Dependency risk: No new packages. `SurveyPage` and `SurveyQuestion` are plain React
  components using existing imports from `@a2ra/core` and Tailwind CSS.
- [ ] Data exposure: `nodes` JSON is already stored as-is and returned to authenticated admins
  or the public survey endpoint. The new format exposes no additional fields.

## Implementation steps

- [ ] **Step 1 — Create SurveyPage component**
  - Create `apps/dev-survey/components/survey-composites/SurveyPage.tsx`
  - Props interface: `title: string`, `description?: string`, `children: React.ReactNode`
  - Renders: `<div>` wrapping `<h2 className="font-semibold text-xl text-(--color-text)">` for
    title, optional `<p className="text-(--color-textMuted) text-sm">` for description, then children
  - No nav buttons — those are in the renderer
  - Create `apps/dev-survey/components/survey-composites/SurveyQuestion.tsx`
  - Props interface: `label: string`, `description?: string`, `required?: boolean`,
    `children: React.ReactNode`
  - Renders: `<div className="space-y-1">` with `<p>` label row (includes `*` span in
    `text-(--color-danger)` if required), optional description `<p>`, then children
  - Create `apps/dev-survey/components/survey-composites/index.ts` re-exporting both
  - Acceptance: components render in isolation with all prop combinations; no TypeScript errors

- [ ] **Step 2 — Register composites in A2UIBlock**
  - In `apps/dev-survey/components/A2UIBlock.tsx`, import `SurveyPage` and `SurveyQuestion`
    from `./survey-composites`
  - Pass them to `createRegistry()` alongside the existing core components:
    `createRegistry({ Button, Card, ..., SurveyPage, SurveyQuestion })`
  - The `A2Renderer` receives `children` as `ReactNode` for composite nodes — verify the
    renderer passes children through correctly for object-typed children (single child node)
  - Acceptance: `A2UIBlock` resolves `type: "SurveyPage"` and `type: "SurveyQuestion"` without
    an "unknown component" warning in the console

- [ ] **Step 3 — Move nav buttons to Survey.tsx and preview/page.tsx**
  - In `apps/dev-survey/components/Survey.tsx`:
    - Derive `isFirst` from `stepIndex === 0` (welcome step is always first)
    - Below `<A2UIBlock>`, render a nav bar:

      ```tsx
      {!isDone && (
        <div className="flex gap-2 justify-end mt-4">
          {!isWelcome && stepIndex > 0 && (
            <button type="button" onClick={() => handleAction("__back__")}
              className="rounded-md border border-(--color-border) px-4 py-2
                         text-(--color-text) text-sm hover:bg-(--color-backgroundMuted)">
              Back
            </button>
          )}
          <button type="button" onClick={() => handleAction("__next__")}
            className="rounded-md bg-(--color-primary) px-4 py-2
                       text-(--color-textOnPrimary) text-sm
                       hover:opacity-90">
            {isWelcome ? "Start Survey" : "Next"}
          </button>
        </div>
      )}
      ```

    - Remove any dependency on `__next__`/`__back__` action values coming from node Buttons
      (A2UIBlock's `onAction` can remain for custom buttons in nodes but nav is now external)
  - Apply the same nav pattern to `apps/dev-survey/app/admin/surveys/[id]/preview/page.tsx`
  - Acceptance: clicking Back/Next advances/retreats steps; welcome shows only "Start Survey";
    done step shows no nav

- [ ] **Step 4 — Update step editor: buildNodes, extractQuestions, description field**
  - In `apps/dev-survey/app/admin/surveys/[id]/steps/[stepId]/page.tsx`:
    - Add `description` to component state: `const [description, setDescription] = useState("")`
    - On load, read `description` from `nodes[0]` if it is a `SurveyPage` node
    - Add a "Page description" textarea below the title/slug grid (optional field)
    - Rewrite `buildNodes(questions, title, description?)` to emit:

      ```ts
      return [{
        type: "SurveyPage",
        props: { title, ...(description ? { description } : {}) },
        children: questions.map(questionToSurveyQuestionNode),
      }]
      ```

      where `questionToSurveyQuestionNode(q)` wraps `questionToNode(q)` output in a
      `SurveyQuestion` node:

      ```ts
      function questionToSurveyQuestionNode(q: Question): unknown {
        const inner = questionToNode(q)
        if (!inner) return null
        if (q.type === "Text") return inner  // Text blocks are not wrapped in SurveyQuestion
        return {
          type: "SurveyQuestion",
          props: {
            label: q.label ?? "",
            ...(q.isRequired ? { required: true } : {}),
          },
          children: inner,
        }
      }
      ```

    - Remove nav button logic from `buildNodes` entirely
    - Update `extractQuestions(nodes)` to only handle `SurveyPage` root (no legacy Card branch):

      ```ts
      function extractQuestions(nodes: unknown[]): Question[] {
        const root = nodes[0] as Record<string, unknown> | undefined
        if (!root || root.type !== "SurveyPage" || !Array.isArray(root.children)) return []
        const children = (root.children as unknown[]).map((c) => {
          const node = c as Record<string, unknown>
          // Unwrap SurveyQuestion wrapper to expose the inner input node
          return node.type === "SurveyQuestion" ? (node.children as unknown) : c
        })
        return children.map(nodeToQuestion).filter((q): q is Question => q !== null)
      }
      ```

    - On save (`handleSave`): pass `description` to `buildNodes`
    - `buildLabelToNameMap` in the step editor preview already walks arbitrary children;
      verify it recurses into `SurveyQuestion.children` (object, not array) — add a branch
      if needed
  - Acceptance: saving a step with 3 questions produces a `SurveyPage` root node; loading
    that step back round-trips without data loss

- [ ] **Step 5 — Update useSurveyData and Survey.tsx skip evaluation**
  - In `apps/dev-survey/hooks/useSurveyData.ts`:
    - Replace `SkipCondition` / `BackendSurveyStep.skipIf` with `skip_if: unknown` to allow
      both old and new formats through without runtime type errors
  - In `apps/dev-survey/components/Survey.tsx`:
    - Replace `evaluateSkip` with the same dual-format logic already in `preview/page.tsx`:

      ```ts
      function evaluateSkip(step: BackendSurveyStep, answers: SurveyAnswers): boolean {
        const si = step.skip_if as Record<string, unknown> | null | undefined
        if (!si) return false
        // Old format
        if (typeof si.field === "string" && Array.isArray(si.one_of)) {
          const val = answers[si.field]
          return typeof val === "string" && (si.one_of as string[]).includes(val)
        }
        // New multi-group format
        if (Array.isArray(si.groups)) { ... }  // copy from preview/page.tsx
        return false
      }
      ```

    - Rename `step.skipIf` references to `step.skip_if` to match snake_case from the API
  - Acceptance: a step with new `groups_op`/`groups` skip logic is correctly evaluated in
    the live survey renderer

- [ ] **Step 6 — Update survey_data.py seed data**
  - In `apps/dev-survey/agent/survey_agent/survey_data.py`:
    - Remove `_nav(back)` helper function
    - Replace all `Card > [Text h2, questions, Flex nav]` patterns with `SurveyPage > [SurveyQuestion, ...]`
    - Example welcome step seed:

      ```python
      {
        "type": "SurveyPage",
        "props": { "title": "Welcome", "description": "This survey takes 2 minutes." },
        "children": []  # welcome may have no questions; nav is in the renderer
      }
      ```

    - Example question step seed:

      ```python
      {
        "type": "SurveyPage",
        "props": { "title": "About You" },
        "children": [
          {
            "type": "SurveyQuestion",
            "props": { "label": "What is your role?", "required": True },
            "children": {
              "type": "RadioGroup",
              "props": { "name": "role" },
              "children": [
                { "type": "Radio", "props": { "value": "dev", "label": "Developer" } },
                { "type": "Radio", "props": { "value": "pm", "label": "Product Manager" } }
              ]
            }
          }
        ]
      }
      ```

  - Acceptance: fresh `pnpm dev` with a cleared DB seeds correctly; survey renders without errors

- [ ] **Step 6a — DB migration: rewrite existing Card nodes to SurveyPage**
  - In `apps/dev-survey/agent/survey_agent/db.py`, add a `_migrate_nodes_to_survey_page()`
    function and call it once at module init (after the `skip_if_json` migration):

    ```python
    def _card_to_survey_page(nodes: list) -> list:
        """Convert a legacy Card-rooted step to SurveyPage format."""
        if not nodes or not isinstance(nodes[0], dict):
            return nodes
        root = nodes[0]
        if root.get("type") != "Card":
            return nodes  # already migrated or unknown format
        children = root.get("children") or []
        # Strip Text h2 title node and Flex nav rows; keep everything else
        question_nodes = []
        for c in children:
            if not isinstance(c, dict):
                continue
            t = c.get("type")
            # Skip the title Text node (as="h2")
            if t == "Text" and isinstance(c.get("props"), dict) and c["props"].get("as") == "h2":
                continue
            # Skip nav Flex rows (children are all Buttons)
            if t == "Flex":
                kids = c.get("children") or []
                if kids and all(isinstance(k, dict) and k.get("type") == "Button" for k in kids):
                    continue
            question_nodes.append(c)
        # Wrap non-Text nodes in SurveyQuestion
        wrapped = []
        for qn in question_nodes:
            if not isinstance(qn, dict):
                continue
            if qn.get("type") == "Text":
                wrapped.append(qn)
            else:
                props = qn.get("props") or {}
                sq_props = {}
                if props.get("label"):
                    sq_props["label"] = props.pop("label")
                if props.get("isRequired"):
                    sq_props["required"] = True
                    props.pop("isRequired")
                wrapped.append({"type": "SurveyQuestion", "props": sq_props, "children": qn})
        return [{"type": "SurveyPage", "props": {}, "children": wrapped}]

    def _migrate_nodes_to_survey_page() -> None:
        with _conn() as conn:
            rows = conn.execute("SELECT id, nodes FROM steps").fetchall()
            for row in rows:
                try:
                    nodes = json.loads(row["nodes"] or "[]")
                    migrated = _card_to_survey_page(nodes)
                    if migrated is not nodes:  # only write if changed
                        conn.execute(
                            "UPDATE steps SET nodes=? WHERE id=?",
                            (json.dumps(migrated), row["id"]),
                        )
                except (json.JSONDecodeError, TypeError):
                    pass
    ```

  - Call `_migrate_nodes_to_survey_page()` at the bottom of the DB init block, after the
    `skip_if_json` column migration
  - Note: `SurveyPage.props.title` is left empty by the migration; the renderer pulls the
    title from `step.title` (the DB column) — the editor syncs them into `props.title` on
    the next save. This avoids duplicating title data before the admin has a chance to review.
  - Acceptance: restart the Python server against an existing DB; all steps served by the API
    have `nodes[0].type === "SurveyPage"`; no Card-rooted steps remain; the public survey
    and admin preview render correctly without a DB wipe

## Testing plan

### Unit tests

| Subject | Cases to cover |
|---|---|
| `extractQuestions()` | round-trips all question types; Text blocks pass through unwrapped; empty nodes returns `[]` |
| `buildNodes()` | emits SurveyPage root; wraps non-Text questions in SurveyQuestion; title and description propagate into props |
| `_card_to_survey_page()` | Card with title + questions + nav converts correctly; already-SurveyPage nodes returned unchanged; empty nodes returned unchanged |
| `evaluateSkip()` in Survey.tsx | old `{field, one_of}` format; new `{groups_op, groups}` format; null skip_if returns false |

Files: `apps/dev-survey/app/admin/surveys/[id]/steps/[stepId]/page.test.ts`,
`apps/dev-survey/components/Survey.test.ts`,
`apps/dev-survey/agent/survey_agent/test_migration.py`

### Component tests

| Component | Scenarios |
|---|---|
| `<SurveyPage>` | renders title as h2; renders description when provided; omits description when absent; renders children |
| `<SurveyQuestion>` | renders label text; renders required asterisk when `required={true}`; omits asterisk when false; renders description; renders children |

Files: `apps/dev-survey/components/survey-composites/SurveyPage.test.tsx`,
`apps/dev-survey/components/survey-composites/SurveyQuestion.test.tsx`

### E2E tests

- [ ] Admin creates a step, sets title and description, adds a RadioGroup question, saves, reopens,
  and confirms title + description + question options are unchanged (round-trip integrity)
- [ ] Respondent views published survey: title heading matches the step title set in admin;
  Back and Next buttons appear on question steps; only Start Survey appears on welcome;
  no nav on done step

Files: `apps/dev-survey/e2e/survey-composites.spec.ts`

### Axe / accessibility

- [ ] `SurveyPage` and `SurveyQuestion` pass axe in Vitest integration tests (`pnpm test`)
- [ ] Storybook stories for both components pass `@storybook/addon-a11y` (`run-story-tests`) —
  note: no Storybook stories are planned in this PR since these are app-local composites;
  axe will be verified via the Vitest component tests only

## Static code analysis

All checks must be green before the plan is considered done.

- [ ] `pnpm lint` — Biome: zero errors, zero warnings
- [ ] `pnpm lint:md` — markdownlint: zero errors on this plan file
- [ ] `pnpm --filter @a2ra/core exec tsc --noEmit` — zero type errors (core not touched; verify unchanged)
- [ ] `pnpm --filter @a2ra/cli exec tsc --noEmit` — zero type errors (cli not touched; verify unchanged)
- [ ] `pnpm build:registry && git diff --exit-code registry` — registry snapshots up to date (no core changes expected)
- [ ] SonarQube gate: OK, zero new violations

  ```powershell
  $env:SONAR_TOKEN = "<your-sonarqube-token>"
  docker compose -f docker-compose.sonarqube.yml run --rm scanner
  ```

## Definition of done

The plan is complete when:

- [ ] Every implementation step above is checked off
- [ ] All unit and component tests are written and passing (`pnpm test`)
- [ ] Axe gates pass in Vitest
- [ ] All static analysis checks are green
- [ ] A changeset is added — this is a consumer-visible change to `apps/dev-survey` only;
  no changeset is needed for `@a2ra/core` or `@a2ra/cli`
- [ ] A PR is open and CI is green (`/pr` then `/pr-merge`)
