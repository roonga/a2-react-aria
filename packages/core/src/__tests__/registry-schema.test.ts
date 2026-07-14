import { describe, expect, it } from "vitest"
import { z } from "zod"
import { defaultRegistry } from "../registry/defaultRegistry"
import { createRegistry, createStrictRegistry } from "../registry/registry"
import { buildRegistrySchema, toJsonSchema } from "../registry-schema"

describe("buildRegistrySchema", () => {
	it("returns a Zod schema that accepts a valid Button node", () => {
		const schema = buildRegistrySchema(defaultRegistry)
		const result = schema.safeParse({ type: "Button", props: { variant: "primary" }, children: "Click me" })
		expect(result.success).toBe(true)
	})

	it("returns a Zod schema that accepts a valid TextField node", () => {
		const schema = buildRegistrySchema(defaultRegistry)
		const result = schema.safeParse({ type: "TextField", props: { label: "Name", isRequired: true } })
		expect(result.success).toBe(true)
	})

	it("rejects a node with an unknown type", () => {
		const schema = buildRegistrySchema(defaultRegistry)
		const result = schema.safeParse({ type: "CustomWidget", props: {} })
		expect(result.success).toBe(false)
	})

	it("rejects a Button with an invalid variant", () => {
		const schema = buildRegistrySchema(defaultRegistry)
		const result = schema.safeParse({ type: "Button", props: { variant: "purple" } })
		expect(result.success).toBe(false)
	})

	it("covers all 28 built-in component types", () => {
		const schema = buildRegistrySchema(defaultRegistry)
		const union = schema as z.ZodUnion<[z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]>
		expect(union.options.length).toBe(28)
	})

	it("throws when registry has no schemas", () => {
		const empty = new Map([["NoSchema", { component: (() => null) as never }]])
		expect(() => buildRegistrySchema(empty)).toThrow("no schemas")
	})
})

describe("toJsonSchema", () => {
	it("returns a plain object", () => {
		const json = toJsonSchema(defaultRegistry)
		expect(typeof json).toBe("object")
		expect(json).not.toBeNull()
	})

	it("produces oneOf with 28 entries", () => {
		const json = toJsonSchema(defaultRegistry) as Record<string, unknown>
		const entries = (json.oneOf ?? json.anyOf) as unknown[]
		expect(entries).toHaveLength(28)
	})

	it("each oneOf entry has a type constant property", () => {
		const json = toJsonSchema(defaultRegistry) as Record<string, unknown>
		const entries = (json.oneOf ?? json.anyOf) as Array<Record<string, unknown>>
		const types = entries
			.map((e) => (e.properties as Record<string, { const?: string }> | undefined)?.type?.const)
			.filter(Boolean)
		expect(types).toContain("Button")
		expect(types).toContain("TextField")
		expect(types).toContain("Form")
	})

	it("custom registry with extra schema is reflected in output", () => {
		const CustomSchema = z.object({ type: z.literal("Banner"), props: z.object({ message: z.string() }).optional() })
		const customRegistry = new Map(defaultRegistry)
		customRegistry.set("Banner", { component: (() => null) as never, schema: CustomSchema })
		const json = toJsonSchema(customRegistry) as Record<string, unknown>
		const entries = (json.oneOf ?? json.anyOf) as unknown[]
		expect(entries).toHaveLength(29)
	})
})

describe("createRegistry with jsonSchema — registry.validate", () => {
	const jsonSchema = toJsonSchema(defaultRegistry)
	const registry = createRegistry(Object.fromEntries(defaultRegistry), jsonSchema)

	it("accepts an array of valid nodes", () => {
		const nodes = [
			{ type: "Button", children: "Go" },
			{ type: "TextField", props: { label: "Name" } },
		]
		expect(registry.validate(nodes).success).toBe(true)
	})

	it("rejects a node with an unknown type", () => {
		const r = registry.validate([{ type: "Button", children: "Go" }, { type: "Ghost" }])
		expect(r.success).toBe(false)
		expect(r.error).toBeDefined()
	})

	it("rejects a node with an invalid prop value", () => {
		expect(registry.validate([{ type: "Button", props: { variant: "purple" } }]).success).toBe(false)
	})

	it("rejects a valid node whose type is not in this registry", () => {
		const partial = createRegistry(Object.fromEntries([...defaultRegistry].filter(([k]) => k !== "Button")), jsonSchema)
		expect(partial.validate([{ type: "Button", children: "Go" }]).success).toBe(false)
	})

	it("accepts an empty array", () => {
		expect(registry.validate([]).success).toBe(true)
	})
})

describe("createStrictRegistry", () => {
	it("accepts a registry when every entry has a schema", () => {
		// defaultRegistry is known at runtime to have a schema on every entry; ComponentEntry's
		// schema field is optional so this cast is required to satisfy StrictRegistryEntryInput.
		const entries = Object.fromEntries(defaultRegistry) as unknown as Parameters<typeof createStrictRegistry>[0]
		expect(() => createStrictRegistry(entries)).not.toThrow()
	})

	it("rejects an entry without a schema", () => {
		// Cast bypasses the compile-time requirement to verify the runtime guard for JS (non-TS) consumers.
		const entries = { Unsafe: { component: (() => null) as never } } as unknown as Parameters<
			typeof createStrictRegistry
		>[0]
		expect(() => createStrictRegistry(entries)).toThrow(
			'Strict registry entry "Unsafe" must define a schema with a safeParse method.',
		)
	})

	it("rejects an entry whose schema does not implement safeParse", () => {
		const entries = { Malformed: { component: (() => null) as never, schema: {} } } as unknown as Parameters<
			typeof createStrictRegistry
		>[0]
		expect(() => createStrictRegistry(entries)).toThrow(
			'Strict registry entry "Malformed" must define a schema with a safeParse method.',
		)
	})
})
