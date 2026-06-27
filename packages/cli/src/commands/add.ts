import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { loadConfig, resolveRegistry } from "../config.js"
import { resolveItems } from "../registry.js"
import type { RegistryItem } from "../types.js"
import { bold, cyan, dim, fail, info, success, warn } from "../ui.js"
import { detectPackageManager, installCommand } from "../util.js"

interface AddOptions {
	registry?: string
	dir?: string
	overwrite?: boolean
}

export interface WriteResult {
	written: string[]
	skipped: string[]
}

// Write resolved registry items to targetDir. Pure I/O — used by `add` and tested directly.
export function writeItems(items: RegistryItem[], targetDir: string, overwrite: boolean): WriteResult {
	const written: string[] = []
	const skipped: string[] = []

	for (const item of items) {
		for (const file of item.files) {
			const dest = resolve(targetDir, file.path)
			if (existsSync(dest) && !overwrite) {
				skipped.push(file.path)
				continue
			}
			mkdirSync(dirname(dest), { recursive: true })
			writeFileSync(dest, file.content)
			written.push(file.path)
		}
	}
	return { written, skipped }
}

export function collectDependencies(items: RegistryItem[]): string[] {
	const deps = new Set<string>()
	for (const item of items) {
		for (const d of item.dependencies ?? []) deps.add(d)
	}
	return [...deps].sort((a, b) => a.localeCompare(b))
}

export async function add(names: string[], opts: AddOptions): Promise<void> {
	if (names.length === 0) {
		fail("No components specified. Usage: a2ra add <component...>")
	}

	const config = loadConfig()
	const base = resolveRegistry(opts.registry, config)
	const targetDir = resolve(process.cwd(), opts.dir ?? config.componentsDir)

	let items: RegistryItem[]
	try {
		items = await resolveItems(base, names)
	} catch (err) {
		fail((err as Error).message)
	}

	const { written, skipped } = writeItems(items, targetDir, opts.overwrite ?? false)

	const prefix = dim(`${config.componentsDir}/`)
	for (const path of written) {
		success(`${prefix}${path}`)
	}
	for (const path of skipped) {
		warn(`skipped ${path} (exists — use --overwrite)`)
	}

	const deps = collectDependencies(items)
	if (deps.length > 0) {
		info("")
		info(bold("Install required dependencies:"))
		const pm = detectPackageManager()
		info(`  ${cyan(installCommand(pm, deps))}`)
	}

	info("")
	success(`Added ${written.length} file(s) for ${items.map((i) => i.name).join(", ")}.`)
}
