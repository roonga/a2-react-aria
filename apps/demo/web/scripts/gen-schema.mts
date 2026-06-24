// Generates public/a2ui-schema.json from the app's registered component schemas.
// Run at dev time whenever you add or change a component:
//
//   pnpm gen-schema
//
// Commit the output — the Python backend (or any other service) loads it as a
// static JSON Schema to validate a2UI nodes before sending them to the renderer.
import { writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { z } from "zod"
import { registrySchemas } from "../lib/registry-schemas.ts"

const __dirname = dirname(fileURLToPath(import.meta.url))

const schemas = Object.values(registrySchemas) as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]
const unionSchema = z.union(schemas)

const jsonSchema = z.toJSONSchema(unionSchema, { target: "draft-7", $schema: true })

const output = {
	$schema: "http://json-schema.org/draft-07/schema#",
	title: "a2UI Node",
	description: `JSON Schema for a2UI nodes accepted by this app (${schemas.length} component types). Validate agent output against this before rendering.`,
	...jsonSchema,
}

const outPath = resolve(__dirname, "../public/a2ui-schema.json")
writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`)
console.log(`Written: public/a2ui-schema.json (${schemas.length} component types)`)
