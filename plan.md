# a2-react-aria: Component Catalog Plan

## Goal

A React component catalog that renders **a2UI JSON** using **React Aria** components.  
Each a2UI JSON node maps to a typed, accessible React Aria component.  
Components are **distributed shadcn-style** — consumers own the source, not a black-box package.  
On every push to `main`, a public GitHub Pages docs site auto-updates with API reference and usage examples.  
A dedicated **VS Code extension** gives consumers IntelliSense, live preview, and CLI integration.

---

## Proposed Tech Stack

| Layer | Choice | Version | Why |
|---|---|---|---|
| Build | **Vite** | **8.0.16** | Rolldown-powered (Rust), 10-30x faster builds; unified dev+prod bundler |
| UI Framework | **React** | **19.2.7** | Required for React Aria; concurrent features |
| Language | **TypeScript** | **6.0.3** | Latest stable (7.0 is beta/Go-based, not yet production-ready) |
| Accessible Components | **React Aria Components** | **1.18.0** | Unstyled, WCAG-compliant; 90% fewer deps since hook packages consolidated |
| Styling | **Tailwind CSS** | **4.3.0** | CSS-first config; pairs with RAC renderProps API; user-owned styles |
| Schema Validation | **Zod** | **4.4.3** | v4 significantly faster than v3; use `zod/v4` import path |
| JSON Schema export | **zod-to-json-schema** | latest | Auto-generates `schema.json` from Zod for VS Code IntelliSense + SchemaStore |
| Testing | **Vitest** | **4.1.8** | Vite 8 native; 40% faster on large test suites |
| Testing Utils | **React Testing Library** | **16.3.2** | First-class RAC citizen; query by ARIA roles |
| Linting + Formatting | **Biome** | **2.4.16** | Single binary replaces ESLint + Prettier; stable, fast |
| Monorepo | **pnpm workspaces + Turborepo** | latest | Three packages: `core`, `cli`, `vscode` |

---

## Distribution: shadcn Registry Approach

**Not** `npm install a2-react-aria`. Instead, consumers own the component source.

### How it works

```
Consumer project
      │
      ▼
npx a2ui add button          ← CLI reads registry.json from GitHub
      │
      ├── copies src/components/a2ui/button.tsx into their project
      ├── copies src/components/a2ui/button.a2ui.json (schema)
      ├── installs react-aria-components (peer dep, via npm/pnpm/yarn)
      └── updates a2ui.json (project config)
```

Components live **in the consumer's project** — they own the Tailwind styles and can customise freely.  
`react-aria-components` and `@a2ui/core` are the only true dependencies.

### Consumer experience

```bash
# one-time setup
npx a2ui init

# add components à la carte
npx a2ui add button
npx a2ui add text-field form dialog tabs table

# update a component to latest template
npx a2ui update button

# diff — see what changed before updating
npx a2ui diff button
```

Or, since the registry is shadcn CLI v4 compatible:

```bash
npx shadcn add @a2ui/button    # also works
```

### What gets npm-published

| Package | npm name | Purpose |
|---|---|---|
| `packages/core` | `@a2ui/core` | `A2Renderer`, base types, registry engine, Zod schemas |
| `packages/cli` | `a2ui` | `npx a2ui add/init/update/diff` |
| `packages/vscode` | VS Code Marketplace only | VS Code extension (not npm) |

Component source files are **not published to npm** — they live in the GitHub registry and get copied into consumer projects.

### Registry format (shadcn-compatible)

```json
// registry.json (at repo root, served via GitHub Pages)
{
  "name": "a2ui",
  "homepage": "https://a2ui.dev",
  "items": [
    {
      "name": "button",
      "type": "registry:component",
      "title": "Button",
      "description": "An accessible button backed by React Aria",
      "dependencies": ["react-aria-components"],
      "peerDependencies": ["@a2ui/core"],
      "files": [
        { "path": "components/a2ui/button.tsx", "type": "registry:component" },
        { "path": "components/a2ui/button.a2ui.json", "type": "registry:schema" }
      ]
    }
  ]
}
```

---

## VS Code Extension: a2UI for VS Code

