import { describe, expect, it } from "vitest"
import { ButtonSchema } from "../components/button"
import { CheckboxGroupSchema, CheckboxSchema } from "../components/checkbox"
import { DialogSchema } from "../components/dialog"
import { FormSchema } from "../components/form"
import { MenuSchema } from "../components/menu"
import { PopoverSchema } from "../components/popover"
import { RadioGroupSchema, RadioSchema } from "../components/radio"
import { SelectSchema } from "../components/select"
import { SwitchSchema } from "../components/switch"
import { TextFieldSchema } from "../components/text-field"
import { TooltipSchema } from "../components/tooltip"
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
		expect(CheckboxGroupSchema.safeParse({ type: "CheckboxGroup", props: { orientation: "diagonal" } }).success).toBe(
			false,
		)
	})

	it("parses value as string array", () => {
		expect(CheckboxGroupSchema.safeParse({ type: "CheckboxGroup", props: { value: ["a", "b"] } }).success).toBe(true)
	})

	it("rejects value as non-array", () => {
		expect(CheckboxGroupSchema.safeParse({ type: "CheckboxGroup", props: { value: "a" } }).success).toBe(false)
	})

	it("rejects wrong type literal", () => {
		expect(CheckboxGroupSchema.safeParse({ type: "checkboxGroup" }).success).toBe(false)
	})
})

describe("RadioSchema", () => {
	it("parses a minimal radio node", () => {
		expect(RadioSchema.safeParse({ type: "Radio", props: { value: "opt" } }).success).toBe(true)
	})

	it("parses a radio with all props", () => {
		expect(
			RadioSchema.safeParse({ type: "Radio", props: { label: "Option A", value: "a", isDisabled: false } }).success,
		).toBe(true)
	})

	it("rejects a non-boolean isDisabled", () => {
		expect(RadioSchema.safeParse({ type: "Radio", props: { value: "a", isDisabled: "yes" } }).success).toBe(false)
	})

	it("rejects a non-string label", () => {
		expect(RadioSchema.safeParse({ type: "Radio", props: { value: "a", label: 42 } }).success).toBe(false)
	})

	it("rejects wrong type literal", () => {
		expect(RadioSchema.safeParse({ type: "radio" }).success).toBe(false)
	})
})

describe("RadioGroupSchema", () => {
	it("parses a minimal radio group node", () => {
		expect(RadioGroupSchema.safeParse({ type: "RadioGroup" }).success).toBe(true)
	})

	it("parses both valid orientations", () => {
		for (const orientation of ["horizontal", "vertical"]) {
			expect(RadioGroupSchema.safeParse({ type: "RadioGroup", props: { orientation } }).success).toBe(true)
		}
	})

	it("rejects an invalid orientation", () => {
		expect(RadioGroupSchema.safeParse({ type: "RadioGroup", props: { orientation: "diagonal" } }).success).toBe(false)
	})

	it("parses a string value", () => {
		expect(RadioGroupSchema.safeParse({ type: "RadioGroup", props: { value: "opt1" } }).success).toBe(true)
	})

	it("rejects a non-string value", () => {
		expect(RadioGroupSchema.safeParse({ type: "RadioGroup", props: { value: 42 } }).success).toBe(false)
	})

	it("rejects wrong type literal", () => {
		expect(RadioGroupSchema.safeParse({ type: "radioGroup" }).success).toBe(false)
	})
})

describe("SwitchSchema", () => {
	it("parses a minimal switch node", () => {
		expect(SwitchSchema.safeParse({ type: "Switch" }).success).toBe(true)
	})

	it("parses a switch with all boolean props", () => {
		expect(
			SwitchSchema.safeParse({
				type: "Switch",
				props: { label: "Dark mode", isSelected: true, isDisabled: false, isRequired: false, isInvalid: false },
			}).success,
		).toBe(true)
	})

	it("rejects a non-boolean isSelected", () => {
		expect(SwitchSchema.safeParse({ type: "Switch", props: { isSelected: "on" } }).success).toBe(false)
	})

	it("rejects a non-string label", () => {
		expect(SwitchSchema.safeParse({ type: "Switch", props: { label: 99 } }).success).toBe(false)
	})

	it("rejects wrong type literal", () => {
		expect(SwitchSchema.safeParse({ type: "switch" }).success).toBe(false)
	})
})

describe("DialogSchema", () => {
	it("parses a minimal dialog node", () => {
		expect(DialogSchema.safeParse({ type: "Dialog" }).success).toBe(true)
	})

	it("parses both valid role values", () => {
		for (const role of ["dialog", "alertdialog"]) {
			expect(DialogSchema.safeParse({ type: "Dialog", props: { role } }).success).toBe(true)
		}
	})

	it("rejects an invalid role", () => {
		expect(DialogSchema.safeParse({ type: "Dialog", props: { role: "tooltip" } }).success).toBe(false)
	})

	it("parses a dialog with all props", () => {
		expect(
			DialogSchema.safeParse({
				type: "Dialog",
				props: {
					title: "Hello",
					description: "World",
					triggerLabel: "Open",
					isDismissable: true,
					isKeyboardDismissDisabled: false,
					role: "dialog",
					isOpen: false,
				},
			}).success,
		).toBe(true)
	})

	it("rejects a non-boolean isDismissable", () => {
		expect(DialogSchema.safeParse({ type: "Dialog", props: { isDismissable: "yes" } }).success).toBe(false)
	})

	it("rejects a non-string title", () => {
		expect(DialogSchema.safeParse({ type: "Dialog", props: { title: 42 } }).success).toBe(false)
	})

	it("rejects wrong type literal", () => {
		expect(DialogSchema.safeParse({ type: "dialog" }).success).toBe(false)
	})
})

