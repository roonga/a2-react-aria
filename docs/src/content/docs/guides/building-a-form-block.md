---
title: Building a Form Block
description: Use A2Renderer with onAction to handle agent-driven forms, collect field values, and fire action strings.
sidebar:
  order: 8
---

When an agent emits a form — a booking widget, a search panel, a multi-step flow — you need
three things on top of basic rendering:

1. **Collect field values** as the user types across multiple inputs
2. **Fire the collected values** back to the agent in a single action string when the user
   submits
3. **Extract A2UI JSON** from the agent's text stream, which may mix prose and UI nodes

`A2Renderer` handles all three. No second component to learn.

## Interactive mode — the onAction prop

Pass `onAction` to `A2Renderer` and it automatically wires form-state collection and action
firing for every component in the rendered tree:

```tsx
import { A2Renderer, createRegistry } from "@a2ra/core"
import { Button } from "./components/a2ui/button"
import { TextField } from "./components/a2ui/text-field"

const registry = createRegistry({
  Button: { component: Button },
  TextField: { component: TextField },
})

function AgentFormBlock({ nodes, onAction }) {
  return <A2Renderer nodes={nodes} registry={registry} onAction={onAction} />
}
```

`onAction(text)` receives the compound action string when the user presses an action button.
Without `onAction`, `A2Renderer` is stateless — no context, no overhead.

## Collecting form field values — withFormState

Wrap any component that has `label`, `defaultValue`, and `onChange` props to make it report
its value up to the nearest `A2Renderer` with `onAction`:

```tsx
import { withFormState } from "@a2ra/core"
import { NumberField } from "./components/a2ui/number-field"
import { Select } from "./components/a2ui/select"
import { TextField } from "./components/a2ui/text-field"

const registry = createRegistry({
  TextField:   { component: withFormState(TextField) },
  Select:      { component: withFormState(Select) },
  NumberField: { component: withFormState(NumberField) },
})
```

`withFormState` works for both string-value fields (`TextField`, `Select`, `RadioGroup`,
`DatePicker`) and number-value fields (`NumberField`). Number values are converted to
strings with template literals before being stored — the action string is always plain text.

`withFormState` seeds the field's `defaultValue` on mount and pipes `onChange` updates into
the context. The component API is otherwise unchanged — existing props pass through normally.

## Firing actions — withAction

Wrap a `Button` (or any component with `onPress`) to fire the collected fields back to the
agent when the user presses it:

```tsx
import { withAction } from "@a2ra/core"
import { Button } from "./components/a2ui/button"

const registry = createRegistry({
  Button: { component: withAction(Button) },
  // ...
})
```

When the user presses the button, `withAction` builds a compound string from every field
collected so far:

```text
Book table | Location: Sydney | Date: 2025-12-24 | Party size: 4
```

The button label becomes the subject; each `label: value` pair follows. Empty fields are
excluded. The compound string is passed to `onAction`.

### Value-based actions

If the agent sets a `value` prop on a Button node, `withAction` fires that string directly
instead of building a compound payload — useful when the button represents a fixed choice
like `"confirm"` or `"cancel"`:

```json
{ "type": "Button", "props": { "value": "cancel", "children": "Never mind" } }
```

The `value` prop is stripped before it reaches the DOM so it does not trigger React warnings.

## Parsing A2UI JSON from text — extractA2ui

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

## Stripping partial tags during streaming — stripStreamingA2ui

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

## Complete example

```tsx
import { useState } from "react"
import { A2Renderer, createRegistry, extractA2ui, stripStreamingA2ui, withAction, withFormState } from "@a2ra/core"
import { Button } from "./components/a2ui/button"
import { Select } from "./components/a2ui/select"
import { TextField } from "./components/a2ui/text-field"

const registry = createRegistry({
  Button:    { component: withAction(Button) },
  TextField: { component: withFormState(TextField) },
  Select:    { component: withFormState(Select) },
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
