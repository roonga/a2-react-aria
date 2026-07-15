---
title: Registry
description: How the A2UI component registry works and how to build a custom one.
sidebar:
  order: 6
---

`A2Renderer` resolves component types through a **registry**, a `Map<string, ComponentEntry>`
that maps A2UI JSON `type` strings to React components.

## defaultRegistry

The quickest path to a working renderer: pre-registers all 18 built-in components:

```tsx
import { A2Renderer, defaultRegistry } from "@a2ra/core"

<A2Renderer node={node} registry={defaultRegistry} />
```

## Custom registry (production)

For production apps where components were added via the CLI, build a registry from your
local copies for full tree-shaking:

```tsx
import { createRegistry } from "@a2ra/core"
import { Button, ButtonSchema } from "./components/a2ui/button"
import { Form, FormSchema } from "./components/a2ui/form"
import { TextField, TextFieldSchema } from "./components/a2ui/text-field"

const registry = createRegistry({
  Button: { component: Button, schema: ButtonSchema },
  Form: { component: Form, schema: FormSchema },
  TextField: { component: TextField, schema: TextFieldSchema },
})

<A2Renderer node={node} registry={registry} />
```

Only the components in the registry are bundled. Agents that emit unknown types will
hit the error boundary instead of crashing the page.

## Registry-aware validation

Pass a prebuilt JSON Schema via the `jsonSchema` option to get a
`.validate()` method that checks both node shape and allowed types in one call:

```tsx
import { Button, ButtonSchema, createRegistry, TextField, TextFieldSchema } from "@a2ra/core"
import schema from "./a2ui-schema.json"

const registry = createRegistry(
  {
    Button: { component: Button, schema: ButtonSchema },
    TextField: { component: TextField, schema: TextFieldSchema },
  },
  { jsonSchema: schema },
)

const result = registry.validate(nodes)
if (!result.success) throw new Error(`Invalid nodes: ${result.error}`)
```

The schema is generated at dev time with `a2ra schema` and imported as plain JSON.
See [Client-Side Validation](../client-side-validation/) for the full setup.

## Global registry

`registerAllComponents` registers all built-in components into the global singleton.
Useful for apps that call `getRegistry()` in multiple places without prop-drilling:

```tsx
import { registerAllComponents, getRegistry, A2Renderer } from "@a2ra/core"

// Call once at app startup
registerAllComponents()

// Anywhere in your app:
const registry = getRegistry()
<A2Renderer node={node} registry={registry} />
```

## Error fallback

When `A2Renderer` encounters a type not in the registry it throws, caught by `A2ErrorBoundary`.
Pass a `fallback` node to render something instead of nothing:

```tsx
<A2Renderer
  node={node}
  registry={registry}
  fallback={<span>Unknown component</span>}
/>
```

## Adding custom types

Register your own component types alongside the built-ins:

```tsx
import { createRegistry } from "@a2ra/core"
import { MyBanner, MyBannerSchema } from "./components/my-banner"

// Spread defaultRegistry entries and add your own. createRegistry is strict by
// default: every entry needs a Zod schema so untrusted nodes are validated
// before rendering (pass { strict: false } only for trusted, hand-written trees).
const registry = createRegistry({
  ...Object.fromEntries(defaultRegistry),
  MyBanner: { component: MyBanner, schema: MyBannerSchema },
})
```

Or imperatively with `registerComponent` for the global registry:

```tsx
import { registerComponent } from "@a2ra/core"

registerComponent("MyBanner", { component: MyBanner })
```

Agents can then emit `{ "type": "MyBanner", "props": { ... } }` and `A2Renderer` will
resolve it to your custom component.

For the full walkthrough, including connecting a custom component to the action pipeline
and writing a system-prompt description for the agent, see the
[Custom Components guide](../custom-components/).

## Interactive rendering: onAction

When the node list contains form fields and action buttons, pass `onAction` to `A2Renderer`.
It accepts a `nodes` array and wires form-state collection and action firing automatically:

```tsx
import { A2Renderer } from "@a2ra/core"

<A2Renderer nodes={nodes} registry={registry} onAction={handleAction} />
```

Without `onAction`, `A2Renderer` is stateless. With it, all built-in form fields
automatically report their values and all built-in buttons fire the compound string to
`handleAction`. No HOC wrapping or extra setup required.

See [Building a Form Block](../building-a-form-block/) for the full usage guide.
