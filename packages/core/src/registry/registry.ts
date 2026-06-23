import type { NodeValidatorResult } from "../registry-schema"
import { createNodeValidator } from "../registry-schema"
import type { ComponentEntry, ComponentRegistry } from "../types"

const globalRegistry: ComponentRegistry = new Map()

export type A2Registry = ComponentRegistry & {
	validate(nodes: unknown[]): NodeValidatorResult
}

export function createRegistry(entries: Record<string, ComponentEntry>, jsonSchema: object): A2Registry
export function createRegistry(entries: Record<string, ComponentEntry>): ComponentRegistry
export function createRegistry(entries: Record<string, ComponentEntry>, jsonSchema?: object): ComponentRegistry {
	const registry: ComponentRegistry = new Map()
	for (const [type, entry] of Object.entries(entries)) {
		registry.set(type, entry)
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
