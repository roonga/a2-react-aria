import { existsSync } from "node:fs"
import { resolve } from "node:path"
import { CONFIG_FILE, DEFAULT_CONFIG, writeConfig } from "../config.js"
import type { Config } from "../types.js"
import { bold, info, success, warn } from "../ui.js"

interface InitOptions {
	dir?: string
	registry?: string
	force?: boolean
	entry?: string
}

export function init(opts: InitOptions): void {
	const path = resolve(process.cwd(), CONFIG_FILE)
	if (existsSync(path) && !opts.force) {
		warn(`${CONFIG_FILE} already exists. Use --force to overwrite.`)
		return
	}

	const config: Config = {
		componentsDir: opts.dir ?? DEFAULT_CONFIG.componentsDir,
	}
	if (opts.registry) config.registry = opts.registry
	if (opts.entry) {
		config.schema = {
			entry: opts.entry,
			out: "public/a2ui-schema.json",
			title: "a2UI Schema",
			description:
				"JSON Schema for a2UI nodes accepted by this app. Validate agent output against this before rendering.",
		}
	}

	writeConfig(config)
	success(`Created ${bold(CONFIG_FILE)}`)
	info(`  componentsDir: ${config.componentsDir}`)
	if (config.schema) {
		info(`  schema.entry:  ${config.schema.entry}`)
		info(`  schema.out:    ${config.schema.out}`)
		info("Run `a2ra schema` to generate your schema file.")
	} else {
		info("Run `a2ra add <component>` to add your first component.")
	}
}
