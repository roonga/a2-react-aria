# References

Key projects, protocols, and prior art relevant to a2-react-aria.

---

## AG-UI Protocol

**Repo:** <https://github.com/ag-ui-protocol/ag-ui>  
**License:** MIT  
**Stars:** 14.2k  
**Language breakdown:** TypeScript, Python, Go, Kotlin, Dart, Java (multi-SDK)

### What it is

AG-UI is an open, lightweight, event-based protocol that standardises how AI agents connect to user-facing applications. It fills the gap between:

- **MCP** — gives agents tools
- **A2A** — agent-to-agent communication
- **AG-UI** — brings agents into the UI layer (real-time, bidirectional)

Transport-agnostic: works over SSE, WebSockets, or webhooks with loose event-format matching.

### Key features

- Real-time agentic chat with streaming
- Bidirectional state sync between agent and UI
- **Generative UI** — agents emit structured UI payloads, frontend renders them
- Real-time context enrichment (agent reads live UI state)
- Frontend tool integration
- Human-in-the-loop collaboration

### Supported agent frameworks

LangGraph, CrewAI, Microsoft Agent Framework, Google ADK, AWS Strands, Mastra, Pydantic AI, Agno, LlamaIndex, AG2

### Relevance to a2-react-aria

AG-UI's **Generative UI** feature is the direct integration point.  
An AI agent can emit a2UI JSON as its generative UI payload over the AG-UI protocol.  
`A2Renderer` is then the rendering layer that turns that JSON into accessible React Aria components.

```
AI Agent
   │  (AG-UI protocol — SSE / WebSocket)
   ▼
AG-UI event stream
   │  { type: "generative_ui", payload: { type: "Form", props: {...} } }
   ▼
<A2Renderer node={payload} />
   │
   ▼
Accessible React Aria component
```

This makes a2-react-aria a natural AG-UI UI adapter — agents get a schema-driven, accessible component set without needing to know React.

---

## CopilotKit

**Repo:** <https://github.com/CopilotKit/CopilotKit>  
**License:** MIT  
**Stars:** 34.4k  
**Language breakdown:** TypeScript (78.9%), Python, MDX, CSS

### What it is

CopilotKit is a full-stack SDK for building **agent-native applications** — generative UI systems, agentic chat interfaces, and human-in-the-loop workflows deployable across React, Angular, Vue, React Native, Slack, and Teams.

CopilotKit is also the **creator of the AG-UI Protocol**, which was adopted by Google, LangChain, AWS, and Microsoft.

### Key features

- Customisable chat UI with streaming + tool call display
- **Generative UI** — agents return React components dynamically at runtime
- Shared state layer synchronised between agents and UI
- Human-in-the-loop — agents pause and request user input/confirmation
- Self-learning agents via continuous feedback loops
- Multi-platform: same agent logic deploys to web, mobile, and chat (Slack/Teams)

### Relevance to a2-react-aria

CopilotKit's **Generative UI** layer is where a2UI JSON fits naturally.  
Instead of agents returning raw React JSX (tightly coupled, non-portable), they can emit a2UI JSON — a portable, schema-validated, accessible component description that `A2Renderer` renders.

```
CopilotKit Agent (LangGraph, CrewAI, etc.)
   │
   │  emits: { type: "Button", props: { children: "Approve", variant: "primary" } }
   ▼
<CopilotKit>  →  <A2Renderer node={agentPayload} />
                        │
                        ▼
               <AriaButton variant="primary">Approve</AriaButton>
```

Benefits of pairing:

- Agents produce **framework-agnostic JSON**, not JSX — portable across any frontend
- a2UI schema validates the payload before rendering — no malformed UI from hallucinations
- React Aria ensures the generated UI is **accessible by default**, regardless of what the agent produced
- CopilotKit's human-in-the-loop + a2UI Form/Dialog components are a natural fit for approval flows

---

## Relationship Map

