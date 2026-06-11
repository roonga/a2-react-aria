---
title: Getting Started
description: Get started with a2UI — accessible React Aria components for AI-generated UIs.
---

## What is a2UI?

a2UI is a React component catalog that renders **a2UI JSON** using **React Aria Components**.
Components are distributed [shadcn-style](https://ui.shadcn.com/docs/registry) — you own the source.

## Install

```bash
npx a2ui init
npx a2ui add button
```

## Usage

```tsx
import { A2Renderer } from "@a2ui/core"

const node = {
  type: "Button",
  props: { variant: "primary" },
  children: "Click me",
}

export function MyApp() {
  return <A2Renderer node={node} />
}
```

## AG-UI integration

a2UI is the natural rendering layer for AI agents using the
[AG-UI protocol](https://github.com/ag-ui-protocol/ag-ui).
Agents emit a2UI JSON; `A2Renderer` turns it into accessible components.
