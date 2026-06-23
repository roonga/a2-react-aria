import { z } from "zod"
import type { ComponentRegistry } from "./types"

export function buildRegistrySchema(registry: ComponentRegistry): z.ZodTypeAny {
	const schemas = [...registry.values()].map((e) => e.schema).filter((s): s is NonNullable<typeof s> => s != null)

	if (schemas.length === 0) {
		throw new Error("Registry contains no schemas. Add a schema to at least one ComponentEntry.")
	}

	if (schemas.length === 1) {
		return schemas[0] as z.ZodTypeAny
	}

	return z.union(schemas as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]])
}

export function toJsonSchema(registry: ComponentRegistry): object {
	return z.toJSONSchema(buildRegistrySchema(registry))
}

export interface NodeValidatorResult {
	success: boolean
	error?: string
}

type JsonSchemaInput = Parameters<typeof z.fromJSONSchema>[0]

export function createNodeValidator(
	jsonSchema: object,
	registry: ComponentRegistry,
): (nodes: unknown[]) => NodeValidatorResult {
	const allowedTypes = new Set(registry.keys())
	const nodeSchema = z.fromJSONSchema(jsonSchema as JsonSchemaInput).refine(
		(node) => {
			const type = (node as Record<string, unknown>).type
			return typeof type === "string" && allowedTypes.has(type)
		},
		{ message: "Component type is not in the registry" },
	)
	const arraySchema = z.array(nodeSchema)
	return (nodes) => {
		const result = arraySchema.safeParse(nodes)
		if (result.success) return { success: true }
		return { success: false, error: result.error.message }
	}
}
