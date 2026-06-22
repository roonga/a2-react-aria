---
title: Custom Components
description: Register your own components alongside the built-in a2UI library.
sidebar:
  order: 8
---

The registry accepts any React component, not just the 18 built-in types.
A star-rating widget, a map picker, a file upload zone: if you can write a React component
for it, you can teach the agent to emit it.

## Create the component

Write a normal React component. Props become the agent-controlled surface. Keep them
serialisable (strings, numbers, booleans) so the agent can produce them from JSON.

```tsx
// components/custom/FeedbackSurvey.tsx
interface FeedbackSurveyProps {
  title?: string
  description?: string
  submitLabel?: string
  onSubmit?: (rating: number, comment: string) => void
}

export function FeedbackSurvey({ title, submitLabel, onSubmit }: FeedbackSurveyProps) {
  // ...your UI
}
```

## Register it

Add the component to your registry alongside the built-ins:

```tsx
import { createRegistry, defaultRegistry } from "@a2ra/core"
import { FeedbackSurvey } from "./components/custom/FeedbackSurvey"

const registry = createRegistry({
  ...Object.fromEntries(defaultRegistry),
  FeedbackSurvey: { component: FeedbackSurvey },
})
```

The `type` key in the registry (`"FeedbackSurvey"`) is what the agent must emit.

## Connect to the action pipeline

If the component needs to send data back to the agent (e.g. a form submission), read
`ActionContext` and call `fire()` with the result string.

`A2BlockRenderer` provides this context automatically, so you do not need to wire it yourself.

```tsx
import { ActionContext } from "@a2ra/core"
import { useContext } from "react"
import { FeedbackSurvey } from "./FeedbackSurvey"

function FeedbackSurveyCard({ title, description, submitLabel, commentPlaceholder }) {
  const ctx = useContext(ActionContext)

  return (
    <FeedbackSurvey
      title={title}
      description={description}
      submitLabel={submitLabel}
      commentPlaceholder={commentPlaceholder}
      onSubmit={(rating, comment) => {
        const stars = "★".repeat(rating) + "☆".repeat(5 - rating)
        const text = comment
          ? `Feedback: ${stars} (${rating}/5) — ${comment}`
          : `Feedback: ${stars} (${rating}/5)`
        ctx?.fire(text)
      }}
    />
  )
}
```

Register the wrapper instead of the bare component:

```tsx
const registry = createRegistry({
  ...Object.fromEntries(defaultRegistry),
  FeedbackSurvey: { component: FeedbackSurveyCard },
})
```

## Teach the agent

Add a description of the component to your system prompt so the agent knows it exists:

```text
You may also emit a FeedbackSurvey component after completing a booking:

{
  "type": "FeedbackSurvey",
  "props": {
    "title": "How was your experience?",
    "description": "Optional prompt text shown below the title.",
    "submitLabel": "Send feedback",
    "commentPlaceholder": "Any comments? (optional)"
  }
}

All props are optional. Emit this after every confirmed booking.
```

The agent will then include the node in its A2UI JSON output and `A2BlockRenderer`
resolves it to your component.

## Validate the node shape (optional)

If you want server-side validation before the node reaches the client, write a Zod schema
and call `safeParseNode`:

```ts
import { z } from "zod"

const FeedbackSurveySchema = z.object({
  type: z.literal("FeedbackSurvey"),
  props: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    submitLabel: z.string().optional(),
    commentPlaceholder: z.string().optional(),
  }).optional(),
})
```

Custom schemas are validated independently. They are not part of the `safeParseNode`
built-in set, which only covers the 18 core components.
