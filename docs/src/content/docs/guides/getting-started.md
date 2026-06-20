---
title: Getting Started
description: Get started with a2UI — accessible React Aria components for AI-generated UIs.
---

## What is a2UI?

a2UI is a React component catalog that renders **a2UI JSON** using **React Aria Components**.
Components are distributed [shadcn-style](https://ui.shadcn.com/docs/registry) — you own the source,
you control the styling, and you can customise freely without fighting a library.

## Install

```bash
# 1. Install the renderer and React Aria
pnpm add @a2ra/core react-aria-components

# 2. Initialise the project config
npx @a2ra/cli init

# 3. Add components — source is copied into your project
npx @a2ra/cli add button text-field form
```

## Usage

```tsx
import { A2Renderer, defaultRegistry } from "@a2ra/core"

const node = {
  type: "Form",
  children: [
    { type: "TextField", props: { label: "Email", isRequired: true } },
    { type: "Button", props: { variant: "primary", children: "Submit" } },
  ],
}

export function MyApp() {
  return <A2Renderer node={node} registry={defaultRegistry} />
}
```

`defaultRegistry` includes all 18 built-in components. For a leaner bundle in production,
[create a custom registry](./registry) with only the components you use.

## How it works

```text
AI Agent (LangGraph, Google ADK, CrewAI, plain LLM call, etc.)
   │  emits: { "type": "Form", "props": { ... }, "children": [...] }
   ▼
<A2Renderer node={payload} registry={defaultRegistry} />
   │  validates with Zod · resolves component from registry
   ▼
Accessible React Aria Component
   (source lives in your project — you own it)
```

## Next steps

- [CLI Reference](./cli) — add, update, and diff components
- [Registry](./registry) — custom registries and tree-shaking
- [Agent Integration](./agent-integration) — wiring agents to A2Renderer
