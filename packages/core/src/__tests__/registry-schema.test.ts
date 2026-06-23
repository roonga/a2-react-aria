import { describe, expect, it } from "vitest"
import { z } from "zod"
import { defaultRegistry } from "../registry/defaultRegistry"
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

	it("covers all 23 built-in component types", () => {
		const schema = buildRegistrySchema(defaultRegistry)
		const union = schema as z.ZodUnion<[z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]>
		expect(union.options.length).toBe(23)
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

	it("produces oneOf with 23 entries", () => {
		const json = toJsonSchema(defaultRegistry) as Record<string, unknown>
		const entries = (json.oneOf ?? json.anyOf) as unknown[]
		expect(entries).toHaveLength(23)
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

	it("custom registry with extra schema is reflected in the output", () => {
		const CustomSchema = z.object({ type: z.literal("Banner"), props: z.object({ message: z.string() }).optional() })
		const customRegistry = new Map(defaultRegistry)
		customRegistry.set("Banner", { component: (() => null) as never, schema: CustomSchema })
		const json = toJsonSchema(customRegistry) as Record<string, unknown>
		const entries = (json.oneOf ?? json.anyOf) as unknown[]
		expect(entries).toHaveLength(24)
	})
})
