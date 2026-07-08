import { readdirSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { defaultRegistry } from "../registry/defaultRegistry"

// Guard against the drift found in review (F3/F5): a component can be authored,
// exported, and tested but never added to `defaultRegistry`, so agent JSON that
// references it throws "Unknown component type" at render. This test derives the
// set of declared node types straight from the schema sources and asserts every
// one is registered, so adding a component without wiring it up fails CI.

const componentsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "components")

function declaredNodeTypes(): string[] {
	const types = new Set<string>()
	for (const entry of readdirSync(componentsDir, { withFileTypes: true })) {
		if (!entry.isDirectory()) continue
		for (const file of readdirSync(join(componentsDir, entry.name))) {
			if (!file.endsWith(".schema.ts")) continue
			const source = readFileSync(join(componentsDir, entry.name, file), "utf8")
			for (const match of source.matchAll(/type:\s*z\.literal\(\s*["'`]([^"'`]+)["'`]\s*\)/g)) {
				types.add(match[1])
			}
		}
	}
	return [...types].sort()
}

describe("defaultRegistry parity", () => {
	it("registers every component type declared by a schema", () => {
		const declared = declaredNodeTypes()
		expect(declared.length).toBeGreaterThan(0)

		const missing = declared.filter((type) => !defaultRegistry.has(type))
		expect(
			missing,
			`Component types declared in a *.schema.ts but missing from defaultRegistry: ${missing.join(", ")}`,
		).toEqual([])
	})

	it("gives every registered entry a component and a schema", () => {
		for (const [type, entry] of defaultRegistry) {
			expect(entry.component, `${type} has no component`).toBeDefined()
			expect(entry.schema, `${type} has no schema`).toBeDefined()
		}
	})
})
