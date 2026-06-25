import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { collectDependencies, writeItems } from "../commands/add.js"
import { init } from "../commands/init.js"
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

describe("init", () => {
	let dir: string
	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), "a2ra-init-"))
	})
	afterEach(() => {
		rmSync(dir, { recursive: true, force: true })
	})

	it("creates a2ra.json with defaults", () => {
		const orig = process.cwd()
		process.chdir(dir)
		try {
			init({})
			const config = JSON.parse(readFileSync(join(dir, "a2ra.json"), "utf8")) as Record<string, unknown>
			expect(config.componentsDir).toBe("components/a2ui")
			expect(config.schema).toBeUndefined()
		} finally {
			process.chdir(orig)
		}
	})

	it("writes schema block when --entry is provided", () => {
		const orig = process.cwd()
		process.chdir(dir)
		try {
			init({ entry: "lib/registry-schemas.ts" })
			const config = JSON.parse(readFileSync(join(dir, "a2ra.json"), "utf8")) as Record<string, unknown>
			const schema = config.schema as Record<string, unknown>
			expect(schema.entry).toBe("lib/registry-schemas.ts")
			expect(schema.out).toBe("public/a2ui-schema.json")
			expect(typeof schema.title).toBe("string")
			expect(typeof schema.description).toBe("string")
		} finally {
			process.chdir(orig)
		}
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

describe("schema --entry (generateFromEntry)", () => {
	// Use apps/demo/web as cwd so the gen script can resolve zod (it's a devDependency there).
	const DEMO_WEB = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../../../apps/demo/web")
	let entryPath: string
	let outPath: string

	beforeEach(() => {
		const suffix = Date.now()
		entryPath = join(DEMO_WEB, `.a2ra-test-entry-${suffix}.ts`)
		outPath = join(DEMO_WEB, `.a2ra-test-out-${suffix}.json`)
	})
	afterEach(() => {
		rmSync(entryPath, { force: true })
		rmSync(outPath, { force: true })
	})

	it("generates a JSON Schema file from a local registry-schemas entry", async () => {
		writeFileSync(
			entryPath,
			`import { z } from "zod"\nexport const registrySchemas = { Foo: z.object({ type: z.literal("Foo") }), Bar: z.object({ type: z.literal("Bar") }) }\n`,
		)

		const { schema } = await import("../commands/schema.js")
		await schema({ entry: entryPath, out: outPath, title: "Test Schema", cwd: DEMO_WEB })

		const written = JSON.parse(readFileSync(outPath, "utf8")) as Record<string, unknown>
		expect(written.title).toBe("Test Schema")
		const entries = (written.anyOf ?? written.oneOf) as unknown[]
		expect(entries).toHaveLength(2)
	})
})