**Extension ID:** `a2ui.a2ui-vscode`  
**Published to:** VS Code Marketplace + Open VSX Registry  
**Purpose:** Consumer DX — IntelliSense, live preview, CLI integration inside the editor

### Features

| Feature | Description |
|---|---|
| **JSON IntelliSense** | Autocomplete `type`, `props`, children in `.a2ui.json` files via Language Server |
| **Hover docs** | Hover a component type → shows description + prop table + screenshot |
| **Diagnostics** | Zod validation errors shown inline as squiggles, without running the app |
| **Live Preview Panel** | Split panel — JSON on left, rendered `<A2Renderer>` component on right |
| **Auto-refresh** | Preview updates on every save |
| **Snippets** | `a2btn`, `a2field`, `a2form`, `a2dialog` → expand to full JSON templates |
| **"Add Component" command** | Command palette → `a2UI: Add Component` → runs `npx a2ui add` |
| **"Open in Playground" command** | Opens the docs playground with current file's JSON preloaded |

### Extension architecture

```
packages/vscode/
├── src/
│   ├── extension.ts          # Entry point — activates LSP + registers commands
│   ├── server/
│   │   └── server.ts         # LSP server process (autocomplete, hover, diagnostics)
│   ├── preview/
│   │   ├── PreviewPanel.ts   # Manages VS Code WebviewPanel lifecycle
│   │   └── webview/          # React app bundled into the extension
│   │       ├── App.tsx       # Renders <A2Renderer node={currentJson} />
│   │       └── main.tsx
│   └── commands/
│       ├── addComponent.ts   # Runs `npx a2ui add` via child_process
│       └── openPlayground.ts # Opens browser to playground with JSON query param
├── snippets/
│   └── a2ui.code-snippets    # a2btn, a2field, a2form, etc.
├── package.json              # VS Code extension manifest (contributes, activationEvents)
├── vite.webview.config.ts    # Vite config — builds webview/App.tsx → dist/webview/
└── tsconfig.json
```

### LSP server responsibilities

```
.a2ui.json file open in editor
           │
           ▼
    LSP Server (server.ts)
           │
     ┌─────┼──────────────┐
     ▼     ▼              ▼
Autocomplete  Hover       Diagnostics
(type values) (prop docs) (Zod parse errors
              + screenshot as squiggles)
```

### Webview preview panel

```
┌─────────────────────────────────────────────────────┐
│  VS Code Editor                                      │
│                                                      │
│  ┌──── button.a2ui.json ────┐  ┌── a2UI Preview ──┐ │
│  │ {                        │  │                   │ │
│  │   "type": "Button",      │  │  ┌─────────────┐ │ │
│  │   "props": {             │  │  │  Click me   │ │ │
│  │     "variant": "primary",│  │  └─────────────┘ │ │
│  │     "children": "Click"  │  │                   │ │
│  │   }                      │  │  ✓ Valid a2UI JSON│ │
│  │ }                        │  └───────────────────┘ │
│  └──────────────────────────┘                        │
└─────────────────────────────────────────────────────┘
```

### Extension tech stack

| Tool | Purpose |
|---|---|
| `vscode` API | Extension host, commands, webview panels |
| `vscode-languageserver-node` | LSP server (autocomplete, hover, diagnostics) |
| `vscode-languageclient` | LSP client wiring (extension host ↔ server) |
| React 19 + Vite 8 | Webview app (preview panel) |
| `@a2ui/core` | A2Renderer used in the webview for live rendering |
| `@clack/prompts` | CLI prompts (used in `packages/cli`) |

---

## Component Showcase / Documentation

Three-layer approach:

### Layer 1 — Storybook 10 (Dev-time Component Explorer)

| Addon | Version | Purpose |
|---|---|---|
| **Storybook** | **10.4.2** | Component stories, controls, variants, states — accessed via browser at `localhost:6006` |
| `@storybook/addon-a11y` | latest | axe-core accessibility audit per story |
| `@storybook/addon-docs` | latest | Auto prop tables from TypeScript types (react-docgen) |

### Layer 2 — Live JSON Playground

