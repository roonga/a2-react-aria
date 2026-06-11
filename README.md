# a2-react-aria

A React component catalog that renders **a2UI JSON** using **React Aria Components**.
Designed for AI-native applications — agents emit a2UI JSON, `A2Renderer` turns it into
accessible, production-ready UI.

Components are distributed **shadcn-style**: consumers own the source via
`npx a2ui add <component>`. No fighting library internals. Restyle freely.

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
| `@a2ui/core` | `A2Renderer`, component registry, Zod schemas |
| `a2ui` | CLI — add, update, diff components from the registry |
| `a2ui-vscode` | VS Code extension — IntelliSense, live preview, CLI integration |

## Quick start

```bash
# add @a2ui/core
pnpm add @a2ui/core react-aria-components

# add components à la carte (you own the source)
npx a2ui add button
npx a2ui add text-field form dialog
```

```tsx
import { A2Renderer } from "@a2ui/core"

const node = {
  type: "Form",
  children: [
    { type: "TextField", props: { label: "Email" } },
    { type: "Button", props: { variant: "primary", children: "Submit" } },
  ],
}

export default function App() {
  return <A2Renderer node={node} />
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
