# Restaurant Booking Demo

A working ADK sample that shows how to consume `@a2ra/core` in an agent-driven application.

A Python ADK agent handles the restaurant booking conversation. When it needs to show results
(search listings, available times, confirmation), it emits a2UI JSON wrapped in `<a2ui-json>`
tags. The Next.js frontend strips the tags, parses the JSON, and renders the nodes using
`A2Renderer` from `@a2ra/core`.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) running
- [LM Studio](https://lmstudio.ai/) installed with `google/gemma-4-12b-qat` loaded and the
  local server started on port 1234

## Quick start

```bash
cd apps/demo
docker compose up --build
```

| Service | URL | Purpose |
| --- | --- | --- |
| Web UI | <http://localhost:6001> | Chat interface |
| Agent API | <http://localhost:6080> | ADK FastAPI server |
| Logs | <http://localhost:6888> | Dozzle log viewer |

## Try it

Open <http://localhost:9001> and type:

```text
Italian restaurants in Sydney for 2 people tonight
```

Then follow the conversation to pick a restaurant, choose a time, and confirm your booking.

## How it works

```text
Chat UI  →  POST /run_sse  →  ADK agent  →  tool call  →  Python builds a2UI JSON
                                                              ↓
                          SSE stream  ←  <a2ui-json>[...]</a2ui-json> in response text
                                ↓
                   A2UIBlock.tsx extracts the JSON array
                                ↓
                   A2Renderer renders each node using @a2ra/core registry
```

## Key file: `web/components/A2UIBlock.tsx`

This is the consumer pattern — importing and using `@a2ra/core` just like any other npm package:

```tsx
import { A2Renderer, Button, ButtonSchema, Card, createRegistry, Flex, Grid, Text } from "@a2ra/core"

const registry = createRegistry({ Button: { component: Button, schema: ButtonSchema }, ... })

export default function A2UIBlock({ nodes }) {
  return nodes.map((node, i) => <A2Renderer key={i} node={node} registry={registry} />)
}
```

> **Note:** This demo uses `"@a2ra/core": "workspace:*"` because it lives inside the
> monorepo. Once the package is published to npm, replace that with
> `npm install @a2ra/core` and remove the `transpilePackages` entry in `next.config.ts`.

## Running the agent locally (without Docker)

```bash
cd apps/demo/agent
cp .env.example .env          # edit OPENAI_BASE_URL if needed
uv sync
uv run python main.py
```

Agent API at <http://localhost:6080>.
