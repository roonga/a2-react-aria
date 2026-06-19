---
title: Agent Integration
description: Connect AI agents to A2Renderer using AG-UI or CopilotKit.
---

a2UI is designed as the rendering layer for AI agents. Agents emit a2UI JSON; `A2Renderer`
validates it and turns it into accessible React components — no JSX generation required.

## AG-UI protocol

[AG-UI](https://github.com/ag-ui-protocol/ag-ui) is a lightweight protocol for streaming
structured UI events from agents to frontends over SSE or WebSocket.

### Server (agent)

Emit a `generative_ui` event with an a2UI JSON payload:

```python
yield {
    "type": "generative_ui",
    "payload": {
        "type": "Form",
        "children": [
            { "type": "TextField", "props": { "label": "Search", "name": "q" } },
            { "type": "Button", "props": { "variant": "primary", "children": "Search" } },
        ]
    }
}
```

### Client (React)

```tsx
import { useAgUIStream } from "@ag-ui/react"
import { A2Renderer, defaultRegistry } from "@a2ra/core"

export function AgentUI() {
  const { node } = useAgUIStream("/api/agent")

  if (!node) return null
  return <A2Renderer node={node} registry={defaultRegistry} />
}
```

## CopilotKit

[CopilotKit](https://copilotkit.ai) provides hooks for rendering agent-generated UI inside
React apps. Use `useCopilotAction` to pass the a2UI payload to `A2Renderer`:

```tsx
import { useCopilotAction } from "@copilotkit/react-core"
import { A2Renderer, defaultRegistry } from "@a2ra/core"
import { useState } from "react"

export function CopilotAwareApp() {
  const [node, setNode] = useState(null)

  useCopilotAction({
    name: "render_ui",
    description: "Render an a2UI component tree",
    parameters: [
      { name: "node", type: "object", description: "a2UI JSON node" },
    ],
    handler: ({ node }) => setNode(node),
  })

  if (!node) return null
  return <A2Renderer node={node} registry={defaultRegistry} />
}
```

## Any agent framework

a2UI JSON is plain JSON — any agent that can return structured output can use it.

### LangGraph (Python)

```python
from langchain_core.output_parsers import JsonOutputParser

parser = JsonOutputParser()

node = parser.parse(llm.invoke(
    "Return an a2UI JSON Form node with a TextField and a Button."
))
# node = { "type": "Form", "children": [...] }
```

### Prompt guidance

Include the component schema in the system prompt so the LLM generates valid nodes:

```text
You may return UI using a2UI JSON. The root node must have a "type" field matching
one of: Button, TextField, NumberField, Checkbox, CheckboxGroup, RadioGroup, Switch,
Select, Form, Dialog, Tooltip, Popover, Menu, Tabs, Breadcrumb, DatePicker,
DateRangePicker, Table, Text, Card, Flex, Grid.

Example:
{
  "type": "Form",
  "children": [
    { "type": "TextField", "props": { "label": "Name", "isRequired": true } },
    { "type": "Button", "props": { "variant": "primary", "children": "Submit" } }
  ]
}
```

## Schema validation

`A2Renderer` validates nodes with Zod before rendering. You can also validate on the
server before sending to the client:

```ts
import { safeParseNode } from "@a2ra/core"

const result = safeParseNode(llmOutput)
if (!result.success) {
  console.error(result.error)
  return
}
// result.data is the typed A2Node
```