```
┌──────────────────────┬──────────────────────┐
│   JSON Editor        │   Live Preview        │
│   (Monaco Editor)    │   <A2Renderer>        │
│                      │                       │
│  {                   │   ┌─────────────┐    │
│    "type": "Button", │   │  Click me   │    │
│    "props": { ... }  │   └─────────────┘    │
│  }                   │                       │
├──────────────────────┴──────────────────────┤
│   Zod validation errors (if any)             │
└─────────────────────────────────────────────┘
```

| Addition | Version | Purpose |
|---|---|---|
| **`@monaco-editor/react`** | **4.7.0** | JSON editing with a2UI schema autocomplete |

### Layer 3 — GitHub Pages Docs Site (Starlight)

| Tool | Version | Purpose |
|---|---|---|
| **Starlight** | latest stable | Docs site; Astro islands embed live React demos |
| **TypeDoc** | **0.28.19** | Auto-generates API reference markdown from TypeScript |
| `typedoc-plugin-markdown` | latest | Outputs TypeDoc as `.md` files Starlight can ingest |
| `starlight-typedoc` | latest | Wires TypeDoc output into the Starlight sidebar |

---

## GitHub Actions CI/CD Pipeline

```
push to main / tag
        │
        ▼
┌─────────────────────────────────────────────┐
│  GitHub Actions: docs.yml                   │
│                                             │
│  1. pnpm install (workspaces)               │
│  2. turbo run lint (biome check)            │
│  3. turbo run test (vitest)                 │
│  4. turbo run build:core                    │
│  5. npx typedoc → docs/api/*.md             │
│  6. turbo run build:storybook               │
│  7. turbo run build:docs (Starlight)        │
│  8. deploy → GitHub Pages                  │
│                                             │
│  On tag push (v*):                          │
│  9.  publish @a2ui/core → npm              │
│  10. publish a2ui (CLI) → npm              │
│  11. publish a2ui.a2ui-vscode → Marketplace│
└─────────────────────────────────────────────┘
```

---

## Architecture

```
a2UI JSON (input)
       │
       ▼
┌─────────────────────┐
│   JSON Validator     │  ← Zod v4 schema per component type
│   (zod/v4 parse)     │     schema.json auto-generated for VS Code + SchemaStore
└─────────────────────┘
       │
       ▼
┌─────────────────────┐
│   Component Resolver │  ← Maps { type: "Button", ... } → <AriaButton>
│   (registry map)     │     registry is user-owned (copied via CLI)
└─────────────────────┘
       │
       ▼
┌─────────────────────┐
│   React Aria         │  ← Renders accessible, Tailwind-styled component
│   Component          │     source lives in consumer's project
└─────────────────────┘
```

---

## Monorepo Structure

