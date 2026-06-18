import { describe, expect, it } from "vitest"
import { createRegistry, VERSION } from "../index"

describe("@a2ra/core smoke", () => {
	it("exports VERSION", () => {
		expect(VERSION).toBe("0.1.0")
	})

	it("createRegistry returns a Map", () => {
		const registry = createRegistry({})
		expect(registry).toBeInstanceOf(Map)
		expect(registry.size).toBe(0)
	})

	it("createRegistry stores entries by type", () => {
		const MockComponent = () => null
		const registry = createRegistry({ Button: { component: MockComponent } })
		expect(registry.get("Button")?.component).toBe(MockComponent)
	})
})
