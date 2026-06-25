---
title: Agent Integration
description: Connect AI agents to A2Renderer without third-party SDKs.
sidebar:
  order: 7
---

a2UI is designed as the rendering layer for AI agents. Agents emit a2UI JSON; `A2Renderer`
validates it with Zod and turns it into accessible React components. Because a2UI JSON is
plain JSON, any agent that can return structured output works. No third-party SDK required.

## One-shot response

The simplest pattern: call your agent, get a JSON node back, render it.

```tsx
import { useState } from "react"
import { A2Renderer, defaultRegistry } from "@a2ra/core"

export function AgentUI() {
  const [node, setNode] = useState(null)

  async function run() {
    const res = await fetch("/api/agent", { method: "POST" })
    const data = await res.json()
    setNode(data.node)
  }

  return (
    <>
      <button onClick={run}>Ask agent</button>
      {node && <A2Renderer node={node} registry={defaultRegistry} />}
    </>
  )
}
```

## Streaming (Server-Sent Events)

For agents that stream output, parse the final node from the SSE stream and hand it to
`A2Renderer` when the stream closes.

```tsx
import { useState } from "react"
import { A2Renderer, defaultRegistry } from "@a2ra/core"

export function StreamingAgentUI() {
  const [node, setNode] = useState(null)

  async function run() {
    const es = new EventSource("/api/agent/stream")

    es.addEventListener("ui_node", (e) => {
      setNode(JSON.parse(e.data))
      es.close()
    })

    es.onerror = () => es.close()
  }

  return (
    <>
      <button onClick={run}>Ask agent</button>
      {node && <A2Renderer node={node} registry={defaultRegistry} />}
    </>
  )
}
```

Your agent emits an `ui_node` event with the a2UI JSON payload:

```python
# Python (any framework)
yield f"event: ui_node\ndata: {json.dumps(node)}\n\n"
```

### Inline A2UI JSON in text streams

Some agents mix prose and A2UI JSON in a single text stream using `<a2ui-json>` tags.
Use `extractA2ui` to split the completed buffer and `stripStreamingA2ui` to hide the
partial tag while streaming:

```tsx
import { extractA2ui, stripStreamingA2ui } from "@a2ra/core"

// During streaming: strip the open tag so raw markup is not shown:
const visibleText = stripStreamingA2ui(streamingBuffer)

// When the stream ends: extract the node list:
const { plainText, a2uiJson } = extractA2ui(completedBuffer)
// plainText: prose without the <a2ui-json> block
// a2uiJson:  parsed JSON array, or null if no tag was present
```

Agent output format:

```text
I found a table for you.

<a2ui-json>[{"type":"Card","children":[...]}]</a2ui-json>
```

See [Building a Form Block](../building-a-form-block) for a complete streaming + form
integration example.

## Agent-side: generating valid nodes

### LangGraph (Python)

```python
from langchain_core.output_parsers import JsonOutputParser

parser = JsonOutputParser()

node = parser.parse(llm.invoke(
    "Return an a2UI JSON Form node with a TextField and a Button."
))
# { "type": "Form", "children": [...] }
```

### Google ADK / CrewAI / plain LLM

Any model that supports structured or JSON output works. Include the component schema in
your system prompt:

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

Validate agent output against the generated JSON Schema before rendering or sending it.
The schema is standard JSON Schema Draft 7 and works with any conformant validator
in any language.

- **Frontend** — see [Client-Side Validation](../client-side-validation)
- **Agent / backend** — see [Server-Side Validation](../server-side-validation)
