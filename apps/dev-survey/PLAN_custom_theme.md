# Plan: Survey Custom Theme

> Status: DRAFT
> Created: 2026-07-03

## Summary

Adds a per-survey custom theme to the Survey Manager. Survey editors can override the
eight core design tokens (`--color-primary`, `--color-background`, `--color-surface`,
`--color-text`, `--color-text-muted`, `--color-border`, `--color-background-muted`,
`--color-primary-foreground`) from a Theme panel on the survey detail admin page. The
chosen values are stored as a JSON blob in a new `theme_json` column on the `surveys`
table and served to consumers via `GET /api/survey/steps`. The public survey page and the
admin preview page both apply the theme as inline CSS custom property overrides on the
survey wrapper element, so all `@a2ra/core` components pick them up automatically without
any changes to the component library itself.

## Architecture

Theme data flows as follows:

```text
Admin (theme editor)
  └─ PUT /api/admin/surveys/{id}  { theme: { "--color-primary": "#..." } }
       └─ db.update_survey()  →  surveys.theme_json

Public survey consumer
  GET /api/survey/steps
    └─ { steps: [...], theme: { "--color-primary": "#..." } }
         └─ useSurveyData() returns { steps, theme, isLoading, error }
              └─ page.tsx  →  <main style={cssVarOverrides}><Survey /></main>

Admin preview
  GET /api/admin/surveys/{id}
    └─ { ..., theme: {...} }
         └─ preview/page.tsx  →  <div style={cssVarOverrides}><A2UIBlock ... /></div>
```

All override application is a single `Object.fromEntries(Object.entries(theme).map(...))` call
producing a React `style` prop — no new CSS files, no new components, no runtime injected
`<style>` tags.

### Tokens exposed in the theme editor

| Token | Controls |
|---|---|
| `--color-primary` | buttons, focus rings, progress bar, active radio/checkbox |
| `--color-primary-foreground` | text on primary buttons |
| `--color-background` | page/input background |
| `--color-surface` | card background |
| `--color-text` | body text |
| `--color-text-muted` | secondary/placeholder text |
| `--color-border` | input/card borders |
| `--color-background-muted` | subtle highlight backgrounds |

The theme editor uses `<input type="text">` for each token so any valid CSS color value
(hex, oklch, hsl, named colour) can be entered. A live colour swatch next to each input
shows the parsed colour. Hover/active token variants (`--color-primary-hover`, etc.) are
intentionally not exposed — they are derived colours and rarely need independent overrides.

### Files to create

None.

### Files to modify

| File | Change |
|---|---|
| `apps/dev-survey/agent/survey_agent/db.py` | Add `theme_json` column migration; update `get_survey`, `update_survey`, `get_published_steps`, `_maybe_seed` |
| `apps/dev-survey/agent/survey_agent/admin_routes.py` | Add `theme` field to `SurveyUpdate`; return `theme` in `get_survey` and `update_survey` |
| `apps/dev-survey/agent/main.py` | Include `theme` in `GET /api/survey/steps` response |
| `apps/dev-survey/hooks/useSurveyData.ts` | Add `theme` to `UseSurveyDataResult` and API response type |
| `apps/dev-survey/hooks/useAdminData.ts` | Add `theme` to `Survey` and `SurveyDetail` interfaces; accept `theme` in `updateSurvey` |
| `apps/dev-survey/app/page.tsx` | Read theme from `useSurveyData`, apply as `style` on wrapper |
| `apps/dev-survey/components/Survey.tsx` | Accept optional `theme` prop and apply on wrapper div |
| `apps/dev-survey/app/admin/surveys/[id]/page.tsx` | Add Theme panel with token inputs + save |
| `apps/dev-survey/app/admin/surveys/[id]/preview/page.tsx` | Apply `survey.theme` as CSS var overrides on preview wrapper |

## Security

- [x] Input validation: theme values are free-form CSS colour strings. The backend stores
  them as-is in a JSON blob (no SQL injection risk — they are never concatenated into SQL;
  parameterised queries used throughout). On the frontend, the values are applied as React
  `style` props (not `innerHTML`), so only syntactically valid CSS properties are applied
  by the browser. Invalid colour values are silently ignored by the browser.
- [x] Authentication / authorisation: N/A — local dev tool, no auth layer.
- [x] SQL / injection: `theme_json` is stored and retrieved via parameterised queries;
  `json.dumps` / `json.loads` used for serialisation.
- [x] XSS: theme values are applied via React's `style` prop object (React escapes all
  style values), not via `dangerouslySetInnerHTML` or injected `<style>` tags. No XSS risk.
- [x] Secrets: N/A — no secrets involved.
- [x] Dependency risk: no new dependencies.
- [x] Data exposure: `theme` is non-sensitive presentation data; it is intentionally served
  publicly via `GET /api/survey/steps` so the public survey can apply it.

## Implementation steps

- [ ] **Step 1 — DB migration and theme CRUD**
  - In `db.py` `init()`, add a migration after `CREATE TABLE IF NOT EXISTS`:

    ```python
    conn.execute("ALTER TABLE surveys ADD COLUMN theme_json TEXT NOT NULL DEFAULT '{}'")
    # wrapped in try/except OperationalError to handle already-migrated DBs
    ```

  - Update `get_survey()` to parse `theme_json` and return `theme: dict` in the result.
  - Update `update_survey()` to accept an optional `theme: dict | None` param; if provided,
    serialise with `json.dumps` and store in `theme_json`.
  - Update `get_published_steps()` to also return `theme` from the survey row.
  - Acceptance: `sqlite3` shell confirms `theme_json` column exists on new and existing DBs;
    `GET /api/admin/surveys/{id}` returns `"theme": {}` for an existing survey.

