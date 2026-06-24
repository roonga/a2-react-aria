export interface RegistryFile {
	path: string
	content: string
	type: "registry:component"
}

export interface RegistryItem {
	name: string
	type: "registry:component"
	title?: string
	description?: string
	dependencies?: string[]
	registryDependencies?: string[]
	files: RegistryFile[]
}

export interface RegistryIndexEntry {
	name: string
	title?: string
	description?: string
	dependencies?: string[]
	files?: number
}

export interface RegistryIndex {
	name?: string
	homepage?: string
	components: RegistryIndexEntry[]
}

export interface Config {
	componentsDir: string
	registry?: string
	schema?: {
		/** Path to the file that exports registrySchemas (or a default export of the same shape). */
		entry?: string
		/** Output path for the generated schema file. Default: public/a2ui-schema.json */
		out?: string
	}
}
