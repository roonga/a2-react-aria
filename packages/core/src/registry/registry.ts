import type { NodeValidatorResult } from "../registry-schema"
import { createNodeValidator } from "../registry-schema"
import type { A2ComponentType, ComponentEntry, ComponentRegistry, SchemaLike } from "../types"

const globalRegistry: ComponentRegistry = new Map()

export type A2Registry = ComponentRegistry & {
	validate(nodes: unknown[]): NodeValidatorResult
}

/** Input shape for createRegistry — accepts any React component, no cast required at call sites. */
interface RegistryEntryInput {
	// biome-ignore lint/suspicious/noExplicitAny: accepts any React component; cast is done once inside createRegistry
	component: import("react").ComponentType<any>
	schema?: SchemaLike
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

export function registerComponent(type: string, entry: ComponentEntry): void {
	globalRegistry.set(type, entry)
}

export function getRegistry(): ComponentRegistry {
	return globalRegistry
}
