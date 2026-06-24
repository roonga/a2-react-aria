import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import { dirname, isAbsolute, join, resolve } from "node:path"
import { loadConfig, resolveRegistry } from "../config.js"
import { loadA2uiSchema } from "../registry.js"
import { fail, info, success } from "../ui.js"

interface SchemaOptions {
	registry?: string
	out?: string
	entry?: string
	title?: string
	description?: string
	/** Override process.cwd() — used by tests to point at a project that has the required deps. */
	cwd?: string
}

// Executed via `node --experimental-strip-types` inside the user's project.
// __ENTRY__, __TITLE__, __DESCRIPTION__ are replaced with JSON-encoded strings before writing.
const GEN_TEMPLATE = `\
import { pathToFileURL } from "node:url"
const mod = await import(pathToFileURL(__ENTRY__).href)
const schemas = (mod.registrySchemas ?? mod.default) as Record<string, unknown>
if (!schemas) throw new Error("Entry must export 'registrySchemas' or a default export.")

const { z } = await import("zod")
const values = Object.values(schemas) as import("zod").ZodTypeAny[]
if (values.length === 0) throw new Error("No schemas found in entry file.")
const union = values.length === 1 ? values[0] : z.union(values as [import("zod").ZodTypeAny, import("zod").ZodTypeAny, ...import("zod").ZodTypeAny[]])
const jsonSchema = z.toJSONSchema(union, { target: "draft-7" })

const output = { $schema: "http://json-schema.org/draft-07/schema#", title: __TITLE__, description: __DESCRIPTION__, ...jsonSchema }
process.stdout.write(JSON.stringify(output, null, 2) + "\\n")
`

export async function schema(opts: SchemaOptions): Promise<void> {
	const config = loadConfig()

	const entry = opts.entry ?? config.schema?.entry
	const outDefault = config.schema?.out ?? "public/a2ui-schema.json"

	if (entry) {
		generateFromEntry(entry, {
			out: opts.out ?? outDefault,
			title: opts.title ?? config.schema?.title ?? "a2UI Node",
			description:
				opts.description ??
				config.schema?.description ??
				"JSON Schema for a2UI nodes accepted by this app. Validate agent output against this before rendering.",
			cwd: opts.cwd,
		})
		return
	}

	// No entry — download the core schema from the registry.
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

function generateFromEntry(
	entry: string,
	opts: { out: string; title: string; description: string; cwd?: string },
): void {
	const cwd = opts.cwd ?? process.cwd()
	const absEntry = isAbsolute(entry) ? entry : resolve(cwd, entry)

	if (!existsSync(absEntry)) {
		fail(`Entry file not found: ${absEntry}`)
	}

	// Write the gen script into the user's project dir so Node resolves their node_modules.
	const tmpScript = join(cwd, `.a2ra-gen-${Date.now()}.mts`)

	try {
		const script = GEN_TEMPLATE.replace("__ENTRY__", JSON.stringify(absEntry))
			.replace("__TITLE__", JSON.stringify(opts.title))
			.replace("__DESCRIPTION__", JSON.stringify(opts.description))

		writeFileSync(tmpScript, script, "utf8")

		let stdout: string
		try {
			stdout = execFileSync(process.execPath, ["--experimental-strip-types", tmpScript], {
				cwd,
				encoding: "utf8",
			})
		} catch (err) {
			const execErr = err as { stderr?: string; stdout?: string; message?: string }
			fail(`Schema generation failed:\n${execErr.stderr ?? execErr.message}`)
		}

		const dest = isAbsolute(opts.out) ? opts.out : resolve(cwd, opts.out)
		mkdirSync(dirname(dest), { recursive: true })
		writeFileSync(dest, stdout)

		let count: number | string = "?"
		try {
			const parsed = JSON.parse(stdout) as Record<string, unknown>
			const entries = (parsed.anyOf ?? parsed.oneOf) as unknown[] | undefined
			count = entries?.length ?? "?"
		} catch {}

		success(`Written: ${dest} (${count} component types)`)
	} finally {
		rmSync(tmpScript, { force: true })
	}
}
