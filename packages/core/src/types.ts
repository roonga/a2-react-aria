import type { ComponentType } from "react"

export interface A2Node {
	type: string
	props?: Record<string, unknown>
	children?: A2Node | A2Node[] | string
}

export interface ComponentEntry {
	component: ComponentType<Record<string, unknown>>
}

export type ComponentRegistry = Map<string, ComponentEntry>

export interface A2RendererProps {
	node: A2Node
	registry?: ComponentRegistry
}
