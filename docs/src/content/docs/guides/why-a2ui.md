---
title: Why A2UI?
description: The problem with agents emitting JSX, and why a stable JSON schema is a better contract.
sidebar:
  order: 2
---

## The problem with agents emitting JSX

When AI agents need to build UI, the obvious instinct is to emit JSX — but JSX is fragile as
agent output.

- It is tightly coupled to your component library's exact API. Rename a prop and the agent's
  output breaks silently.
- It requires a build step and a sandboxed execution environment to run safely.
- It exposes your internal component signatures to the model, which then hallucinate prop names,
  invalid variant strings, and non-existent components.
- Any refactor on the UI side invalidates the agent's mental model unless you retrain or
  re-prompt.

In practice, agents that emit JSX produce code that compiles but does the wrong thing, or fails
at runtime in ways that are hard to surface back to the agent.

## A2UI: intent over implementation

**A2UI** is a typed JSON vocabulary that separates *what to render* from *how to render it*.

Instead of JSX:

```jsx
<Button variant="primary" onPress={handleSubmit}>
  Submit
</Button>
```

An agent emits A2UI JSON:

```json
{
  "type": "Button",
  "props": {
    "variant": "primary",
    "children": "Submit"
  }
}
```

The agent only needs to know the schema — a short list of component types and their valid props.
It does not need to know which React library you use, how your `onPress` handler is wired, or
anything about your build toolchain.

## Why this works better

**The schema is a stable contract.** Component types and prop names are versioned. You can
refactor the renderer without touching the agent prompt, as long as the schema stays compatible.

**Zod catches mistakes at the boundary.** Every node is validated before rendering. If the model
invents a prop (`"colour": "red"` instead of `"variant": "danger"`), the renderer rejects the
node and can surface a structured error back to the agent — not a silent visual bug.

**Agents produce it reliably.** The schema mirrors real component APIs closely enough that models
generate valid nodes from a short system prompt. It is far simpler than JSX for a model to
produce correctly.

**You own the renderer.** a2ra copies component source into your project
([shadcn-style](/a2-react-aria/guides/getting-started/)). The A2UI schema is the public API;
the rendered output is entirely under your control.

## The component schema

Each component has a Zod schema that defines its valid props. Browse them in the
[Components](/a2-react-aria/components/button/) section. The schema pages show every accepted
prop, its type, and an example node.

A minimal system prompt for an agent looks like:

```text
You may return UI using A2UI JSON. The root node must have a "type" field
matching one of: Button, TextField, NumberField, Checkbox, CheckboxGroup,
RadioGroup, Switch, Select, Form, Dialog, Tooltip, Popover, Menu, Tabs,
Breadcrumb, DatePicker, DateRangePicker, Table, Text, Card, Flex, Grid.

Example:
{
  "type": "Form",
  "children": [
    { "type": "TextField", "props": { "label": "Name", "isRequired": true } },
    { "type": "Button",    "props": { "variant": "primary", "children": "Submit" } }
  ]
}
```

See [Agent Integration](/a2-react-aria/guides/agent-integration/) for wiring this to a real
agent backend.
