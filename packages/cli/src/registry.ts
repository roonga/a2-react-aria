import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import type { RegistryIndex, RegistryItem } from "./types.js"

function isHttp(base: string): boolean {
	return base.startsWith("http://") || base.startsWith("https://")
}

function toLocalDir(base: string): string {
	return base.startsWith("file://") ? fileURLToPath(base) : resolve(base)
}

// Fetch and parse a JSON file from the registry base (HTTP(S) URL or local directory).
async function fetchJson<T>(base: string, file: string): Promise<T> {
	if (isHttp(base)) {
		const url = `${base.replace(/\/$/, "")}/${file}`
		const res = await fetch(url)
		if (!res.ok) {
			throw new Error(`Failed to fetch ${url} (HTTP ${res.status})`)
		}
		return (await res.json()) as T
	}
	const path = resolve(toLocalDir(base), file)
	try {
		return JSON.parse(readFileSync(path, "utf8")) as T
	} catch (err) {
		throw new Error(`Failed to read ${path}: ${(err as Error).message}`)
	}
}

export function loadIndex(base: string): Promise<RegistryIndex> {
	return fetchJson<RegistryIndex>(base, "index.json")
}

export function loadItem(base: string, name: string): Promise<RegistryItem> {
	return fetchJson<RegistryItem>(base, `${name}.json`)
}

// Resolve a component plus its registry dependencies into a deduped, ordered list.
// Dependencies are placed before the components that require them.
export async function resolveItems(base: string, names: string[]): Promise<RegistryItem[]> {
	const seen = new Map<string, RegistryItem>()
	const order: string[] = []

	async function visit(name: string): Promise<void> {
		if (seen.has(name)) return
		const item = await loadItem(base, name)
		seen.set(name, item)
		for (const dep of item.registryDependencies ?? []) {
			await visit(dep)
		}
		order.push(name)
	}

	for (const name of names) {
		await visit(name)
	}
	return order.map((n) => seen.get(n) as RegistryItem)
}
