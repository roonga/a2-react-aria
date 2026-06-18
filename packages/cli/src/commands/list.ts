import { loadConfig, resolveRegistry } from "../config.js"
import { loadIndex } from "../registry.js"
import { bold, dim, fail, info } from "../ui.js"

interface ListOptions {
	registry?: string
	json?: boolean
}

export async function list(opts: ListOptions): Promise<void> {
	const config = loadConfig()
	const base = resolveRegistry(opts.registry, config)

	let index: Awaited<ReturnType<typeof loadIndex>>
	try {
		index = await loadIndex(base)
	} catch (err) {
		fail((err as Error).message)
	}

	if (opts.json) {
		info(JSON.stringify(index.components, null, 2))
		return
	}

	info(bold(`Available components (${index.components.length}):`))
	const width = Math.max(...index.components.map((c) => c.name.length))
	for (const c of index.components) {
		info(`  ${c.name.padEnd(width)}  ${dim(c.description ?? "")}`)
	}
	info("")
	info(dim("Add one with: a2ui add <name>"))
}
