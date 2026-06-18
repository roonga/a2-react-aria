import { describe, expect, it } from "vitest"
import { createRegistry, VERSION } from "../index"

describe("@a2ra/core smoke", () => {
	it("exports a semver VERSION", () => {
		// Format check rather than an exact value so Changesets version bumps don't break this.
		expect(VERSION).toMatch(/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/)
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
