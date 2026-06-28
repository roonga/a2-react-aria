import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { writeItems } from "../commands/add.js"
import { diff } from "../commands/diff.js"
import { list } from "../commands/list.js"
import { loadIndex, resolveItems } from "../registry.js"

const REGISTRY = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../../../registry")

describe("list", () => {
	afterEach(() => vi.restoreAllMocks())

	it("outputs components as a JSON array when the json flag is set", async () => {
		const lines: string[] = []
		vi.spyOn(console, "log").mockImplementation((...args) => {
			lines.push(args.join(" "))
		})
		await list({ json: true, registry: REGISTRY })
		const parsed = JSON.parse(lines.join("")) as Array<{ name: string }>
		expect(parsed.some((c) => c.name === "button")).toBe(true)
		expect(parsed.length).toBeGreaterThan(15)
	})

	it("includes component names and a usage hint in text output", async () => {
		const lines: string[] = []
		vi.spyOn(console, "log").mockImplementation((...args) => {
			lines.push(args.join(" "))
		})
		await list({ registry: REGISTRY })
		expect(lines.some((l) => l.includes("button"))).toBe(true)
		expect(lines.some((l) => l.includes("Available components"))).toBe(true)
		expect(lines.some((l) => l.includes("a2ra add"))).toBe(true)
	})
})

describe("diff", () => {
	let dir: string
	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), "a2ra-diff-"))
	})
	afterEach(() => {
		vi.restoreAllMocks()
		rmSync(dir, { recursive: true, force: true })
	})

	it("reports up to date when installed files match the registry", async () => {
		const items = await resolveItems(REGISTRY, ["button"])
		writeItems(items, dir, false)

		const logs: string[] = []
		vi.spyOn(console, "log").mockImplementation((...args) => {
			logs.push(args.join(" "))
		})
		await diff("button", { registry: REGISTRY, dir })
		expect(logs.some((l) => l.includes("up to date"))).toBe(true)
	})

	it("shows diff lines when an installed file has been modified", async () => {
		const items = await resolveItems(REGISTRY, ["alert"])
		writeItems(items, dir, false)
		const firstFile = join(dir, items[0].files[0].path)
		writeFileSync(firstFile, `${readFileSync(firstFile, "utf8")}// local-only change\n`)

		const logs: string[] = []
		vi.spyOn(console, "log").mockImplementation((...args) => {
			logs.push(args.join(" "))
		})
		await diff("alert", { registry: REGISTRY, dir })
		expect(logs.some((l) => l.includes("local-only change"))).toBe(true)
	})

	it("warns when no local components are present", async () => {
		const warns: string[] = []
		vi.spyOn(console, "warn").mockImplementation((...args) => {
			warns.push(args.join(" "))
		})
		vi.spyOn(console, "log").mockImplementation(() => {})
		await diff(undefined, { registry: REGISTRY, dir })
		expect(warns.some((w) => w.includes("No installed components"))).toBe(true)
	})
})

describe("list + diff round-trip", () => {
	let dir: string
	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), "a2ra-roundtrip-"))
	})
	afterEach(() => {
		vi.restoreAllMocks()
		rmSync(dir, { recursive: true, force: true })
	})

	it("list names all match components that diff finds locally after add", async () => {
		const index = await loadIndex(REGISTRY)
		const firstThree = index.components.slice(0, 3).map((c) => c.name)

		for (const name of firstThree) {
			const items = await resolveItems(REGISTRY, [name])
			writeItems(items, dir, false)
		}

		const logs: string[] = []
		vi.spyOn(console, "log").mockImplementation((...args) => {
			logs.push(args.join(" "))
		})
		vi.spyOn(console, "warn").mockImplementation(() => {})

		await diff(undefined, { registry: REGISTRY, dir })
		expect(logs.some((l) => l.includes("up to date"))).toBe(true)
	})
})
