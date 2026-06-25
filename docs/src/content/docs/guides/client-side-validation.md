---
title: Client-Side Validation
description: Validate a2UI nodes in the browser before they reach the renderer.
sidebar:
  order: 8
---

Before passing agent output to `A2Renderer`, validate it. An agent that emits a
node with the wrong prop type, an unknown component name, or a missing required field
will produce a broken UI at best and a runtime crash at worst. Catching it at the
boundary — before any rendering attempt — surfaces a clear, actionable error.

The generated JSON Schema (see [Server-Side Validation](../server-side-validation)) is the
same contract used on the client. Import it as plain JSON and pass it to `createRegistry`.
No Zod, no extra runtime — just a standard JSON Schema file.

## Setup

Generate the schema file for your app:

```bash
npx @a2ra/cli schema
```

Then pass it as the second argument to `createRegistry`:

```tsx
import { createRegistry } from "@a2ra/core"
import { Button } from "./components/a2ui/button"
import { TextField } from "./components/a2ui/text-field"
import schema from "./a2ui-schema.json"

export const registry = createRegistry(
  {
    Button: { component: Button },
    TextField: { component: TextField },
  },
  schema,
)
```

## Validating nodes

Call `registry.validate(nodes)` before rendering. It returns a discriminated union:

```tsx
const result = registry.validate(nodes)

if (!result.success) {
  // result.error describes the first failing node
  throw new Error(`Invalid a2UI nodes: ${result.error}`)
}

// result.data is the typed, validated node list
return <A2Renderer nodes={result.data} registry={registry} onAction={onAction} />
```

`registry.validate` checks two things:

1. **Shape** — props match the JSON Schema for that component type
2. **Registration** — the `type` is present in this registry (not just valid in the schema)

This means a node that is valid for another app's schema but not registered here still fails.
The validator reports which type is missing so the error is immediately actionable.

## What the schema covers

The schema file is standard JSON Schema Draft 7. It covers:

- Every registered component type (built-in and custom)
- All prop types, including enums, optional fields, and nested objects
- Child node arrays where the schema defines them

Add custom components by including their Zod schemas in `lib/registry-schemas.ts` and
re-running `a2ra schema`. See [Custom Components](../custom-components#validate-the-node-shape-optional)
for the full pattern.

## Error handling

Validation errors from agent output should not crash the page. Wrap the validation call
in your error boundary or return a fallback:

```tsx
function AgentBlock({ nodes }) {
  const result = registry.validate(nodes)

  if (!result.success) {
    console.error("Agent emitted invalid nodes:", result.error)
    return <p>Something went wrong. Please try again.</p>
  }

  return <A2Renderer nodes={result.data} registry={registry} onAction={onAction} />
}
```

For the backend equivalent — catching bad nodes at the agent before they are sent —
see [Server-Side Validation](../server-side-validation).
