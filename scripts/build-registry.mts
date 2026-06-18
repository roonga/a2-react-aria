// Generates the shadcn-compatible component registry from packages/core source.
//
// Reads every component directory under packages/core/src/components/* and emits:
//   registry/index.json        — list of available components (name, title, deps, file count)
//   registry/<name>.json       — full registry item with embedded file contents
//
// The CLI (`a2ra add <name>`) consumes these JSON files, copying the embedded
// source into a consumer project. Run via: pnpm build:registry
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, "..")
const COMPONENTS_DIR = resolve(ROOT, "packages/core/src/components")
const OUT_DIR = resolve(ROOT, "registry")

// Packages assumed already present in a consumer's React project — never listed
// as an install dependency of a copied component.
const PEER_PACKAGES = new Set(["react", "react-dom"])

// Human-friendly metadata per component directory. Keys are directory names.
const META: Record<string, { title: string; description: string }> = {
	breadcrumb: { title: "Breadcrumb", description: "Hierarchical navigation with React Aria Breadcrumbs." },
	button: { title: "Button", description: "Pressable button with variants and sizes." },
	card: { title: "Card", description: "Surface container for grouping content." },
	checkbox: { title: "Checkbox", description: "Checkbox and CheckboxGroup form controls." },
	"date-picker": { title: "DatePicker", description: "DatePicker and DateRangePicker calendar inputs." },
	dialog: { title: "Dialog", description: "Modal dialog built on React Aria overlays." },
	form: { title: "Form", description: "Form layout container with validation wiring." },
	layout: { title: "Layout", description: "Flex and Grid layout primitives." },
	menu: { title: "Menu", description: "Menu and MenuTrigger with selection support." },
	"number-field": { title: "NumberField", description: "Numeric input with stepper buttons." },
	popover: { title: "Popover", description: "Non-modal floating overlay." },
	radio: { title: "RadioGroup", description: "Radio and RadioGroup single-select controls." },
	select: { title: "Select", description: "Select / ComboBox dropdown input." },
	switch: { title: "Switch", description: "On/off toggle switch." },
	table: { title: "Table", description: "Sortable, selectable data table." },
	tabs: { title: "Tabs", description: "Tabbed navigation panels." },
	text: { title: "Text", description: "Typographic text primitive." },
	"text-field": { title: "TextField", description: "Single-line text input with label and validation." },
	tooltip: { title: "Tooltip", description: "Accessible hover/focus tooltip." },
}

interface RegistryFile {
	path: string
	content: string
	type: "registry:component"
}

interface RegistryItem {
	$schema: string
	name: string
	type: "registry:component"
	title: string
	description: string
	dependencies: string[]
	registryDependencies: string[]
	files: RegistryFile[]
}

// Extract bare (npm) import specifiers from a source file, normalised to the
// package name (drops subpaths, keeps the scope for @scoped packages).
function extractNpmDeps(source: string): Set<string> {
	const deps = new Set<string>()
	const re = /(?:from|import)\s+["']([^"']+)["']/g
	let m: RegExpExecArray | null
	// biome-ignore lint/suspicious/noAssignInExpressions: standard regex exec loop
	while ((m = re.exec(source)) !== null) {
		const spec = m[1]
		if (spec.startsWith(".") || spec.startsWith("/")) continue
		const parts = spec.split("/")
		const pkg = spec.startsWith("@") ? `${parts[0]}/${parts[1]}` : parts[0]
		if (!PEER_PACKAGES.has(pkg)) deps.add(pkg)
	}
	return deps
}

function readComponentDirs(): string[] {
	return readdirSync(COMPONENTS_DIR)
		.filter((name) => statSync(join(COMPONENTS_DIR, name)).isDirectory())
		.sort()
}

function buildItem(name: string): RegistryItem {
	const dir = join(COMPONENTS_DIR, name)
	const sourceFiles = readdirSync(dir).filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"))
	const deps = new Set<string>()
	const files: RegistryFile[] = []

	for (const file of sourceFiles.sort()) {
		const abs = join(dir, file)
		const content = readFileSync(abs, "utf8")
		for (const d of extractNpmDeps(content)) deps.add(d)
		files.push({
			path: `${name}/${file}`,
			content,
			type: "registry:component",
		})
	}

	const meta = META[name] ?? { title: name, description: `${name} component.` }
	return {
		$schema: "https://raw.githubusercontent.com/roonga/a2-react-aria/main/registry/schema.json",
		name,
		type: "registry:component",
		title: meta.title,
		description: meta.description,
		dependencies: [...deps].sort(),
		registryDependencies: [],
		files,
	}
}

function main(): void {
	mkdirSync(OUT_DIR, { recursive: true })
	// Remove previously generated items + index, but preserve the hand-maintained schema.json.
	for (const f of readdirSync(OUT_DIR)) {
		if (f.endsWith(".json") && f !== "schema.json") rmSync(join(OUT_DIR, f))
	}

	const names = readComponentDirs()
	const index: Array<{ name: string; title: string; description: string; dependencies: string[]; files: number }> = []

	for (const name of names) {
		const item = buildItem(name)
		writeFileSync(join(OUT_DIR, `${name}.json`), `${JSON.stringify(item, null, 2)}\n`)
		index.push({
			name: item.name,
			title: item.title,
			description: item.description,
			dependencies: item.dependencies,
			files: item.files.length,
		})
	}

	const indexDoc = {
		$schema: "https://raw.githubusercontent.com/roonga/a2-react-aria/main/registry/schema.json",
		name: "a2-react-aria",
		homepage: "https://github.com/roonga/a2-react-aria",
		components: index,
	}
	writeFileSync(join(OUT_DIR, "index.json"), `${JSON.stringify(indexDoc, null, 2)}\n`)

	console.log(`Wrote ${names.length} component(s) to ${relative(ROOT, OUT_DIR)}/`)
}

main()
