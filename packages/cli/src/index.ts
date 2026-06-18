#!/usr/bin/env node
import { readFileSync } from "node:fs"
import { parseArgs } from "node:util"
import { add } from "./commands/add.js"
import { diff } from "./commands/diff.js"
import { init } from "./commands/init.js"
import { list } from "./commands/list.js"
import { bold, cyan, dim, fail, info } from "./ui.js"

function version(): string {
	try {
		const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as { version: string }
		return pkg.version
	} catch {
		return "0.0.0"
	}
}

const HELP = `${bold("a2ra")} — add React Aria a2UI components to your project, shadcn-style.

${bold("Usage:")}
  a2ra <command> [options]

${bold("Commands:")}
  init                 Create an a2ra.json config in the current directory
  list                 List available components in the registry
  add <component...>   Copy one or more components into your project
  diff [component]     Compare installed components against the registry

${bold("Options:")}
  --registry <url>     Registry URL or local path (default: official registry)
  --dir <path>         Target components directory (overrides a2ra.json)
  --overwrite          Overwrite existing files (add)
  --force              Overwrite existing a2ra.json (init)
  --json               Machine-readable output (list)
  -h, --help           Show this help
  -v, --version        Show version

${bold("Examples:")}
  ${dim("$")} ${cyan("a2ra init")}
  ${dim("$")} ${cyan("a2ra add button text-field")}
  ${dim("$")} ${cyan("a2ra list --registry ./registry")}
`

async function main(): Promise<void> {
	const { values, positionals } = parseArgs({
		allowPositionals: true,
		options: {
			registry: { type: "string" },
			dir: { type: "string" },
			overwrite: { type: "boolean" },
			json: { type: "boolean" },
			force: { type: "boolean" },
			help: { type: "boolean", short: "h" },
			version: { type: "boolean", short: "v" },
		},
	})

	if (values.version) {
		info(version())
		return
	}

	const [command, ...args] = positionals

	if (!command || values.help) {
		info(HELP)
		return
	}

	switch (command) {
		case "init":
			init({ dir: values.dir, registry: values.registry, force: values.force })
			break
		case "list":
			await list({ registry: values.registry, json: values.json })
			break
		case "add":
			await add(args, { registry: values.registry, dir: values.dir, overwrite: values.overwrite })
			break
		case "diff":
			await diff(args[0], { registry: values.registry, dir: values.dir })
			break
		default:
			fail(`Unknown command: ${command}\nRun \`a2ra --help\` for usage.`)
	}
}

main().catch((err: unknown) => {
	fail(err instanceof Error ? err.message : String(err))
})
