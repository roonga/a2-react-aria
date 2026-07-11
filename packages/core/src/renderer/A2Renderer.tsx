import { type ReactElement, type ReactNode, useCallback, useMemo, useRef } from "react"
import type { ActionCtx } from "../action-context/action-context"
import { ActionContext } from "../action-context/action-context"
import type { FormStateCtx } from "../form-state/form-state"
import { FormStateContext } from "../form-state/form-state"
import { getRegistry } from "../registry/registry"
import type { A2Node, A2RendererProps, ComponentRegistry } from "../types"
import { A2ErrorBoundary } from "./A2ErrorBoundary"

const MAX_DEPTH = 50

// Blocks stored-XSS via javascript:, data:, and vbscript: URLs in agent-supplied props.
const BLOCKED_URL_SCHEMES = /^(javascript|data|vbscript):/i
const URL_PROP_KEYS = /^(href|src|action|formaction|.*[Uu]rl|.*[Hh]ref|.*[Ss]rc)$/
// Per the WHATWG URL spec, browsers strip every ASCII tab/newline/CR from a URL
// (not just leading/trailing) before parsing its scheme. Without stripping them
// here first, "java\tscript:alert(1)" fails this regex but still runs as
// javascript: once the browser removes the tab.
const EMBEDDED_CONTROL_CHARS = /[\t\n\r]/g

// Sanitize a single value against a leaf key. Recurses through arrays and plain
// objects so URL props nested inside structured data (e.g. Breadcrumb items[].href)
// cannot bypass the scheme filter.
function sanitizeValue(key: string, value: unknown): unknown {
	if (typeof value === "string") {
		if (!URL_PROP_KEYS.test(key)) return value
		const normalized = value.replace(EMBEDDED_CONTROL_CHARS, "").trim()
		return BLOCKED_URL_SCHEMES.test(normalized) ? "about:blank" : value
	}
	if (Array.isArray(value)) {
		return value.map((item) => sanitizeValue(key, item))
	}
	if (value !== null && typeof value === "object") {
		return sanitizeProps(value as Record<string, unknown>)
	}
	return value
}

// Keys that mutate the prototype chain when assigned. Agent JSON is untrusted, so
// they are dropped rather than copied into the props object handed to React.
const PROTO_KEYS = new Set(["__proto__", "constructor", "prototype"])

function sanitizeProps(props: Record<string, unknown>): Record<string, unknown> {
	// Null-prototype object so a "__proto__" key (own-enumerable after JSON.parse)
	// becomes a plain own property instead of triggering the prototype setter.
	const out: Record<string, unknown> = Object.create(null)
	for (const [k, v] of Object.entries(props)) {
		if (PROTO_KEYS.has(k)) continue
		out[k] = sanitizeValue(k, v)
	}
	return out
}

function resolveChildren(
	children: A2Node["children"],
	registry: ComponentRegistry,
	fallback: ReactNode,
	depth: number,
): ReactNode {
	if (children === undefined || children === null) return null
	if (typeof children === "string") return children
	if (Array.isArray(children)) {
		return children.map((child, i) => (
			// biome-ignore lint/suspicious/noArrayIndexKey: A2UI JSON has no stable IDs; position is the key
			<A2RendererInner key={i} node={child} registry={registry} fallback={fallback} depth={depth} /> // NOSONAR
		))
	}
	return <A2RendererInner node={children} registry={registry} fallback={fallback} depth={depth} />
}

function A2RendererInner({
	node,
	registry,
	fallback,
	depth = 0,
}: {
	node: A2Node
	registry: ComponentRegistry
	fallback: ReactNode
	depth?: number
}): ReactElement | null {
	if (depth > MAX_DEPTH)
		throw new Error(
			`[A2Renderer] Maximum render depth (${MAX_DEPTH}) exceeded. Possible circular or excessively nested A2UI JSON.`,
		)
	const entry = registry.get(node.type)
	if (!entry) throw new Error(`[A2Renderer] Unknown component type: "${node.type}"`)
	if (entry.schema) {
		const result = entry.schema.safeParse(node)
		if (!result.success) {
			throw new Error(`[A2Renderer] Invalid props for "${node.type}": ${String(result.error)}`)
		}
	}
	const { component: Component } = entry
	const resolvedChildren = resolveChildren(node.children, registry, fallback, depth + 1)
	const safeProps = sanitizeProps(node.props ?? {})
	return (<Component {...safeProps}>{resolvedChildren}</Component>) as ReactElement
}

function InteractiveWrapper({
	onAction,
	children,
}: {
	readonly onAction: (text: string) => void
	readonly children: ReactNode
}) {
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
			// biome-ignore lint/suspicious/noArrayIndexKey: A2UI nodes have no stable IDs
			<A2RendererInner key={i} node={n as A2Node} registry={reg} fallback={fallback} /> // NOSONAR
		))
	} else if (node === undefined) {
		return null
	} else {
		inner = <A2RendererInner node={node} registry={reg} fallback={fallback} />
	}

	return (
		<A2ErrorBoundary fallback={fallback}>
			{onAction ? <InteractiveWrapper onAction={onAction}>{inner}</InteractiveWrapper> : inner}
		</A2ErrorBoundary>
	) as ReactElement
}