describe("FormSchema", () => {
	it("parses a minimal form node", () => {
		expect(FormSchema.safeParse({ type: "Form" }).success).toBe(true)
	})

	it("parses all valid gap values", () => {
		for (const gap of ["sm", "md", "lg"]) {
			expect(FormSchema.safeParse({ type: "Form", props: { gap } }).success).toBe(true)
		}
	})

	it("rejects an invalid gap value", () => {
		expect(FormSchema.safeParse({ type: "Form", props: { gap: "xl" } }).success).toBe(false)
	})

	it("parses all valid validationBehavior values", () => {
		for (const validationBehavior of ["aria", "native"]) {
			expect(FormSchema.safeParse({ type: "Form", props: { validationBehavior } }).success).toBe(true)
		}
	})

	it("rejects an invalid validationBehavior", () => {
		expect(FormSchema.safeParse({ type: "Form", props: { validationBehavior: "custom" } }).success).toBe(false)
	})

	it("parses all valid method values", () => {
		for (const method of ["get", "post"]) {
			expect(FormSchema.safeParse({ type: "Form", props: { method } }).success).toBe(true)
		}
	})

	it("rejects an invalid method", () => {
		expect(FormSchema.safeParse({ type: "Form", props: { method: "put" } }).success).toBe(false)
	})

	it("rejects wrong type literal", () => {
		expect(FormSchema.safeParse({ type: "form" }).success).toBe(false)
	})
})

describe("MenuSchema", () => {
	it("parses a minimal menu node", () => {
		expect(MenuSchema.safeParse({ type: "Menu" }).success).toBe(true)
	})

	it("parses a menu with items", () => {
		expect(
			MenuSchema.safeParse({
				type: "Menu",
				props: { items: [{ id: "a", label: "Item A" }, { id: "b", label: "Item B", isDisabled: true }] },
			}).success,
		).toBe(true)
	})

	it("rejects an item missing id", () => {
		expect(MenuSchema.safeParse({ type: "Menu", props: { items: [{ label: "No id" }] } }).success).toBe(false)
	})

	it("parses all valid selectionMode values", () => {
		for (const selectionMode of ["none", "single", "multiple"]) {
			expect(MenuSchema.safeParse({ type: "Menu", props: { selectionMode } }).success).toBe(true)
		}
	})

	it("rejects an invalid selectionMode", () => {
		expect(MenuSchema.safeParse({ type: "Menu", props: { selectionMode: "all" } }).success).toBe(false)
	})

	it("rejects wrong type literal", () => {
		expect(MenuSchema.safeParse({ type: "menu" }).success).toBe(false)
	})
})

describe("PopoverSchema", () => {
	it("parses a minimal popover node", () => {
		expect(PopoverSchema.safeParse({ type: "Popover" }).success).toBe(true)
	})

	it("parses all valid placement values", () => {
		for (const placement of ["top", "bottom", "left", "right"]) {
			expect(PopoverSchema.safeParse({ type: "Popover", props: { placement } }).success).toBe(true)
		}
	})

	it("rejects an invalid placement", () => {
		expect(PopoverSchema.safeParse({ type: "Popover", props: { placement: "center" } }).success).toBe(false)
	})

	it("rejects a non-string triggerLabel", () => {
		expect(PopoverSchema.safeParse({ type: "Popover", props: { triggerLabel: 42 } }).success).toBe(false)
	})

	it("rejects wrong type literal", () => {
		expect(PopoverSchema.safeParse({ type: "popover" }).success).toBe(false)
	})
})

describe("TooltipSchema", () => {
	it("parses a minimal tooltip node", () => {
		expect(TooltipSchema.safeParse({ type: "Tooltip" }).success).toBe(true)
	})

	it("parses all valid placement values", () => {
		for (const placement of ["top", "bottom", "left", "right"]) {
			expect(TooltipSchema.safeParse({ type: "Tooltip", props: { placement } }).success).toBe(true)
		}
	})

	it("rejects an invalid placement", () => {
		expect(TooltipSchema.safeParse({ type: "Tooltip", props: { placement: "center" } }).success).toBe(false)
	})

	it("rejects a non-string content", () => {
		expect(TooltipSchema.safeParse({ type: "Tooltip", props: { content: 99 } }).success).toBe(false)
	})

	it("rejects wrong type literal", () => {
		expect(TooltipSchema.safeParse({ type: "tooltip" }).success).toBe(false)
	})
})

describe("SelectSchema", () => {
	it("parses a minimal select node", () => {
		expect(SelectSchema.safeParse({ type: "Select" }).success).toBe(true)
	})

	it("parses a select with items", () => {
		expect(
			SelectSchema.safeParse({
				type: "Select",
				props: { label: "Fruit", items: [{ label: "Apple", value: "apple" }] },
			}).success,
		).toBe(true)
	})

	it("rejects an item missing value", () => {
		expect(
			SelectSchema.safeParse({
				type: "Select",
				props: { items: [{ label: "Apple" }] },
			}).success,
		).toBe(false)
	})

	it("rejects a non-string label", () => {
		expect(SelectSchema.safeParse({ type: "Select", props: { label: 42 } }).success).toBe(false)
	})

	it("rejects wrong type literal", () => {
		expect(SelectSchema.safeParse({ type: "select" }).success).toBe(false)
	})
})
