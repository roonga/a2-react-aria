import { existsSync } from "node:fs"
import { resolve } from "node:path"

// Detect the consumer's package manager from its lockfile, defaulting to npm.
export function detectPackageManager(cwd: string = process.cwd()): "pnpm" | "yarn" | "bun" | "npm" {
	if (existsSync(resolve(cwd, "pnpm-lock.yaml"))) return "pnpm"
	if (existsSync(resolve(cwd, "yarn.lock"))) return "yarn"
	if (existsSync(resolve(cwd, "bun.lockb")) || existsSync(resolve(cwd, "bun.lock"))) return "bun"
	return "npm"
}

export function installCommand(pm: ReturnType<typeof detectPackageManager>, deps: string[]): string {
	const list = deps.join(" ")
	switch (pm) {
		case "pnpm":
			return `pnpm add ${list}`
		case "yarn":
			return `yarn add ${list}`
		case "bun":
			return `bun add ${list}`
		default:
			return `npm install ${list}`
	}
}
