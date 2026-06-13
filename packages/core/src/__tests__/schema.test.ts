import { describe, expect, it } from "vitest"
import { ButtonSchema } from "../components/button"
import { CheckboxGroupSchema, CheckboxSchema } from "../components/checkbox"
import { TextFieldSchema } from "../components/text-field"
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

describe("ButtonSchema", () => {
	it("parses a minimal button node", () => {
		expect(ButtonSchema.safeParse({ type: "Button" }).success).toBe(true)
	})

	it("parses all valid variants", () => {
		for (const variant of ["primary", "secondary", "danger", "ghost"]) {
			expect(ButtonSchema.safeParse({ type: "Button", props: { variant } }).success).toBe(true)
		}
	})

	it("rejects an invalid variant", () => {
		expect(ButtonSchema.safeParse({ type: "Button", props: { variant: "outline" } }).success).toBe(false)
	})

	it("parses all valid sizes", () => {
		for (const size of ["sm", "md", "lg"]) {
			expect(ButtonSchema.safeParse({ type: "Button", props: { size } }).success).toBe(true)
		}
	})

	it("rejects an invalid size", () => {
		expect(ButtonSchema.safeParse({ type: "Button", props: { size: "xl" } }).success).toBe(false)
	})

	it("rejects wrong type literal", () => {
		expect(ButtonSchema.safeParse({ type: "button" }).success).toBe(false)
	})
})

describe("TextFieldSchema", () => {
	it("parses a minimal text field node", () => {
		expect(TextFieldSchema.safeParse({ type: "TextField" }).success).toBe(true)
	})

	it("parses all valid input types", () => {
		for (const type of ["text", "email", "password", "number", "tel", "url"]) {
			expect(TextFieldSchema.safeParse({ type: "TextField", props: { type } }).success).toBe(true)
		}
	})

	it("rejects an invalid input type", () => {
		expect(TextFieldSchema.safeParse({ type: "TextField", props: { type: "date" } }).success).toBe(false)
	})

	it("rejects a non-string label", () => {
		expect(TextFieldSchema.safeParse({ type: "TextField", props: { label: 42 } }).success).toBe(false)
	})

	it("rejects wrong type literal", () => {
		expect(TextFieldSchema.safeParse({ type: "text-field" }).success).toBe(false)
	})
})

describe("CheckboxSchema", () => {
	it("parses a minimal checkbox node", () => {
		expect(CheckboxSchema.safeParse({ type: "Checkbox" }).success).toBe(true)
	})

	it("parses a checkbox with all props", () => {
		expect(
			CheckboxSchema.safeParse({
				type: "Checkbox",
				props: {
					label: "Accept",
					value: "accept",
					isSelected: true,
					defaultSelected: false,
					isDisabled: false,
					isRequired: true,
					isIndeterminate: false,
				},
			}).success,
		).toBe(true)
	})

	it("rejects a non-boolean isSelected", () => {
		expect(CheckboxSchema.safeParse({ type: "Checkbox", props: { isSelected: "yes" } }).success).toBe(false)
	})

	it("rejects a non-string label", () => {
		expect(CheckboxSchema.safeParse({ type: "Checkbox", props: { label: 123 } }).success).toBe(false)
	})

	it("rejects wrong type literal", () => {
		expect(CheckboxSchema.safeParse({ type: "checkbox" }).success).toBe(false)
	})
})

describe("CheckboxGroupSchema", () => {
	it("parses a minimal group node", () => {
		expect(CheckboxGroupSchema.safeParse({ type: "CheckboxGroup" }).success).toBe(true)
	})

	it("parses both valid orientations", () => {
		for (const orientation of ["horizontal", "vertical"]) {
			expect(CheckboxGroupSchema.safeParse({ type: "CheckboxGroup", props: { orientation } }).success).toBe(true)
		}
	})

	it("rejects an invalid orientation", () => {
		expect(CheckboxGroupSchema.safeParse({ type: "CheckboxGroup", props: { orientation: "diagonal" } }).success).toBe(false)
	})

	it("parses value as string array", () => {
		expect(
			CheckboxGroupSchema.safeParse({ type: "CheckboxGroup", props: { value: ["a", "b"] } }).success,
		).toBe(true)
	})

	it("rejects value as non-array", () => {
		expect(CheckboxGroupSchema.safeParse({ type: "CheckboxGroup", props: { value: "a" } }).success).toBe(false)
	})

	it("rejects wrong type literal", () => {
		expect(CheckboxGroupSchema.safeParse({ type: "checkboxGroup" }).success).toBe(false)
	})
})
