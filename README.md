# a2-react-aria

A React component catalog that renders **a2UI JSON** using **React Aria Components**.
Designed for AI-native applications — agents emit a2UI JSON, `A2Renderer` turns it into
accessible, production-ready UI.

Components are distributed **shadcn-style**: consumers own the source via
`npx @a2ra/cli add <component>`. No fighting library internals. Restyle freely.

## How it works

```text
AI Agent (LangGraph, Google ADK, CrewAI, etc.)
   │  emits: { "type": "Form", "props": { ... }, "children": [...] }
   │  via AG-UI protocol or CopilotKit
   ▼
<A2Renderer node={payload} />
   │  validates with Zod · resolves component from registry
   ▼
Accessible React Aria Component
   (source lives in your project — you own it)
```

## Packages

| Package | Description |
|---|---|
| `@a2ra/core` | `A2Renderer`, component registry, Zod schemas |
| `@a2ra/cli` | CLI — `init`, `list`, `add`, `diff` components from the registry |
| `@a2ra/vscode` | VS Code extension — IntelliSense, live preview, CLI integration _(planned)_ |

## Quick start

```bash
# 1. install the renderer + React Aria
pnpm add @a2ra/core react-aria-components

# 2. create an a2ra.json config (sets your components directory)
npx @a2ra/cli init

# 3. add components à la carte — the source is copied into your project, you own it
npx @a2ra/cli add button
npx @a2ra/cli add text-field form dialog
```

The CLI copies each component's source (component, styles, schema, barrel) into the directory
configured in `a2ra.json` (default `components/a2ui/`) and prints the npm dependencies to install.

## CLI

| Command | Description |
|---|---|
| `a2ra init` | Create `a2ra.json` (sets `componentsDir` and optional registry override) |
| `a2ra list` | List the components available in the registry |
| `a2ra add <component...>` | Copy one or more components into your project |
| `a2ra diff [component]` | Compare installed components against the registry |

Useful flags: `--dir <path>` (override target directory), `--overwrite` (replace existing files),
`--registry <url-or-path>` (use an alternative or local registry). The registry location also
honours the `A2RA_REGISTRY` environment variable.

```tsx
import { A2Renderer, defaultRegistry } from "@a2ra/core"

const node = {
  type: "Form",
  children: [
    { type: "TextField", props: { label: "Email" } },
    { type: "Button", props: { variant: "primary", children: "Submit" } },
  ],
}

export default function App() {
  return <A2Renderer node={node} registry={defaultRegistry} />
}
```

`defaultRegistry` includes every built-in component. For production apps where you've added components
via the CLI and want a leaner bundle, pass a custom registry instead:

```tsx
import { A2Renderer, createRegistry } from "@a2ra/core"
import { Form } from "./components/a2ui/form"
import { TextField } from "./components/a2ui/text-field"
import { Button } from "./components/a2ui/button"

const registry = createRegistry({
  Form: { component: Form },
  TextField: { component: TextField },
  Button: { component: Button },
})

export default function App() {
  return <A2Renderer node={node} registry={registry} />
}
```

## AI agent integration

a2UI JSON is the portable, schema-validated alternative to returning raw JSX from agents.

- **AG-UI protocol** — emit a2UI JSON as a `generative_ui` event over SSE or WebSocket
- **CopilotKit** — use `useCopilotAction` to pass agent payloads directly to `<A2Renderer>`
- **Any agent framework** — LangGraph, Google ADK, CrewAI, Pydantic AI, AWS Strands, and more

## Development

```bash
pnpm install
pnpm build       # build all packages
pnpm test        # Vitest
pnpm lint        # Biome
pnpm storybook   # component explorer on :6006
```

## Contributing

See [CLAUDE.md](CLAUDE.md) for architecture, rules, and development setup.

## License

MIT — [Ravi Mohan](https://github.com/roonga)
