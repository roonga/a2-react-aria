import { type ReactElement, type ReactNode, useCallback, useMemo, useRef } from "react"
import type { ActionCtx } from "../action-context/action-context"
import { ActionContext } from "../action-context/action-context"
import type { FormStateCtx } from "../form-state/form-state"
import { FormStateContext } from "../form-state/form-state"
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

function A2RendererInner({
	node,
	registry,
	fallback,
}: {
	node: A2Node
	registry: ComponentRegistry
	fallback: ReactNode
}): ReactElement | null {
	const entry = registry.get(node.type)
	if (!entry) throw new Error(`[A2Renderer] Unknown component type: "${node.type}"`)
	const { component: Component } = entry
	const resolvedChildren = resolveChildren(node.children, registry, fallback)
	return (<Component {...(node.props ?? {})}>{resolvedChildren}</Component>) as ReactElement
}

function InteractiveWrapper({ onAction, children }: { onAction: (text: string) => void; children: ReactNode }) {
	const fieldsRef = useRef<Record<string, string>>({})

	const formState = useMemo<FormStateCtx>(
		() => ({
			setValue: (label, value) => {
				fieldsRef.current[label] = value
			},
		}),
		[],
	)

	const buildAction = useCallback((buttonLabel: string): string => {
		const entries = Object.entries(fieldsRef.current).filter(([, v]) => v !== "")
		if (entries.length === 0) return buttonLabel
		const parts = entries.map(([k, v]) => `${k}: ${v}`)
		return `${buttonLabel} | ${parts.join(" | ")}`
	}, [])

	const actionCtx = useMemo<ActionCtx>(() => ({ buildAction, fire: (text) => onAction(text) }), [buildAction, onAction])

	return (
		<FormStateContext.Provider value={formState}>
			<ActionContext.Provider value={actionCtx}>{children}</ActionContext.Provider>
		</FormStateContext.Provider>
	)
}

export function A2Renderer({ node, nodes, registry, fallback, onAction }: A2RendererProps): ReactElement | null {
	const reg = registry ?? getRegistry()

	let inner: ReactNode
	if (nodes !== undefined) {
		if (!nodes.length) return null
		inner = nodes.map((n, i) => (
			// biome-ignore lint/suspicious/noArrayIndexKey: a2UI nodes have no stable IDs
			<A2RendererInner key={i} node={n as A2Node} registry={reg} fallback={fallback} />
		))
	} else if (node !== undefined) {
		inner = <A2RendererInner node={node} registry={reg} fallback={fallback} />
	} else {
		return null
	}

	return (
		<A2ErrorBoundary fallback={fallback}>
			{onAction ? <InteractiveWrapper onAction={onAction}>{inner}</InteractiveWrapper> : inner}
		</A2ErrorBoundary>
	) as ReactElement
}
