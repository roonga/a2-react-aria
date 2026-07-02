# Survey Manager: Implementation Plan

## Goal

Replace the hardcoded `survey_data.py` with a database-backed CMS. Editors can build surveys,
add typed questions, and define conditional flow rules — all from a UI. The existing `Survey.tsx`
consumer is unchanged.

## Data model (SQLite, new tables)

```sql
CREATE TABLE surveys (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT,
    status      TEXT NOT NULL DEFAULT 'draft',  -- 'draft' | 'published'
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

CREATE TABLE steps (
    id          TEXT PRIMARY KEY,
    survey_id   TEXT NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    slug        TEXT NOT NULL,   -- 'welcome', 'about', 'done', etc.
    title       TEXT NOT NULL,
    position    INTEGER NOT NULL,
    nodes_json  TEXT NOT NULL,   -- A2UI node tree for this step (JSON)
    updated_at  TEXT NOT NULL
);

CREATE TABLE flow_rules (
    id                 TEXT PRIMARY KEY,
    step_id            TEXT NOT NULL REFERENCES steps(id) ON DELETE CASCADE,
    condition_field    TEXT NOT NULL,  -- name prop from a previous step
    condition_values   TEXT NOT NULL   -- JSON array e.g. ["Student", "Not employed"]
);
```

`nodes_json` stores the A2UI subtree for a step directly, avoiding normalising the nested node
tree into rows and keeping the admin API simple.

On first startup, the existing `SURVEY_STEPS` from `survey_data.py` are migrated into the DB
as the seed "Developer Survey 2026".

## API additions (FastAPI)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/admin/surveys` | List surveys (id, title, status, step count) |
| `POST` | `/api/admin/surveys` | Create survey |
| `GET` | `/api/admin/surveys/{id}` | Get survey + ordered steps |
| `PUT` | `/api/admin/surveys/{id}` | Update title / description |
| `DELETE` | `/api/admin/surveys/{id}` | Delete survey + all steps |
| `PUT` | `/api/admin/surveys/{id}/publish` | Toggle published status |
| `POST` | `/api/admin/surveys/{id}/steps` | Add step |
| `PUT` | `/api/admin/surveys/{id}/steps/{step_id}` | Update step (nodes + flow rule) |
| `DELETE` | `/api/admin/surveys/{id}/steps/{step_id}` | Delete step |
| `PUT` | `/api/admin/surveys/{id}/steps/reorder` | Reorder steps (array of step ids) |

`GET /api/survey/steps` stays unchanged but now reads from the published survey in the DB
instead of the Python constant.

## Frontend routes

All admin routes live under `/admin` in the existing `apps/dev-survey` Next.js app.
No separate app, no auth (local dev tool).

```
/admin                                  Survey list + "New Survey" button
/admin/surveys/[id]                     Step list, reorder, publish toggle
/admin/surveys/[id]/steps/[stepId]      Step editor (question builder + flow rule)
/admin/surveys/[id]/preview             Live preview using the real Survey component
```

## Step editor: question builder

The step editor has two panels.

**Left — question list:** ordered list of questions on this step. Drag to reorder. Add button
opens a type picker: `Text`, `RadioGroup`, `Select`, `CheckboxGroup`, `TextField`.

**Right — question form:** props form that varies by selected type:

| Type | Fields |
|---|---|
| `Text` | content, size, weight, align, color |
| `RadioGroup` | label, name, isRequired, option list (add / remove / reorder) |
| `CheckboxGroup` | label, name, option list |
| `Select` | label, name, isRequired, items list |
| `TextField` | label, name, inputType, isRequired |

On save the editor serialises the question list into the A2UI `nodes_json` tree, wrapping
questions in a Card and appending nav buttons (Back / Next) automatically.

A collapsible "JSON preview" pane shows the raw A2UI output for power users.

## Flow rule editor (per step)

Below the question builder, a "Conditional skip" section:

```
Skip this step if  [field dropdown]  is one of  [value chips]
```

- **Field dropdown:** populated from all `name` props found in previous steps.
- **Value chips:** free-text input; known options from RadioGroup / Select are suggested.
- Saving writes a single `flow_rules` row. One rule per step (matches the current `skipIf`
  contract). Multiple rules per step can be added in a later iteration.

## Build order

| Phase | Deliverable |
|---|---|
| 1 | DB schema + migration from `survey_data.py` + admin CRUD endpoints |
| 2 | `/admin` survey list + create / delete + `/admin/surveys/[id]` step list |
| 3 | Step editor: question builder + save to `nodes_json` |
| 4 | Flow rule editor per step |
| 5 | `/admin/surveys/[id]/preview` + publish toggle + wire `/api/survey/steps` to DB |
