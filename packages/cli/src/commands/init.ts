import { existsSync } from "node:fs"
import { resolve } from "node:path"
import { CONFIG_FILE, DEFAULT_CONFIG, writeConfig } from "../config.js"
import type { Config } from "../types.js"
import { bold, info, success, warn } from "../ui.js"

interface InitOptions {
	dir?: string
	registry?: string
	force?: boolean
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

	writeConfig(config)
	success(`Created ${bold(CONFIG_FILE)}`)
	info(`  componentsDir: ${config.componentsDir}`)
	info("Run `a2ra add <component>` to add your first component.")
}
