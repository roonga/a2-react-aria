import { describe, expect, it } from "vitest"
import { defaultRegistry, registerAllComponents } from "../registry/defaultRegistry"
import { getRegistry, registerComponent } from "../registry/registry"

describe("defaultRegistry", () => {
	it("is a Map containing all built-in components", () => {
		expect(defaultRegistry instanceof Map).toBe(true)
		expect(defaultRegistry.size).toBeGreaterThan(15)
	})

	it("contains expected component entries", () => {
		expect(defaultRegistry.has("Button")).toBe(true)
		expect(defaultRegistry.has("TextField")).toBe(true)
		expect(defaultRegistry.has("RadioGroup")).toBe(true)
		expect(defaultRegistry.has("Table")).toBe(true)
	})

	it("each entry has a component and schema", () => {
		for (const [name, entry] of defaultRegistry) {
			expect(typeof entry.component, `${name} missing component`).toBe("function")
			expect(entry.schema, `${name} missing schema`).toBeDefined()
		}
	})
})

describe("registerComponent / getRegistry", () => {
	it("adds a component entry to the global registry", () => {
		const MockComp = () => null
		registerComponent("MockForTest", { component: MockComp as never })
		const registry = getRegistry()
		expect(registry.has("MockForTest")).toBe(true)
		expect(registry.get("MockForTest")?.component).toBe(MockComp)
	})

	it("getRegistry returns the same singleton Map", () => {
		const a = getRegistry()
		const b = getRegistry()
		expect(a).toBe(b)
	})
})

describe("registerAllComponents", () => {
	it("populates the global registry with all default components", () => {
		registerAllComponents()
		const registry = getRegistry()
		expect(registry.has("Button")).toBe(true)
		expect(registry.has("TextField")).toBe(true)
		expect(registry.size).toBeGreaterThan(15)
	})
})
