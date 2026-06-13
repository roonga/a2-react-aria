---
name: setup
description: >
  First-time repository setup for a new contributor. Installs dependencies,
  configures Claude Code plugins, verifies MCP servers, sets up environment
  variables, and runs an initial build. Use when someone has just cloned the
  repo or when the dev environment needs a full reset.
---

## Setup — a2-react-aria

Run each step in order. Report the result of each step before moving to the next.
If any step fails, stop and explain what went wrong before continuing.

---

### Step 1 — Prerequisites check

Run the following and report the versions found:

```text
!node --version
!pnpm --version
```

If `node` is missing: tell the user to install Node.js 20 LTS from <https://nodejs.org>.
If `pnpm` is missing: run `npm install -g pnpm` to install it, then re-check.
If both pass: continue.

---

### Step 2 — Install dependencies

```bash
pnpm install
```

Report how many packages were installed. If it fails, show the full error.

---

### Step 3 — Build all packages

```bash
pnpm run build
```

This builds `@a2ui/core`, the CLI, and the VS Code extension webview.
Report success or any build errors.

---

### Step 4 — Environment variables

Check whether `.env.local` exists:

```text
!test -f .env.local && echo "EXISTS" || echo "MISSING"
```

If **MISSING**: copy the example file:

```bash
cp .env.example .env.local
```

Then tell the user:
> `.env.local` created. No secrets are required for the current MCP servers.

If **EXISTS**: skip — do not overwrite.

---

### Step 5 — Biome (no plugin needed)

Biome runs via pnpm scripts — no Claude Code plugin required.
The VS Code extension (`biomejs.biome`, 750k installs) handles editor-side feedback.
Claude Code calls Biome through `pnpm lint` and `pnpm format` directly.

Verify Biome will be available once packages are installed:

```text
!test -f package.json && echo "READY_AFTER_INSTALL" || echo "NOT_SCAFFOLDED_YET"
```

If `NOT_SCAFFOLDED_YET`: note that `pnpm install` in Step 2 must run first.
If `READY_AFTER_INSTALL` or packages already installed: confirm `pnpm lint` will invoke Biome. ✅

---

### Step 6 — MCP server status

Show the current state of all configured MCP servers:

```text
!claude mcp list
```

For each server showing **⏸ Pending**:
Tell the user to approve it by running:

```bash
claude mcp approve <server-name>
```

Or they can approve interactively by using the server once — Claude Code will prompt for approval automatically.

Expected servers (all defined in `.mcp.json`):

| Server | Transport | Notes |
|---|---|---|
| `react-aria` | stdio (npx) | Official Adobe — always available |
| `copilotkit` | sse (remote) | Official CopilotKit — always available |
| `storybook` | http (local) | Needs `pnpm storybook` running first |
| `vitest` | stdio (npx) | Community (approved) — always available |
| `npm-registry` | stdio (npx) | Community (approved) — always available |

---

### Step 7 — VS Code extensions

Check whether VS Code is available:

```text
!code --version 2>/dev/null && echo "VSCODE_FOUND" || echo "VSCODE_NOT_FOUND"
```

If **VSCODE_FOUND**: tell the user:
> Open this project in VS Code (`code .`) and click **"Install All"** when prompted with the recommended extensions banner.
>
> Extensions installed: Biome, Tailwind IntelliSense, Vitest, axe Accessibility Linter, Error Lens,
> Pretty TypeScript Errors, GitLens, Import Cost, markdownlint.

If **VSCODE_NOT_FOUND**: skip this step silently.

---

### Step 8 — Verify dev server

Run a quick smoke test to confirm the build is healthy:

```bash
pnpm run build --dry-run 2>/dev/null || pnpm run build
```

If it passes, the environment is ready.

---

### Summary

Print a summary table of what was completed:

| Step | Status |
|---|---|
| Node.js + pnpm | report version or error |
| `pnpm install` | ✅ / ❌ |
| `pnpm build` | ✅ / ❌ |
| `.env.local` | created / already existed |
| Biome plugin | installed / already installed |
| MCP servers | N approved, N pending |
| VS Code extensions | prompted / skipped |

Then tell the user:
> **You're set up.** Key commands:
>
> - `pnpm dev` — Vite dev server
> - `pnpm storybook` — Storybook on :6006 (also enables the Storybook MCP)
> - `pnpm test` — Vitest
> - `pnpm lint` — Biome check
>
> See `CLAUDE.md` for the full command reference and project rules.
