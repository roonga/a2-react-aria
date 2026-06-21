import { useCallback, useMemo, useRef } from "react"
import type { ActionCtx } from "../action-context/action-context"
import { ActionContext } from "../action-context/action-context"
import type { FormStateCtx } from "../form-state/form-state"
import { FormStateContext } from "../form-state/form-state"
import type { A2Node, ComponentRegistry } from "../types"
import { A2Renderer } from "./A2Renderer"

interface A2BlockRendererProps {
	nodes: unknown[]
	registry: ComponentRegistry
	onAction?: (text: string) => void
}

/**
 * Renders a list of A2UI nodes using the provided registry.
 * Provides FormStateContext (collects field values) and ActionContext
 * (fires action strings, building compound "Label | Key: value" payloads
 * from any co-located form fields).
 */
export function A2BlockRenderer({ nodes, registry, onAction }: A2BlockRendererProps) {
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

	const actionCtx = useMemo<ActionCtx>(
		() => ({ buildAction, fire: (text) => onAction?.(text) }),
		[buildAction, onAction],
	)

	if (!nodes?.length) return null
	return (
		<FormStateContext.Provider value={formState}>
			<ActionContext.Provider value={actionCtx}>
				{nodes.map((node, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: a2UI nodes have no stable IDs
					<A2Renderer key={i} node={node as A2Node} registry={registry} />
				))}
			</ActionContext.Provider>
		</FormStateContext.Provider>
	)
}
