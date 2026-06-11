import type { ReactElement, ReactNode } from "react"
import { getRegistry } from "../registry/registry"
import type { A2Node, A2RendererProps, ComponentRegistry } from "../types"
import { A2ErrorBoundary } from "./A2ErrorBoundary"

function resolveChildren(children: A2Node["children"], registry: ComponentRegistry, fallback: ReactNode): ReactNode {
	if (children === undefined || children === null) return null
	if (typeof children === "string") return children
	if (Array.isArray(children)) {
		// biome-ignore lint/suspicious/noArrayIndexKey: a2UI JSON has no stable IDs; position is the key
		return children.map((child, i) => <A2Renderer key={i} node={child} registry={registry} fallback={fallback} />)
	}
	return <A2Renderer node={children} registry={registry} fallback={fallback} />
}

function A2RendererInner({ node, registry, fallback }: A2RendererProps): ReactElement | null {
	const reg = registry ?? getRegistry()
	const entry = reg.get(node.type)

	if (!entry) {
		console.warn(`[A2Renderer] Unknown component type: "${node.type}"`)
		return null
	}

	const { component: Component } = entry
	const resolvedChildren = resolveChildren(node.children, reg, fallback)

	return (<Component {...(node.props ?? {})}>{resolvedChildren}</Component>) as ReactElement
}

export function A2Renderer(props: A2RendererProps): ReactElement {
	return (
		<A2ErrorBoundary fallback={props.fallback}>
			<A2RendererInner {...props} />
		</A2ErrorBoundary>
	) as ReactElement
}
