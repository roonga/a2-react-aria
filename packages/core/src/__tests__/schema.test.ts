import { describe, expect, it } from "vitest"
import { parseNode, safeParseNode } from "../schema"

describe("A2NodeSchema", () => {
	it("parses a minimal node", () => {
		const node = parseNode({ type: "Button" })
		expect(node.type).toBe("Button")
	})

	it("parses a node with props", () => {
		const node = parseNode({ type: "Button", props: { variant: "primary" } })
		expect(node.props?.variant).toBe("primary")
	})

	it("parses a node with string children", () => {
		const node = parseNode({ type: "Button", children: "Click me" })
		expect(node.children).toBe("Click me")
	})

	it("parses a node with array children", () => {
		const node = parseNode({
			type: "Form",
			children: [{ type: "TextField" }, { type: "Button" }],
		})
		expect(Array.isArray(node.children)).toBe(true)
	})

	it("parses deeply nested children", () => {
		const node = parseNode({
			type: "Form",
			children: {
				type: "Button",
				children: "Submit",
			},
		})
		const child = node.children as { type: string; children: string }
		expect(child.type).toBe("Button")
		expect(child.children).toBe("Submit")
	})

	it("rejects a node with empty type", () => {
		const result = safeParseNode({ type: "" })
		expect(result.success).toBe(false)
	})

	it("rejects a node missing type", () => {
		const result = safeParseNode({ props: {} })
		expect(result.success).toBe(false)
	})
})
