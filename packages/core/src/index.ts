export type { ButtonNode } from "./components/button"
export { Button, ButtonSchema } from "./components/button"
export type { TextFieldNode } from "./components/text-field"
export { TextField, TextFieldSchema } from "./components/text-field"
// ↑ Component schemas are exported for consumers to validate a2UI JSON before
// passing it to A2Renderer. They are not used internally — see schema/node.ts.
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