```
a2-react-aria/                     # pnpm workspaces + Turborepo
├── packages/
│   ├── core/                      # @a2ui/core (npm published)
│   │   ├── src/
│   │   │   ├── schema/            # Zod v4 schemas per component
│   │   │   ├── registry/          # ComponentRegistry map
│   │   │   ├── renderer/          # <A2Renderer>
│   │   │   └── index.ts
│   │   ├── schema.json            # Auto-generated from Zod (CI step)
│   │   └── package.json
│   │
│   ├── cli/                       # a2ui CLI (npm published as `a2ui`)
│   │   ├── src/
│   │   │   ├── commands/
│   │   │   │   ├── init.ts
│   │   │   │   ├── add.ts
│   │   │   │   ├── update.ts
│   │   │   │   └── diff.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── vscode/                    # VS Code extension (Marketplace only)
│       ├── src/
│       │   ├── extension.ts
│       │   ├── server/server.ts   # LSP
│       │   ├── preview/
│       │   │   ├── PreviewPanel.ts
│       │   │   └── webview/       # React app (Vite sub-build)
│       │   └── commands/
│       ├── snippets/a2ui.code-snippets
│       ├── package.json           # VS Code extension manifest
│       └── vite.webview.config.ts
│
├── apps/
│   ├── sample-adk/                # Google ADK sample — full-stack agent + UI demo
│   │   ├── agent/                 # Python Google ADK agent (non-workspace, pyproject.toml)
│   │   │   ├── pyproject.toml
│   │   │   └── main.py            # Emits a2UI JSON via AG-UI protocol
│   │   ├── src/                   # React frontend
│   │   │   ├── App.tsx            # CopilotKit + <A2Renderer> integration
│   │   │   └── main.tsx
│   │   ├── package.json           # pnpm workspace member (web frontend)
│   │   └── vite.config.ts
│   │
│   └── test-harness/              # End-to-end + accessibility test suite
│       ├── src/
│       │   ├── components/        # Per-component render + interaction tests
│       │   ├── a11y/              # axe-core accessibility audits
│       │   └── e2e/               # Full-stack E2E tests (agent → UI)
│       ├── playwright.config.ts
│       └── package.json           # pnpm workspace member
│
├── registry/                      # shadcn-compatible registry
│   ├── registry.json              # Component index (served via GitHub Pages)
│   └── components/                # Source templates copied by CLI
│       ├── button/
│       │   ├── button.tsx
│       │   └── button.a2ui.json
│       ├── text-field/
│       └── ...
│
├── catalog/                       # Live JSON playground app
│   └── src/Playground.tsx
│
├── docs/                          # Starlight docs site
│   ├── astro.config.mjs
│   └── src/content/
│
├── stories/                       # Storybook 10 stories
├── tests/                         # Cross-package integration tests
├── .storybook/
├── .github/workflows/
│   └── docs.yml
├── .vscode/
│   ├── extensions.json            # Recommends a2ui.a2ui-vscode + stack extensions
│   ├── settings.json              # Biome format-on-save, markdownlint, Tailwind regex
│   └── mcp.json                   # VS Code workspace MCP servers
├── biome.json
├── turbo.json
├── pnpm-workspace.yaml
├── .mcp.json                      # Claude Code project MCP servers (committed)
├── .markdownlint.json             # Markdown lint rules (120 char lines, fenced langs, etc.)
├── CLAUDE.md                      # Claude Code project instructions + rules
├── .claude/
│   └── skills/
│       └── setup/
│           └── SKILL.md           # /setup skill — first-time contributor onboarding
└── plan.md
```

---

## Implementation Phases

### Phase 1 — Monorepo Scaffold & Tooling

- [ ] Init pnpm workspaces + Turborepo
- [ ] Scaffold `packages/core` — Vite 8 + React 19 + TypeScript 6
- [ ] Install React Aria Components 1.18, Tailwind CSS 4.3
- [ ] Configure Biome 2.4 at root (applies to all packages)
- [ ] Configure Storybook 10 with Vite 8 builder
- [ ] Install Vitest 4 + React Testing Library 16
- [ ] Init Starlight docs site in `docs/`
- [ ] Set up TypeDoc + `starlight-typedoc`
- [ ] Add GitHub Actions `docs.yml` workflow
- [ ] Commit `.vscode/extensions.json`, `.vscode/settings.json`, `.vscode/mcp.json`
- [ ] Commit `.mcp.json` (Claude Code project MCP servers)
- [ ] Commit `CLAUDE.md` (project instructions for Claude Code)
- [ ] Commit `.markdownlint.json` (markdown lint rules)
- [ ] Install `markdownlint-cli2` as dev dep; add `lint:md` + `format:md` scripts

### Phase 2 — Core Package

- [ ] Define `A2Node`, `A2NodeMap` base types
- [ ] Implement `ComponentRegistry` (type-safe Map)
- [ ] Implement `<A2Renderer>` — recursive, handles children
- [ ] Add Zod v4 validation + error boundaries
- [ ] Wire `zod-to-json-schema` CI step → `schema.json`
- [ ] Submit `schema.json` to SchemaStore.org under `*.a2ui.json` pattern

### Phase 3 — Component Library (Registry)

Implement each component as styled RAC wrapper + Zod schema + registry entry:

- [ ] Button
- [ ] TextField / TextArea
- [ ] Select / ComboBox
- [ ] Checkbox / CheckboxGroup
- [ ] RadioGroup
- [ ] Switch
- [ ] DatePicker / DateRangePicker
- [ ] Dialog / Modal
- [ ] Tabs
- [ ] Table
- [ ] Breadcrumb
- [ ] Tooltip / Popover
- [ ] Menu / MenuTrigger
- [ ] Form (layout container)
- [ ] Grid / Flex layout nodes

