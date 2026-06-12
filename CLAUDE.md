# a2-react-aria

A React component catalog that renders **a2UI JSON** using **React Aria Components**.
Components are distributed shadcn-style — consumers own the source via `npx a2ui add <component>`.

## Rules

### Package / library / tool / MCP approval

**Before suggesting or using any package, library, tool, MCP server, or VS Code extension,
you MUST verify it meets one of these criteria:**

| Criteria | Threshold |
| --- | --- |
| **Official** | Maintained by the primary org/company behind the tool (e.g. Adobe for `@react-aria/mcp`, GitHub for their MCP server) |
| **Popular — npm package** | ≥ 5,000 GitHub stars AND/OR ≥ 500,000 weekly npm downloads |
| **Popular — MCP server** | ≥ 1,000 GitHub stars (MCP ecosystem is newer, lower bar applies) |
| **Popular — VS Code extension** | ≥ 500,000 installs on the VS Code Marketplace |
| **Explicitly approved** | User has reviewed and approved it in this session or it appears in the approved list below |

**If a package does not meet any threshold: stop, state the concern, and ask for approval before proceeding.**

Do not assume popularity. Check GitHub stars or npm downloads before recommending anything not already in this project.

#### Approved community packages (explicitly reviewed)

| Package | Stars / Installs | Approved reason |
| --- | --- | --- |
| `@djankies/vitest-mcp` | community MCP | Reviewed and approved — best available vitest MCP |
| `@pinkpixel/npm-helper-mcp` | community MCP | Reviewed and approved — no official npm MCP exists |

### Storybook MCP — component authoring

When `pnpm storybook` is running the `storybook` MCP server is live at `http://localhost:6006/mcp`.

**Never invent component props or story variants.** Always verify against the live docs before writing code:

1. Call `list-all-documentation` at the start of any component or story task to discover available IDs.
2. Call `get-documentation` with the ID to read actual props, variants, and usage examples.
3. Call `get-storybook-story-instructions` before creating or editing a story.
4. Call `preview-stories` after every change and include the returned URLs in your response.
5. Call `run-story-tests` after every change and fix failures before reporting success.

If the storybook server is not running, state that clearly rather than guessing.

### Markdown

- All `.md` files must pass `markdownlint` (rules in `.markdownlint.json`)
- 120 character line limit (tables and code blocks exempt)
- Fenced code blocks must declare a language
- Consistent heading hierarchy — no skipped levels

## Architecture

- `packages/core` — `@a2ui/core`: A2Renderer, registry, Zod schemas
- `packages/cli` — `a2ui` CLI: add/update/diff components from the registry
- `packages/vscode` — VS Code extension: IntelliSense, live preview, CLI integration
- `registry/` — shadcn-compatible component templates (not npm-published)
- `docs/` — Starlight docs site (auto-deployed to GitHub Pages on push)

## First-time setup (after cloning)

> **Shortcut:** run `/setup` in Claude Code to automate all steps below.

### 1. Install dependencies

```bash
pnpm install
pnpm run build
```

### 2. Install the Biome Claude Code plugin (once per machine)

```bash
/plugin install biome@kingstinct-skills
```

### 3. MCP servers — automatic

`.mcp.json` is committed to the repo. Claude Code reads it automatically when you open this project.
On first use each server shows a **⏸ Pending approval** prompt — approve each one once.

The `react-aria`, `copilotkit`, and `github` servers start immediately (no local service needed).
The `storybook` server only works when `pnpm storybook` is running.

### 4. VS Code extensions — semi-automatic

Open the project in VS Code. You will see a prompt:
**"Do you want to install the recommended extensions?"** → click **Install All**.

This installs: Biome, Tailwind IntelliSense, Vitest, axe linter, Error Lens, Pretty TS Errors, GitLens, Import Cost, markdownlint.

### 5. GitHub MCP authentication

The GitHub MCP server uses `https://api.githubcopilot.com/mcp`.

- **VS Code**: sign in with your GitHub account — no token needed.
- **Claude Code standalone**: set `GITHUB_PERSONAL_ACCESS_TOKEN` in your shell env or `.env.local`.

## Key commands

```bash
pnpm dev              # Vite dev server
pnpm storybook        # Storybook on :6006
pnpm test             # Vitest
pnpm lint             # Biome check
pnpm format           # Biome format
pnpm typedoc          # Generate API reference docs
```

## MCP servers

MCP servers are pre-configured in `.mcp.json` and activate automatically when you open this project in Claude Code.

| Server | Status | What it gives Claude |
| --- | --- | --- |
| `react-aria` | Official (Adobe) | Full RAC docs — use before writing any component wrapper |
| `github` | Official (GitHub hosted) | Repo, PR, CI management — VS Code: GitHub login; standalone: `GITHUB_PERSONAL_ACCESS_TOKEN` |
| `copilotkit` | Official (CopilotKit) | AG-UI / CopilotKit API signatures and integration patterns |
| `storybook` | Official (Storybook team) | Story listing, screenshots, component docs — needs `pnpm storybook` running first |
| `vitest` | Community (approved) | AI-safe test runner, structured output, coverage analysis |
| `npm-registry` | Community (approved) | Package search, version checks, vulnerability audits |

## Claude Code plugins

No plugins required for this project.

Biome runs via `pnpm lint` / `pnpm format` — Claude Code calls these directly.
The Biome VS Code extension (`biomejs.biome`) handles editor-side feedback.
No third-party plugin marketplace is needed.

## Environment variables

Copy `.env.example` to `.env.local` for local secrets.
Never commit tokens — `.env.local` is gitignored.

```text
GITHUB_PERSONAL_ACCESS_TOKEN=   # Required for github MCP server
```

## Linting and formatting

Biome handles all linting, formatting, and import sorting. One config file: `biome.json`.
Format on save is pre-configured in `.vscode/settings.json`.

Run manually:

```bash
pnpm lint          # Check only
pnpm lint --fix    # Fix auto-fixable issues
pnpm format        # Format all files
```

## Adding a new component

1. Create the component in `registry/components/<name>/`
2. Add the Zod schema in `packages/core/src/schema/components/<name>.ts`
3. Register it in `packages/core/src/registry/index.ts`
4. Add a Storybook story in `stories/<name>.stories.tsx`
5. Update `registry/registry.json` with the new entry
6. Run `pnpm typedoc` to regenerate API docs

## Markdown rules

- All `.md` files are linted with markdownlint (rules in `.markdownlint.json`)
- Format with Prettier via `pnpm format:md`
- Line length: 120 chars max
- No trailing spaces, consistent heading levels, fenced code blocks must specify language
