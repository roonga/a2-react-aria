// Generates schema.json from the A2NodeSchema using Zod v4's built-in toJSONSchema.
// Run via: pnpm gen-schema (writes to schema.json in this package root)
import { writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { z } from "zod"
import { A2NodeSchema } from "../src/schema/node.ts"

const __dirname = dirname(fileURLToPath(import.meta.url))

const jsonSchema = z.toJSONSchema(A2NodeSchema, {
	target: "draft-7",
	$schema: true,
})

const output = {
	$schema: "http://json-schema.org/draft-07/schema#",
	title: "a2UI Node",
	description: "Schema for a2UI JSON nodes rendered by A2Renderer",
	...jsonSchema,
}

const outPath = resolve(__dirname, "../schema.json")
writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`)
console.log(`Written: ${outPath}`)