### Phase 4 — CLI Package

- [ ] Scaffold `packages/cli` with `@clack/prompts` + `commander`
- [ ] `a2ui init` — creates `a2ui.json`, installs `@a2ui/core`
- [ ] `a2ui add <component>` — fetches from registry, copies files, installs deps
- [ ] `a2ui update <component>` — updates component to latest template
- [ ] `a2ui diff <component>` — shows diff before updating
- [ ] `a2ui list` — lists available + installed components
- [ ] Make registry shadcn CLI v4 compatible (`npx shadcn add @a2ui/button`)
- [ ] Publish `a2ui` to npm

### Phase 5 — Catalog & Showcase

- [ ] Storybook story per component: variants, states, accessibility
- [ ] Monaco JSON Playground (`catalog/`)
- [ ] Register `schema.json` in Monaco for autocomplete
- [ ] Shareable playground URLs (JSON → query param encoding)
- [ ] Accessibility audit pass with axe addon

### Phase 6 — Docs Site & CI

- [ ] Starlight guides: Getting Started, JSON Schema Reference, Theming, CLI Reference
- [ ] TypeDoc auto-generates `/api/` on every push
- [ ] Storybook static build embedded at `/stories/`
- [ ] Full GitHub Actions pipeline: lint → test → typedoc → storybook → starlight → Pages

### Phase 7 — VS Code Extension

- [ ] Scaffold `packages/vscode` — extension host + LSP + webview sub-build
- [ ] LSP server: autocomplete (`type` values + `props` per type)
- [ ] LSP server: hover (component description + prop table)
- [ ] LSP server: diagnostics (Zod parse errors as squiggles)
- [ ] Webview preview panel: React app rendering `<A2Renderer>`
- [ ] Auto-refresh preview on file save
- [ ] Command: `a2UI: Add Component` (runs `npx a2ui add` in terminal)
- [ ] Command: `a2UI: Open in Playground` (opens browser with JSON query param)
- [ ] Snippet file: `a2btn`, `a2field`, `a2form`, `a2dialog`, etc.
- [ ] Publish to VS Code Marketplace + Open VSX Registry
- [ ] Add `a2ui.a2ui-vscode` to `.vscode/extensions.json` recommendations

### Phase 8 — Release

- [ ] Publish `@a2ui/core` to npm
- [ ] Publish `a2ui` CLI to npm
- [ ] Publish VS Code extension to Marketplace
- [ ] Tag v1.0.0

### Phase 9 — Test Harness

End-to-end and accessibility tests that validate the full rendering pipeline.

**Tech:** Playwright (Microsoft, 70k+ stars), `@axe-core/playwright` (official Deque Systems).

```
apps/test-harness/
├── src/
│   ├── components/   # Per-component: render, keyboard nav, ARIA attributes
│   ├── a11y/         # axe-core sweeps against all components + A2Renderer output
│   └── e2e/          # Full-stack: real agent payload → rendered UI assertions
└── playwright.config.ts
```

- [ ] Scaffold `apps/test-harness` — Playwright + `@axe-core/playwright`
- [ ] Per-component render tests (does `A2Renderer` output the correct DOM?)
- [ ] Keyboard navigation tests (Tab order, Enter/Space activation, Escape)
- [ ] ARIA attribute tests (roles, labels, states match WCAG intent)
- [ ] axe-core sweep against every component in every state
- [ ] E2E test: POST a2UI JSON → assert rendered output matches snapshot
- [ ] CI integration — run `test-harness` on every PR
- [ ] Add `test:e2e` script to root `package.json`

### Phase 10 — Sample Google ADK App

A runnable reference integration showing the full agent → UI pipeline.

**Stack:**

| Layer | Choice | Notes |
|---|---|---|
| Agent | Python + Google ADK | Emits a2UI JSON as Generative UI payload |
| Protocol | AG-UI (SSE) | Transport between agent and browser |
| Frontend SDK | CopilotKit | AG-UI consumer; provides `useCopilotAction` hook |
| Renderer | `@a2ui/core` A2Renderer | Turns a2UI JSON into accessible React Aria UI |
| Styling | Tailwind CSS 4 | Same tokens as the component library |

