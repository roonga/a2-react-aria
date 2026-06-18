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
		const item = await loadItem(base, n)
		for (const file of item.files) {
			const dest = resolve(targetDir, file.path)
			if (!existsSync(dest)) {
				// Only report missing files when the component was explicitly requested.
				if (name) warn(`${file.path} not found locally`)
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
	}

	info("")
	if (!anyLocal) {
		warn("No installed components found to compare.")
	} else if (!anyChanges) {
		success("All installed components are up to date.")
	} else {
		info(dim("Run `a2ui add <name> --overwrite` to update."))
	}
}
