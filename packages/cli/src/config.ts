import { readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import type { Config } from "./types.js"

export const CONFIG_FILE = "a2ra.json"

export const DEFAULT_REGISTRY = "https://raw.githubusercontent.com/roonga/a2-react-aria/main/registry"

export const DEFAULT_CONFIG: Config = {
	componentsDir: "components/a2ui",
}

// Load a2ra.json from the given cwd, falling back to defaults when absent.
export function loadConfig(cwd: string = process.cwd()): Config {
	try {
		const raw = readFileSync(resolve(cwd, CONFIG_FILE), "utf8")
		const parsed = JSON.parse(raw) as Partial<Config>
		return { ...DEFAULT_CONFIG, ...parsed }
	} catch {
		return { ...DEFAULT_CONFIG }
	}
}

export function writeConfig(config: Config, cwd: string = process.cwd()): string {
	const path = resolve(cwd, CONFIG_FILE)
	writeFileSync(path, `${JSON.stringify(config, null, 2)}\n`)
	return path
}

// Resolve the registry base: explicit flag > env > config > built-in default.
export function resolveRegistry(flag: string | undefined, config: Config): string {
	return flag ?? process.env.A2RA_REGISTRY ?? config.registry ?? DEFAULT_REGISTRY
}
