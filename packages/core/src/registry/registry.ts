import type { ComponentEntry, ComponentRegistry } from "../types"

const globalRegistry: ComponentRegistry = new Map()

export function createRegistry(entries: Record<string, ComponentEntry>): ComponentRegistry {
	const registry: ComponentRegistry = new Map()
	for (const [type, entry] of Object.entries(entries)) {
		registry.set(type, entry)
	}
	return registry
}

export function registerComponent(type: string, entry: ComponentEntry): void {
	globalRegistry.set(type, entry)
}

export function getRegistry(): ComponentRegistry {
	return globalRegistry
}
