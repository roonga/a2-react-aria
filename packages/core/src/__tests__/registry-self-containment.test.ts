import { readdirSync, readFileSync } from "node:fs"
import { dirname, join, posix, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

// A registry item has to carry everything a consumer needs to compile what it copies.
//
// `a2ra add <name>` writes an item's embedded files into a consumer's components directory
// and nothing else, so a file the copied source imports but the item does not ship is a
// dangling import in every project that ran the command. That is not hypothetical:
// `group-schema-fields.ts` sits beside the component directories, is imported by the
// checkbox and radio schemas, and belonged to no item at all until the generator learned
// to follow imports out of a component's own directory.
//
// The set of items is read from the registry rather than listed here, so a component added
// later is covered the day it lands.
//
// Imports that resolve ABOVE the components root are deliberately not checked. Those name
// the runtime a consumer installs (`../../form-state`, `../../action-context`), not source
// a registry item could ship.

const REGISTRY_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..", "registry")

/** The hand-maintained files in `registry/`, which are not component items. */
const NOT_AN_ITEM = new Set(["index.json", "schema.json", "a2ui-schema.json"])

interface RegistryItem {
	readonly name: string
	readonly files: readonly { readonly path: string; readonly content: string }[]
}

function registryItems(): RegistryItem[] {
	return readdirSync(REGISTRY_DIR)
		.filter((file) => file.endsWith(".json") && !NOT_AN_ITEM.has(file))
		.sort()
		.map((file) => JSON.parse(readFileSync(join(REGISTRY_DIR, file), "utf8")) as RegistryItem)
}

/** Relative import specifiers used by a source file. */
function relativeImports(source: string): string[] {
	return [...source.matchAll(/(?:from|import)\s+["'](\.[^"']*)["']/g)].map((match) => match[1] ?? "")
}

/**
 * The paths a specifier could name, relative to the components root, or null when it
 * escapes above the root and is therefore the consumer's own runtime.
 */
function candidatePaths(fromPath: string, spec: string): string[] | null {
	const base = posix.normalize(posix.join(posix.dirname(fromPath), spec))
	if (base.startsWith("..")) return null
	return [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]
}

describe("registry items are self-contained", () => {
	const items = registryItems()

	it("reads the registry, and finds items in it", () => {
		expect(items.length).toBeGreaterThan(0)
		for (const item of items) expect(item.files.length).toBeGreaterThan(0)
	})

	it.each(
		items.map((item) => [item.name, item] as const),
	)("%s ships every file its own source imports", (_name, item) => {
		const shipped = new Set(item.files.map((file) => file.path))
		const dangling: string[] = []
		for (const file of item.files) {
			for (const spec of relativeImports(file.content)) {
				const candidates = candidatePaths(file.path, spec)
				if (candidates === null) continue
				if (!candidates.some((candidate) => shipped.has(candidate))) {
					dangling.push(`${file.path} imports ${spec}`)
				}
			}
		}
		expect(dangling, `${item.name} would copy source it cannot compile`).toEqual([])
	})

	it("ships the shared group schema fields with both groups that import them", () => {
		// The named instance, so the general property above cannot go quietly vacuous if the
		// import shape it scans for ever changes.
		for (const name of ["checkbox", "radio"]) {
			const item = items.find((candidate) => candidate.name === name)
			expect(item, `${name} is missing from the registry`).toBeDefined()
			expect(item?.files.map((file) => file.path)).toContain("group-schema-fields.ts")
		}
	})
})
