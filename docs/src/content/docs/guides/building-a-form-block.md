---
title: Building a Form Block
description: Use A2Renderer with onAction to handle agent-driven forms, collect field values, and fire action strings.
sidebar:
  order: 9
---

When an agent emits a form (a booking widget, a search panel, or a multi-step flow) you need
three things on top of basic rendering:

1. **Extract A2UI JSON** from the agent's text stream, which may mix prose and UI nodes
2. **Collect field values** as the user types across multiple inputs
3. **Fire the collected values** back to the agent in a single action string when the user
   submits

`A2Renderer` handles all three. No second component to learn, no HOC wrapping required.

## Parsing A2UI JSON from text: extractA2ui

Agents often embed A2UI JSON inside a prose response. `extractA2ui` parses the
`<a2ui-json>…</a2ui-json>` tag and splits the text cleanly:

```ts
import { extractA2ui } from "@a2ra/core"

const { plainText, a2uiJson } = extractA2ui(agentResponse)
// plainText: the prose without the tag
// a2uiJson:  parsed JSON array, or null if no tag was found
```

Agent output format:

```text
I've found three tables for you.

<a2ui-json>[{"type":"Card","children":[...]}]</a2ui-json>
```

## Stripping partial tags during streaming: stripStreamingA2ui

While the agent is still streaming, the `<a2ui-json>` tag may be incomplete. Pass the
streaming buffer through `stripStreamingA2ui` before showing it in the UI to avoid
displaying raw tag markup:

```ts
import { stripStreamingA2ui } from "@a2ra/core"

// Inside your streaming render:
const visibleText = stripStreamingA2ui(streamingBuffer)
// If the buffer contains an open <a2ui-json> tag with no closing tag,
// everything from that tag onward is removed.
```

Once the stream ends, call `extractA2ui` on the complete buffer to extract the final node list.

## Interactive mode: the onAction prop

Pass `onAction` to `A2Renderer` and all built-in form fields and buttons automatically
wire themselves to form-state collection and action firing:

```tsx
import { A2Renderer, createRegistry } from "@a2ra/core"
import { Button, ButtonSchema } from "./components/a2ui/button"
import { Select, SelectSchema } from "./components/a2ui/select"
import { TextField, TextFieldSchema } from "./components/a2ui/text-field"

const registry = createRegistry({
  Button:    { component: Button, schema: ButtonSchema },
  TextField: { component: TextField, schema: TextFieldSchema },
  Select:    { component: Select, schema: SelectSchema },
})

function AgentFormBlock({ nodes, onAction }) {
  return <A2Renderer nodes={nodes} registry={registry} onAction={onAction} />
}
```

`onAction(text)` receives the compound action string when the user presses an action button.
Without `onAction`, `A2Renderer` is stateless with no context or overhead.

## How it works

When `onAction` is provided, `A2Renderer` internally wraps the rendered tree with
`FormStateContext` and `ActionContext`. Built-in components read from these contexts
automatically:

- **Form fields** (`TextField`, `Select`, `RadioGroup`, `NumberField`, `DatePicker`) seed
  their `defaultValue` into the context on mount and report every `onChange` update.
- **`Button`** reads from `ActionContext` on press. If the agent set a `value` prop on the
  button node, that string is fired directly. Otherwise the button label is passed through
  `buildAction`, which collects all current field values into a compound string.

When `onAction` is absent, none of this context is provided and the components behave
exactly as standalone React components.

## Action string format

When the user presses a button, `onAction` receives a compound string:

```text
Book table | Location: Sydney | Date: 2025-12-24 | Party size: 4
```

The button label is the subject. Each `label: value` pair for filled fields follows,
separated by ` | `. Empty fields are excluded.

### Value-based actions

If the agent sets a `value` prop on a Button node, that string is fired directly instead
of building a compound payload. This is useful for fixed choices like `"confirm"` or `"cancel"`:

```json
{ "type": "Button", "props": { "value": "cancel", "children": "Never mind" } }
```

The `value` prop is not passed to the DOM, so it does not trigger React warnings.

## Complete example

```tsx
import { useState } from "react"
import { A2Renderer, createRegistry, extractA2ui, stripStreamingA2ui } from "@a2ra/core"
import { Button, ButtonSchema } from "./components/a2ui/button"
import { Select, SelectSchema } from "./components/a2ui/select"
import { TextField, TextFieldSchema } from "./components/a2ui/text-field"

const registry = createRegistry({
  Button:    { component: Button, schema: ButtonSchema },
  TextField: { component: TextField, schema: TextFieldSchema },
  Select:    { component: Select, schema: SelectSchema },
})

export function AgentChat() {
  const [messages, setMessages] = useState([])
  const [streaming, setStreaming] = useState("")

  async function send(userText) {
    const es = new EventSource(`/api/agent/stream?q=${encodeURIComponent(userText)}`)
    let buffer = ""

    es.addEventListener("delta", (e) => {
      buffer += e.data
      setStreaming(buffer)
    })

    es.addEventListener("done", () => {
      es.close()
      const { plainText, a2uiJson } = extractA2ui(buffer)
      setMessages((prev) => [...prev, { role: "assistant", content: plainText, a2uiJson }])
      setStreaming("")
    })
  }

  async function handleAction(text) {
    // text is the compound field string, e.g. "Book table | Location: Sydney | ..."
    await send(text)
  }

  const visibleStreaming = stripStreamingA2ui(streaming)

  return (
    <div>
      {messages.map((msg, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: messages have no stable IDs
        <div key={i}>
          <p>{msg.content}</p>
          {msg.a2uiJson && (
            <A2Renderer nodes={msg.a2uiJson} registry={registry} onAction={handleAction} />
          )}
        </div>
      ))}
      {visibleStreaming && <p>{visibleStreaming}</p>}
    </div>
  )
}
```
