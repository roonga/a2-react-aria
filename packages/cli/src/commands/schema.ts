import { writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { loadConfig, resolveRegistry } from "../config.js"
import { loadA2uiSchema } from "../registry.js"
import { fail, info, success } from "../ui.js"

interface SchemaOptions {
	registry?: string
	out?: string
}

export async function schema(opts: SchemaOptions): Promise<void> {
	const config = loadConfig()
	const base = resolveRegistry(opts.registry, config)

	let jsonSchema: object
	try {
		jsonSchema = await loadA2uiSchema(base)
	} catch (err) {
		fail((err as Error).message)
	}

	const output = JSON.stringify(jsonSchema, null, 2)

	if (opts.out) {
		const dest = resolve(process.cwd(), opts.out)
		writeFileSync(dest, `${output}\n`)
		success(`Written: ${dest}`)
	} else {
		info(output)
	}
}