```
apps/sample-adk/
├── agent/            # Python — not a pnpm workspace member
│   ├── pyproject.toml
│   └── main.py       # ADK agent: responds to user prompt with a2UI JSON payload
└── web/              # React frontend — pnpm workspace member
    ├── src/
    │   ├── App.tsx   # <CopilotKit> + useCoAgent + <A2Renderer>
    │   └── main.tsx
    ├── package.json
    └── vite.config.ts
```

**What the demo shows:**

```
User types: "Show me a login form"
        │
        ▼
Google ADK agent (Python)
        │  emits AG-UI event:
        │  { type: "generative_ui", payload: { type: "Form", ... } }
        ▼
CopilotKit (AG-UI SSE consumer)
        │  passes payload to React via useCoAgent
        ▼
<A2Renderer node={payload} />
        │
        ▼
Accessible React Aria Form (Label, TextField, Button)
```

- [ ] Scaffold Python ADK agent in `apps/sample-adk/agent/`
- [ ] Agent emits a2UI JSON for: Form, Button, TextField, Dialog
- [ ] Scaffold React frontend in `apps/sample-adk/web/`
- [ ] Wire CopilotKit AG-UI runtime to A2Renderer
- [ ] Demo scenarios: login form, approval dialog, data table, settings panel
- [ ] `README.md` — one-command startup: `uv run agent` + `pnpm dev`
- [ ] Add to CI: lint + type-check only (agent start skipped in CI)

---

## Key Decisions & Rationale

**shadcn registry over traditional npm package**  
Users own the component source — they can restyle, extend, or fork any component without fighting library internals. `react-aria-components` and `@a2ui/core` are the only true dependencies. Updates are opt-in via `a2ui diff` + `a2ui update`. This mirrors how the best design systems work in 2026.

**Monorepo (pnpm + Turborepo)**  
Three outputs (`@a2ui/core`, `a2ui` CLI, VS Code extension) share types and the component source. Turborepo caches builds — CI only rebuilds what changed.

**VS Code extension with LSP**  
The JSON language server approach (not just schema) enables dynamic completions — e.g. showing only the props valid for the selected `type`, not all props from all components. Schema-only approach can't do this.

**Biome over ESLint + Prettier (and over Vite+ for now)**  
New project, no legacy config. One `biome.json`. Vite+ (MIT, free for OSS) is the future — migrate when it hits 1.0.

**Starlight over VitePress / Docusaurus**  
Astro islands = live React demos natively. Pagefind search needs no account. `starlight-typedoc` wires TypeDoc output in with zero glue.

**TypeDoc for API auto-docs**  
Reads TypeScript source + JSDoc, emits markdown. Runs in CI — always current.

**TypeScript 6.0 not 7.0 beta**  
TS 7.0 (`tsgo`) is beta. Migrate when stable.

**Zod v4 import path**  
`import { z } from "zod/v4"`. Faster parse. `zod-to-json-schema` generates `schema.json` for VS Code + SchemaStore.

**Monaco Editor for Playground**  
Schema-aware JSON editing for free once `schema.json` is registered.

**`apps/` for samples and test harness (not `packages/`)**  
`packages/` is reserved for publishable npm artifacts. Apps that are never published
(`sample-adk`, `test-harness`) go in `apps/` — the same convention used by Turborepo's
own starter templates and large open-source monorepos.

**Playwright for E2E (not Cypress)**  
Playwright is the current industry default: multi-browser, auto-waits, official axe integration,
Microsoft backing. `@axe-core/playwright` is the official Deque bridge for WCAG auditing in
Playwright tests — essential for validating that A2Renderer output is actually accessible.

**Google ADK for the sample (not LangGraph or CrewAI)**  
Google ADK has first-class AG-UI protocol support and is rapidly gaining adoption.
The sample deliberately uses a Python agent to show language-agnosticism —
the a2UI JSON schema works regardless of what stack generates it.
