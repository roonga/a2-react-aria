import { spawnSync } from "node:child_process"
import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { writeItems } from "../commands/add.js"
import { loadIndex, loadItem, resolveItems } from "../registry.js"

const REGISTRY = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../../../registry")
const REPO_ROOT = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../../..")

// Minimal biome config that mirrors the project's core formatting and lint rules.
// VCS is intentionally omitted so biome can run against files outside the git repo.
// Written as a properly tab-indented string so biome's own JSON formatter accepts it.
const BIOME_CONFIG = `{
\t"$schema": "https://biomejs.dev/schemas/2.4.16/schema.json",
\t"formatter": { "enabled": true, "indentStyle": "tab", "lineWidth": 120 },
\t"javascript": { "formatter": { "semicolons": "asNeeded", "quoteStyle": "double", "trailingCommas": "all" } },
\t"linter": {
\t\t"enabled": true,
\t\t"rules": {
\t\t\t"recommended": true,
\t\t\t"nursery": {
\t\t\t\t"useSortedClasses": {
\t\t\t\t\t"level": "warn",
\t\t\t\t\t"options": { "attributes": ["className"], "functions": ["clsx", "cx", "cva", "tv"] }
\t\t\t\t}
\t\t\t}
\t\t}
\t}
}
`

describe("registry index structure", () => {
	it("lists at least 23 components each with a non-empty name and title", async () => {
		const index = await loadIndex(REGISTRY)
		expect(index.components.length).toBeGreaterThan(15)
		for (const c of index.components) {
			expect(c.name, "component missing name").toBeTruthy()
			expect(c.title, `${c.name} missing title`).toBeTruthy()
		}
	})

	it("every component exposes a non-empty dependencies array", async () => {
		const index = await loadIndex(REGISTRY)
		for (const c of index.components) {
			expect(Array.isArray(c.dependencies), `${c.name} missing dependencies field`).toBe(true)
			expect(c.dependencies.length, `${c.name} has no dependencies`).toBeGreaterThan(0)
		}
	})
})

describe("registry item structure (all components)", () => {
	it("every item has the correct type and at least one file with content", async () => {
		const index = await loadIndex(REGISTRY)
		for (const c of index.components) {
			const item = await loadItem(REGISTRY, c.name)
			expect(item.name, `${c.name} item.name mismatch`).toBe(c.name)
			expect(item.type, `${c.name} wrong type`).toBe("registry:component")
			expect(item.files.length, `${c.name} has no files`).toBeGreaterThan(0)
			for (const f of item.files) {
				expect(typeof f.path, `${c.name}: file path is not a string`).toBe("string")
				expect(f.content.length, `${c.name}/${f.path} has empty content`).toBeGreaterThan(0)
			}
		}
	})

	it("every item includes zod in its dependencies", async () => {
		const index = await loadIndex(REGISTRY)
		for (const c of index.components) {
			const item = await loadItem(REGISTRY, c.name)
			expect((item.dependencies ?? []).includes("zod"), `${c.name} missing zod dependency`).toBe(true)
		}
	})

	it("the file count in the index matches the actual files in each item", async () => {
		const index = await loadIndex(REGISTRY)
		for (const c of index.components) {
			const item = await loadItem(REGISTRY, c.name)
			expect(item.files.length, `${c.name} file count mismatch`).toBe(c.files)
		}
	})

	it("each item includes a .schema.ts file, a component .tsx file, and an index.ts barrel", async () => {
		const index = await loadIndex(REGISTRY)
		for (const c of index.components) {
			const item = await loadItem(REGISTRY, c.name)
			const paths = item.files.map((f) => f.path)
			const hasSchema = paths.some((p) => p.endsWith(".schema.ts"))
			const hasTsx = paths.some((p) => p.endsWith(".tsx"))
			const hasBarrel = paths.some((p) => p.endsWith("index.ts"))
			expect(hasSchema, `${c.name} missing .schema.ts`).toBe(true)
			expect(hasTsx, `${c.name} missing .tsx component`).toBe(true)
			expect(hasBarrel, `${c.name} missing index.ts barrel`).toBe(true)
		}
	})
})

describe("add — written files pass biome check", () => {
	const isWin = process.platform === "win32"
	const BIOME = join(REPO_ROOT, "node_modules", ".bin", isWin ? "biome.cmd" : "biome")

	// On Windows, .cmd files must be invoked via cmd.exe — avoid shell:true (DEP0190).
	function runBiome(args: string[], cwd: string) {
		if (isWin) {
			return spawnSync("cmd.exe", ["/C", BIOME, ...args], { encoding: "utf8", cwd })
		}
		return spawnSync(BIOME, args, { encoding: "utf8", cwd })
	}

	let dir: string
	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), "a2ra-lint-"))
		writeFileSync(join(dir, "biome.json"), BIOME_CONFIG)
	})
	afterEach(() => {
		rmSync(dir, { recursive: true, force: true })
	})

	it("all registry components produce biome-clean files when written", async () => {
		const index = await loadIndex(REGISTRY)
		const allNames = index.components.map((c) => c.name)
		const items = await resolveItems(REGISTRY, allNames)
		writeItems(items, dir, true)

		const result = runBiome(["check", "."], dir)

		expect(result.status, `biome check failed:\n${result.stdout}\n${result.stderr}`).toBe(0)
	})
})