- [ ] **Step 2 — API: expose theme on public and admin endpoints**
  - In `admin_routes.py`, add `theme: dict | None = None` to `SurveyUpdate`.
  - In `update_survey` route, pass `theme=body.theme` to `db.update_survey`.
  - In `get_survey` route, the dict returned by `db.get_survey()` already includes `theme`
    after Step 1; no route change needed.
  - In `main.py` `get_steps()`, change return to
    `{"steps": result["steps"], "theme": result["theme"]}` using a new `db.get_published_survey()`
    helper (or extend `get_published_steps()` to return both steps and theme).
  - Acceptance: `GET /api/survey/steps` returns `{ "steps": [...], "theme": {} }`;
    `PUT /api/admin/surveys/{id}` with `{ "theme": { "--color-primary": "#e11d48" } }` stores
    and returns the theme correctly.

- [ ] **Step 3 — Apply theme in the public survey and admin preview**
  - In `useSurveyData.ts`, add `theme: Record<string, string>` to the API response type
    and to `UseSurveyDataResult`. Default to `{}` if absent.
  - In `app/page.tsx`, read `theme` from `useSurveyData()` (via `Survey` component) or
    fetch it separately. Simpler: pass `theme` down as a prop to `Survey` and apply on the
    wrapper `<main>` with `style={theme}`.
  - In `Survey.tsx`, accept `theme?: Record<string, string>` prop. Apply on the outermost
    wrapper `<div>` as `style={theme}`. The `useSurveyData()` hook already fetches the data
    internally; expose `theme` from the hook and thread it to the wrapper.
  - In `preview/page.tsx`, `survey` is a `SurveyDetail` (from `useAdminData`). After Step 2
    adds `theme` to the response, apply `survey.theme` as `style` on the preview wrapper div.
  - Acceptance: set `--color-primary` to red (`#e11d48`) on a survey; public survey at `/`
    and admin preview both show red buttons and focus rings without any page reload of CSS files.

- [ ] **Step 4 — Theme editor UI in the admin survey detail page**
  - In `app/admin/surveys/[id]/page.tsx`, add a collapsible "Theme" section below the step list.
  - State: `const [theme, setTheme] = useState<Record<string, string>>(survey.theme ?? {})`.
  - Render one row per exposed token (table in Architecture section). Each row:
    `<label>` + `<input type="text">` pre-filled with `theme[token] ?? ""` + a `<div>`
    colour swatch (`backgroundColor: theme[token]`) for live preview.
  - "Save Theme" button calls `adminApi.updateSurvey(id, { theme })` and shows success/error.
  - "Reset" button sets all tokens to `""` (empty string = inherit from `:root`).
  - Acceptance: editing `--color-primary` to `oklch(0.6 0.2 30)`, saving, then opening the
    admin preview shows the updated primary colour. Resetting and saving reverts to defaults.

## Testing plan

### Unit tests

| Subject | Cases to cover |
|---|---|
| `db.update_survey(id, theme={"--color-primary": "#e11d48"})` | Stored and returned correctly; empty dict clears overrides |
| `db.get_published_steps()` | Returns `theme` dict alongside steps; defaults to `{}` when no theme set |
| DB migration (Step 1) | `ALTER TABLE` succeeds on a DB without the column; is a no-op on a DB that already has it |

Files: `apps/dev-survey/agent/tests/test_db_theme.py` (new)

### Component tests

| Component | Scenarios |
|---|---|
| Theme editor in survey detail page | Renders 8 token rows; input change updates local state; Save calls `adminApi.updateSurvey` with correct theme dict; Reset sets all values to empty string |
| `Survey` with `theme` prop | Wrapper div has inline style with the expected CSS variables; no style attr when theme is empty |
| `PreviewPage` with theme | Wrapper applies `survey.theme` as inline style |

Files: `apps/dev-survey/__tests__/theme.test.tsx` (new)

### E2E tests

- [ ] Admin sets `--color-primary` to `#e11d48` (red), saves; admin preview shows red
  primary buttons and radio indicators.
- [ ] Publish the themed survey; public survey at `/` shows the red primary colour.
- [ ] Reset theme (all empty), save; public survey reverts to the default blue primary.

Files: `apps/dev-survey/tests/theme.spec.ts` (new)

### Axe / accessibility

- [ ] Theme editor rows pass axe — every `<input>` has a `<label>` with matching `htmlFor`/`id`.
- [ ] Changing `--color-text` to a low-contrast value does not break the axe gate (axe runs
  in jsdom without CSS; colour-contrast check only applies in Storybook which uses the real
  `.storybook/tailwind.css` tokens, not overrides from this feature).

## Static code analysis

- [ ] `pnpm lint` — Biome: zero errors, zero warnings
- [ ] `pnpm lint:md` — markdownlint: zero errors on this plan file
- [ ] `pnpm --filter @a2ra/core exec tsc --noEmit` — zero type errors (core not changed)
- [ ] `pnpm --filter @a2ra/cli exec tsc --noEmit` — zero type errors (cli not changed)
- [ ] `pnpm build:registry && git diff --exit-code registry` — registry unchanged
- [ ] SonarQube gate: OK, zero new violations

  ```powershell
  $env:SONAR_TOKEN = "<your-sonar-token>"
  docker compose -f docker-compose.sonarqube.yml run --rm scanner
  ```

## Definition of done

- [ ] Every implementation step above is checked off
- [ ] All unit, component, and E2E tests are written and passing (`pnpm test`)
- [ ] Axe gates pass in Vitest integration tests
- [ ] All static analysis checks are green
- [ ] No changeset needed (change is internal to `apps/dev-survey`, not a published package)
- [ ] A PR is open and CI is green (`/pr` then `/pr-merge`)
