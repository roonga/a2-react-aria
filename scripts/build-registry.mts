// Generates the shadcn-compatible component registry from packages/core source.
//
// Reads every component directory under packages/core/src/components/* and emits:
//   registry/index.json        — list of available components (name, title, deps, file count)
//   registry/<name>.json       — full registry item with embedded file contents
//
// The CLI (`a2ra add <name>`) consumes these JSON files, copying the embedded
// source into a consumer project. Run via: pnpm build:registry
//
// An item carries its component's own directory PLUS every file it imports from
// elsewhere under the components root, followed transitively. Those shared files are
// what a component needs to compile and they belong to no directory of their own, so a
// generator that emitted only `<name>/*` shipped an item whose copied source could not
// build: `group-schema-fields.ts` is imported by the checkbox and radio schemas and was
// in no item at all, which is a dangling import in every consumer that vendored either.
// Imports that resolve OUTSIDE the components root stay the consumer's own (`form-state`,
// `action-context`); those are part of the runtime a consumer installs, not of the
// copied source.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs"
import { dirname, join, relative, resolve, sep } from "node:path"
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
	"text-area": { title: "TextArea", description: "Multiline text input with label, validation, and error messages." },
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

// Relative import specifiers used by a source file, in source order.
function extractRelativeImports(source: string): string[] {
	const specs: string[] = []
	const re = /(?:from|import)\s+["'](\.[^"']*)["']/g
	let m: RegExpExecArray | null
	// biome-ignore lint/suspicious/noAssignInExpressions: standard regex exec loop
	while ((m = re.exec(source)) !== null) {
		const spec = m[1]
		if (spec) specs.push(spec)
	}
	return specs
}

// Resolve a relative specifier the way TypeScript would, to a file this generator can
// embed. Returns null when nothing on disk answers it, which is how a specifier that
// points at a directory of the consumer's own is ignored rather than guessed at.
function resolveRelativeImport(fromFile: string, spec: string): string | null {
	const base = resolve(dirname(fromFile), spec)
	// `base` first: this codebase writes the extension in the specifier
	// (`../group-schema-fields.ts`), which the extensionless forms below would miss.
	const candidates = [base, `${base}.ts`, `${base}.tsx`, join(base, "index.ts"), join(base, "index.tsx")]
	for (const candidate of candidates) {
		if (existsSync(candidate) && statSync(candidate).isFile()) return candidate
	}
	return null
}

// Whether `file` lives under `dir`.
function isUnder(dir: string, file: string): boolean {
	const rel = relative(dir, file)
	return rel !== "" && !rel.startsWith("..") && !rel.startsWith(sep)
}

// Every file under the components root that `entryFiles` reach through relative imports
// and that lives outside `componentDir`, followed transitively and returned sorted by
// their path relative to the components root.
function sharedFilesFor(componentDir: string, entryFiles: string[]): string[] {
	const seen = new Set(entryFiles)
	const queue = [...entryFiles]
	const shared = new Set<string>()

	while (queue.length > 0) {
		const current = queue.pop()
		if (current === undefined) break
		const source = readFileSync(current, "utf8")
		for (const spec of extractRelativeImports(source)) {
			const resolved = resolveRelativeImport(current, spec)
			if (resolved === null || seen.has(resolved)) continue
			if (!isUnder(COMPONENTS_DIR, resolved) || isUnder(componentDir, resolved)) continue
			seen.add(resolved)
			shared.add(resolved)
			queue.push(resolved)
		}
	}

	return [...shared].sort()
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
		const content = readFileSync(abs, "utf8").replace(/\r\n/g, "\n")
		for (const d of extractNpmDeps(content)) deps.add(d)
		files.push({
			path: `${name}/${file}`,
			content,
			type: "registry:component",
		})
	}

	// Shared source this component imports from elsewhere under the components root. Its
	// path is relative to the components root, so a consumer receives it at the same place
	// the importing file expects to find it.
	for (const abs of sharedFilesFor(
		dir,
		sourceFiles.map((file) => join(dir, file)),
	)) {
		const content = readFileSync(abs, "utf8").replace(/\r\n/g, "\n")
		for (const d of extractNpmDeps(content)) deps.add(d)
		files.push({
			path: relative(COMPONENTS_DIR, abs).split(sep).join("/"),
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
