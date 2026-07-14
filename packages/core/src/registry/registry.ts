import type { NodeValidatorResult } from "../registry-schema"
import { createNodeValidator } from "../registry-schema"
import type { A2ComponentType, ComponentEntry, ComponentRegistry, SchemaLike } from "../types"

// Module-level singleton for the common single-app case, populated via
// registerComponent / registerAllComponents and read by A2Renderer when no
// `registry` prop is given. Because it is shared module state, avoid it where
// isolation matters (SSR request scope, tests, or two renderers with different
// component sets): build a dedicated registry with createRegistry() and pass it
// to <A2Renderer registry={...}> instead.
const globalRegistry: ComponentRegistry = new Map()

export type A2Registry = ComponentRegistry & {
	validate(nodes: unknown[]): NodeValidatorResult
}

/** Input shape for createRegistry — accepts any React component, no cast required at call sites. */
export interface RegistryEntryInput {
	// biome-ignore lint/suspicious/noExplicitAny: accepts any React component; cast is done once inside createRegistry
	component: import("react").ComponentType<any>
	schema?: SchemaLike
}

/** Input shape for createStrictRegistry — schema is mandatory, catching missing schemas at compile time. */
export interface StrictRegistryEntryInput extends RegistryEntryInput {
	schema: SchemaLike
}

export function createRegistry(entries: Record<string, RegistryEntryInput>, jsonSchema: object): A2Registry
export function createRegistry(entries: Record<string, RegistryEntryInput>): ComponentRegistry
export function createRegistry(entries: Record<string, RegistryEntryInput>, jsonSchema?: object): ComponentRegistry {
	const registry: ComponentRegistry = new Map()
	for (const [type, entry] of Object.entries(entries)) {
		const component = entry.component as A2ComponentType
		component.displayName ??= type
		registry.set(type, { component, schema: entry.schema })
	}
	if (jsonSchema !== undefined) {
		const validate = createNodeValidator(jsonSchema, registry)
		Object.assign(registry, { validate })
	}
	return registry
}

/**
 * Creates a registry that rejects incomplete component definitions up front.
 *
 * Every entry must provide a schema, so A2Renderer validates each untrusted
 * node before its props reach the registered React component.
 */
export function createStrictRegistry(entries: Record<string, StrictRegistryEntryInput>): ComponentRegistry {
	for (const [type, entry] of Object.entries(entries)) {
		if (typeof entry.schema?.safeParse !== "function") {
			throw new TypeError(`Strict registry entry "${type}" must define a schema with a safeParse method.`)
		}
	}
	return createRegistry(entries)
}

export function registerComponent(type: string, entry: ComponentEntry): void {
	globalRegistry.set(type, entry)
}

export function getRegistry(): ComponentRegistry {
	return globalRegistry
}
