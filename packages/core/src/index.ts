export { createRegistry, getRegistry, registerComponent } from "./registry/registry"
export { A2ErrorBoundary } from "./renderer/A2ErrorBoundary"
export { A2Renderer } from "./renderer/A2Renderer"
export type { A2NodeInput } from "./schema"
export { A2NodeSchema, parseNode, safeParseNode } from "./schema"
export type {
	A2Node,
	A2RendererProps,
	ComponentEntry,
	ComponentRegistry,
} from "./types"

export const VERSION = "0.1.0"
