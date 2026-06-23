import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { collectDependencies, writeItems } from "../commands/add.js"
import { resolveRegistry } from "../config.js"
import { diffLines } from "../diff.js"
import { loadA2uiSchema, loadIndex, resolveItems } from "../registry.js"
import type { RegistryItem } from "../types.js"
import { detectPackageManager, installCommand } from "../util.js"

const REGISTRY = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../../../registry")

const ITEM: RegistryItem = {
	name: "demo",
	type: "registry:component",
	dependencies: ["zod"],
	registryDependencies: [],
	files: [{ path: "demo/Demo.tsx", content: "export const Demo = 1\n", type: "registry:component" }],
}

describe("writeItems", () => {
	let dir: string
	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), "a2ui-"))
	})
	afterEach(() => {
		rmSync(dir, { recursive: true, force: true })
	})

	it("writes files and reports them", () => {
		const result = writeItems([ITEM], dir, false)
		expect(result.written).toEqual(["demo/Demo.tsx"])
		expect(result.skipped).toEqual([])
		expect(readFileSync(join(dir, "demo/Demo.tsx"), "utf8")).toBe("export const Demo = 1\n")
	})

	it("skips existing files unless overwrite is set", () => {
		writeItems([ITEM], dir, false)
		writeFileSync(join(dir, "demo/Demo.tsx"), "LOCAL")
		const skip = writeItems([ITEM], dir, false)
		expect(skip.skipped).toEqual(["demo/Demo.tsx"])
		expect(readFileSync(join(dir, "demo/Demo.tsx"), "utf8")).toBe("LOCAL")

		const force = writeItems([ITEM], dir, true)
		expect(force.written).toEqual(["demo/Demo.tsx"])
		expect(readFileSync(join(dir, "demo/Demo.tsx"), "utf8")).toBe("export const Demo = 1\n")
	})
})

describe("collectDependencies", () => {
	it("dedupes and sorts npm deps across items", () => {
		const a = { ...ITEM, dependencies: ["zod", "react-aria-components"] }
		const b = { ...ITEM, name: "b", dependencies: ["zod", "@internationalized/date"] }
		expect(collectDependencies([a, b])).toEqual(["@internationalized/date", "react-aria-components", "zod"])
	})
})

describe("diffLines", () => {
	it("returns empty string for identical input", () => {
		expect(diffLines("a\nb\n", "a\nb\n")).toBe("")
	})
	it("marks added and removed lines", () => {
		const out = diffLines("a\nb\n", "a\nc\n")
		expect(out).toContain("- b")
		expect(out).toContain("+ c")
	})
})

describe("installCommand", () => {
	it("formats per package manager", () => {
		expect(installCommand("pnpm", ["zod"])).toBe("pnpm add zod")
		expect(installCommand("npm", ["zod", "react"])).toBe("npm install zod react")
		expect(installCommand("yarn", ["zod"])).toBe("yarn add zod")
		expect(installCommand("bun", ["zod"])).toBe("bun add zod")
	})
})

describe("detectPackageManager", () => {
	let dir: string
	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), "a2ui-pm-"))
	})
	afterEach(() => {
		rmSync(dir, { recursive: true, force: true })
	})
	it("detects pnpm from lockfile and defaults to npm", () => {
		expect(detectPackageManager(dir)).toBe("npm")
		writeFileSync(join(dir, "pnpm-lock.yaml"), "")
		expect(detectPackageManager(dir)).toBe("pnpm")
	})
})

describe("resolveRegistry", () => {
	it("prefers the explicit flag over config and default", () => {
		expect(resolveRegistry("./flag", { componentsDir: "x", registry: "./cfg" })).toBe("./flag")
		expect(resolveRegistry(undefined, { componentsDir: "x", registry: "./cfg" })).toBe("./cfg")
	})
})

describe("registry loader (local)", () => {
	it("loads the generated index", async () => {
		const index = await loadIndex(REGISTRY)
		expect(index.components.length).toBeGreaterThan(0)
		expect(index.components.map((c) => c.name)).toContain("button")
	})
	it("resolves a component with its files", async () => {
		const items = await resolveItems(REGISTRY, ["button"])
		expect(items).toHaveLength(1)
		expect(items[0].files.some((f) => f.path === "button/Button.tsx")).toBe(true)
	})
})

describe("loadA2uiSchema (local)", () => {
	it("loads the generated a2ui-schema.json", async () => {
		const schema = await loadA2uiSchema(REGISTRY)
		expect(schema).toBeTypeOf("object")
		expect(schema).not.toBeNull()
	})

	it("has oneOf with 23 entries (all built-in component types)", async () => {
		const schema = (await loadA2uiSchema(REGISTRY)) as Record<string, unknown>
		const entries = (schema.oneOf ?? schema.anyOf) as unknown[]
		expect(entries).toHaveLength(23)
	})

	it("includes Button and TextField in the schema", async () => {
		const schema = (await loadA2uiSchema(REGISTRY)) as Record<string, unknown>
		const entries = (schema.oneOf ?? schema.anyOf) as Array<Record<string, unknown>>
		const types = entries
			.map((e) => (e.properties as Record<string, { const?: string }> | undefined)?.type?.const)
			.filter(Boolean)
		expect(types).toContain("Button")
		expect(types).toContain("TextField")
	})
})
