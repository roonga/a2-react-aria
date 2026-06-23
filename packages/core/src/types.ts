import type { ComponentType, ReactNode } from "react"

export interface A2Node {
	type: string
	props?: Record<string, unknown>
	children?: A2Node | A2Node[] | string
}

/** Minimal interface satisfied by both Zod v3 and v4 schema objects. */
export interface SchemaLike {
	safeParse(data: unknown): { success: boolean }
}

export interface ComponentEntry {
	component: ComponentType<Record<string, unknown>>
	schema?: SchemaLike
}

export type ComponentRegistry = Map<string, ComponentEntry>

export interface A2RendererProps {
	/** Single node to render. Use `nodes` for a flat list of nodes. */
	node?: A2Node
	/** Multiple nodes to render as a flat list. Use `node` for a single root node. */
	nodes?: unknown[]
	registry?: ComponentRegistry
	fallback?: ReactNode
	/**
	 * When provided, wraps rendered output in FormState and Action contexts so
	 * form fields collect values and buttons fire action strings back to the caller.
	 */
	onAction?: (text: string) => void
}