```
                    ┌─────────────────────┐
                    │   AI Agent           │
                    │  (LangGraph, CrewAI, │
                    │   Google ADK, etc.)  │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
         AG-UI Protocol   CopilotKit       Direct API
         (event stream)   (full-stack SDK)  call
              │                │
              └────────────────┘
                               │
                    a2UI JSON payload
                    { type, props, children }
                               │
                               ▼
                    ┌─────────────────────┐
                    │   @a2ui/core         │
                    │   A2Renderer         │
                    │   + Zod validation   │
                    └──────────┬──────────┘
                               │
                               ▼
                    React Aria Components
                    (accessible, styled,
                     user-owned source)
```

---

## Claude AI / MCP Servers for the Stack

MCP servers and Claude Code plugins available for every library in the a2-react-aria stack.  
Install these to give Claude live access to documentation, running components, and test output while building.

### MCP servers by status

| Library | Status | Package / URL | What Claude gains |
|---|---|---|---|
| **React Aria Components** | ✅ Official (Adobe) | `npx @react-aria/mcp@latest` | Browse all RAC docs, fetch component markdown — no auth needed |
| **GitHub** | ✅ Official (GitHub) | `https://api.githubcopilot.com/mcp` (remote, hosted) | Repos, issues, PRs, CI — no local install. Replaces deprecated `@modelcontextprotocol/server-github` |
| **CopilotKit** | ✅ Official (CopilotKit) | `https://mcp.copilotkit.ai/sse` | AG-UI / CopilotKit live API signatures — no auth needed |
| **Storybook** | ✅ Official (Storybook team) | `@storybook/addon-mcp` → `localhost:6006/mcp` | List stories, screenshots, generate stories — needs Storybook running |
| **Vitest** | ⚠️ Community (djankies) | `npx @djankies/vitest-mcp` | AI-safe test runner, structured output, coverage — not official Vitest team |
| **npm registry** | ⚠️ Community (pinkpixel-dev) | `npx @pinkpixel/npm-helper-mcp` | Package search, version checks, audits — not official npm |
| **Biome** | ⚠️ Claude Code plugin | `/plugin install biome@kingstinct-skills` | Lint + format awareness — not official Biome team |
| **Tailwind CSS** | ❌ No official MCP | — | No MCP from Tailwind Labs. Community options have <20 stars — skip |

### React Aria MCP — key detail

Adobe ships an **official** MCP server for React Aria Components.  
No auth required — runs locally via npx:

```bash
# Claude Code
claude mcp add react-aria -- npx @react-aria/mcp@latest

# VS Code
# Add to .vscode/mcp.json
```

Works with Claude Code, Cursor, VS Code, Codex, and Gemini CLI.  
This is the single most impactful MCP for this project — Claude can browse the full RAC API while writing component wrappers without hallucinating props.

### VS Code extension opportunity

The React Aria MCP + Vitest MCP can be surfaced inside the **a2UI VS Code extension** as bundled MCP connections — consumers of the library get Claude-aware tooling out of the box when they install the extension.

### Not yet available

| Library | Status |
|---|---|
| Zod | No official MCP — use npm-helper-mcp for version/changelog queries |
| TypeDoc | No MCP — docs generated locally, no server needed |
| Starlight / Astro | No MCP — check Astro docs site directly |
| Biome (full LSP) | Plugin only — no dedicated MCP server yet |

---

## Further Reading

- [AG-UI Protocol spec](https://github.com/ag-ui-protocol/ag-ui)
- [CopilotKit docs](https://docs.copilotkit.ai)
- [React Aria Components](https://react-aria.adobe.com/)
- [React Aria MCP server](https://react-aria.adobe.com/mcp)
- [shadcn registry docs](https://ui.shadcn.com/docs/registry)
- [Storybook MCP addon](https://storybook.js.org/docs/ai)
- [GitHub MCP server](https://github.com/github/github-mcp-server)
- [Vitest MCP](https://github.com/djankies/vitest-mcp)
