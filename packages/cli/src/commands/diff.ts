import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { loadConfig, resolveRegistry } from "../config.js"
import { diffLines } from "../diff.js"
import { loadIndex, loadItem } from "../registry.js"
import { bold, dim, fail, info, success, warn } from "../ui.js"

interface DiffOptions {
	registry?: string
	dir?: string
}

async function diffComponent(
	name: string,
	base: string,
	targetDir: string,
	nameWasRequested: boolean,
): Promise<{ anyChanges: boolean; anyLocal: boolean }> {
	const item = await loadItem(base, name)
	let anyChanges = false
	let anyLocal = false
	for (const file of item.files) {
		const dest = resolve(targetDir, file.path)
		if (!existsSync(dest)) {
			if (nameWasRequested) warn(`${file.path} not found locally`)
			continue
		}
		anyLocal = true
		const local = readFileSync(dest, "utf8")
		const d = diffLines(local, file.content)
		if (d) {
			anyChanges = true
			info(bold(`\n── ${file.path} ──`))
			info(d)
		}
	}
	return { anyChanges, anyLocal }
}

// Show differences between locally installed component files and the registry version.
// With no name, diffs every component present in the index that exists locally.
export async function diff(name: string | undefined, opts: DiffOptions): Promise<void> {
	const config = loadConfig()
	const base = resolveRegistry(opts.registry, config)
	const targetDir = resolve(process.cwd(), opts.dir ?? config.componentsDir)

	let names: string[]
	try {
		if (name) {
			names = [name]
		} else {
			const index = await loadIndex(base)
			names = index.components.map((c) => c.name)
		}
	} catch (err) {
		fail((err as Error).message)
	}

	let anyChanges = false
	let anyLocal = false

	for (const n of names) {
		const result = await diffComponent(n, base, targetDir, !!name)
		if (result.anyChanges) anyChanges = true
		if (result.anyLocal) anyLocal = true
	}

	info("")
	if (!anyLocal) {
		warn("No installed components found to compare.")
	} else if (!anyChanges) {
		success("All installed components are up to date.")
	} else {
		info(dim("Run `a2ra add <name> --overwrite` to update."))
	}
}
