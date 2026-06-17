import { describe, expect, it } from "vitest"
import { BreadcrumbSchema } from "../components/breadcrumb"
import { ButtonSchema } from "../components/button"
import { CardSchema } from "../components/card"
import { CheckboxGroupSchema, CheckboxSchema } from "../components/checkbox"
import { DatePickerSchema, DateRangePickerSchema } from "../components/date-picker"
import { DialogSchema } from "../components/dialog"
import { FormSchema } from "../components/form"
import { FlexSchema, GridSchema } from "../components/layout"
import { MenuSchema } from "../components/menu"
import { NumberFieldSchema } from "../components/number-field"
import { PopoverSchema } from "../components/popover"
import { RadioGroupSchema, RadioSchema } from "../components/radio"
import { SelectSchema } from "../components/select"
import { SwitchSchema } from "../components/switch"
import { TableSchema } from "../components/table"
import { TabsSchema } from "../components/tabs"
import { TextSchema } from "../components/text"
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

	it("accepts isDisabled prop", () => {
		expect(ButtonSchema.safeParse({ type: "Button", props: { isDisabled: true } }).success).toBe(true)
	})

	it("strips old DOM prop name 'disabled'", () => {
		const parsed = ButtonSchema.parse({ type: "Button", props: { disabled: true } })
		expect((parsed.props as Record<string, unknown>)?.disabled).toBeUndefined()
	})
})

describe("CardSchema", () => {
	it("parses a minimal card node", () => {
		expect(CardSchema.safeParse({ type: "Card" }).success).toBe(true)
	})

	it("parses all valid padding values", () => {
		for (const padding of ["none", "sm", "md", "lg"]) {
			expect(CardSchema.safeParse({ type: "Card", props: { padding } }).success).toBe(true)
		}
	})

	it("rejects an invalid padding value", () => {
		expect(CardSchema.safeParse({ type: "Card", props: { padding: "xl" } }).success).toBe(false)
	})

	it("parses all valid shadow values", () => {
		for (const shadow of ["none", "sm", "md", "lg"]) {
			expect(CardSchema.safeParse({ type: "Card", props: { shadow } }).success).toBe(true)
		}
	})

	it("parses all valid radius values", () => {
		for (const radius of ["none", "sm", "md", "lg"]) {
			expect(CardSchema.safeParse({ type: "Card", props: { radius } }).success).toBe(true)
		}
	})

	it("parses border as boolean", () => {
		expect(CardSchema.safeParse({ type: "Card", props: { border: true } }).success).toBe(true)
		expect(CardSchema.safeParse({ type: "Card", props: { border: false } }).success).toBe(true)
	})

	it("rejects border as non-boolean", () => {
		expect(CardSchema.safeParse({ type: "Card", props: { border: "yes" } }).success).toBe(false)
	})

	it("parses a card with children", () => {
		expect(CardSchema.safeParse({ type: "Card", children: [{ type: "Text" }] }).success).toBe(true)
	})

	it("rejects wrong type literal", () => {
		expect(CardSchema.safeParse({ type: "card" }).success).toBe(false)
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

	it("parses isRequired, isDisabled, isReadOnly, isInvalid as booleans", () => {
		expect(
			TextFieldSchema.safeParse({
				type: "TextField",
				props: { isRequired: true, isDisabled: false, isReadOnly: false, isInvalid: true },
			}).success,
		).toBe(true)
	})

	it("rejects old DOM prop name 'disabled'", () => {
		// Zod strips unknown keys by default — 'disabled' is not in the schema
		const parsed = TextFieldSchema.parse({ type: "TextField", props: { disabled: true } })
		expect((parsed.props as Record<string, unknown>)?.disabled).toBeUndefined()
	})

	it("rejects old DOM prop name 'required'", () => {
		const parsed = TextFieldSchema.parse({ type: "TextField", props: { required: true } })
		expect((parsed.props as Record<string, unknown>)?.required).toBeUndefined()
	})

	it("parses validation constraint props", () => {
		expect(
			TextFieldSchema.safeParse({
				type: "TextField",
				props: { minLength: 3, maxLength: 50, pattern: "^[a-z]+$" },
			}).success,
		).toBe(true)
	})

	it("rejects non-number minLength", () => {
		expect(TextFieldSchema.safeParse({ type: "TextField", props: { minLength: "3" } }).success).toBe(false)
	})

	it("parses name, description, errorMessage", () => {
		expect(
			TextFieldSchema.safeParse({
				type: "TextField",
				props: { name: "email", description: "We'll never share it", errorMessage: "Invalid email" },
			}).success,
		).toBe(true)
	})

	it("rejects a non-string label", () => {
		expect(TextFieldSchema.safeParse({ type: "TextField", props: { label: 42 } }).success).toBe(false)
	})

	it("rejects wrong type literal", () => {
		expect(TextFieldSchema.safeParse({ type: "text-field" }).success).toBe(false)
	})

	it("accepts both validationBehavior values", () => {
		for (const v of ["aria", "native"]) {
			expect(TextFieldSchema.safeParse({ type: "TextField", props: { validationBehavior: v } }).success).toBe(true)
		}
	})

	it("rejects an invalid validationBehavior", () => {
		expect(TextFieldSchema.safeParse({ type: "TextField", props: { validationBehavior: "html" } }).success).toBe(false)
	})
})

describe("NumberFieldSchema", () => {
	it("parses a minimal number field node", () => {
		expect(NumberFieldSchema.safeParse({ type: "NumberField" }).success).toBe(true)
	})

	it("parses with all numeric props", () => {
		expect(
			NumberFieldSchema.safeParse({
				type: "NumberField",
				props: { minValue: 1, maxValue: 10, step: 1, defaultValue: 2 },
			}).success,
		).toBe(true)
	})

	it("rejects a non-number minValue", () => {
		expect(NumberFieldSchema.safeParse({ type: "NumberField", props: { minValue: "1" } }).success).toBe(false)
	})

	it("parses isRequired and isDisabled as booleans", () => {
		expect(
			NumberFieldSchema.safeParse({ type: "NumberField", props: { isRequired: true, isDisabled: false } }).success,
		).toBe(true)
	})

	it("parses isInvalid and name", () => {
		expect(
			NumberFieldSchema.safeParse({
				type: "NumberField",
				props: { isInvalid: true, name: "quantity", errorMessage: "Must be at least 1" },
			}).success,
		).toBe(true)
	})

	it("rejects non-boolean isInvalid", () => {
		expect(NumberFieldSchema.safeParse({ type: "NumberField", props: { isInvalid: "yes" } }).success).toBe(false)
	})

	it("rejects wrong type literal", () => {
		expect(NumberFieldSchema.safeParse({ type: "numberfield" }).success).toBe(false)
	})

	it("accepts a controlled value", () => {
		expect(NumberFieldSchema.safeParse({ type: "NumberField", props: { value: 42 } }).success).toBe(true)
	})

	it("rejects a non-number value", () => {
		expect(NumberFieldSchema.safeParse({ type: "NumberField", props: { value: "42" } }).success).toBe(false)
	})

	it("accepts both validationBehavior values", () => {
		for (const v of ["aria", "native"]) {
			expect(NumberFieldSchema.safeParse({ type: "NumberField", props: { validationBehavior: v } }).success).toBe(true)
		}
	})

	it("rejects an invalid validationBehavior", () => {
		expect(NumberFieldSchema.safeParse({ type: "NumberField", props: { validationBehavior: "html" } }).success).toBe(
			false,
		)
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

	it("parses isInvalid, errorMessage, and name", () => {
		expect(
			CheckboxSchema.safeParse({
				type: "Checkbox",
				props: { isInvalid: true, errorMessage: "You must agree", name: "terms" },
			}).success,
		).toBe(true)
	})

	it("rejects non-boolean isInvalid", () => {
		expect(CheckboxSchema.safeParse({ type: "Checkbox", props: { isInvalid: "yes" } }).success).toBe(false)
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

	it("accepts isReadOnly", () => {
		expect(CheckboxSchema.safeParse({ type: "Checkbox", props: { isReadOnly: true } }).success).toBe(true)
	})

	it("accepts both validationBehavior values", () => {
		for (const v of ["aria", "native"]) {
			expect(CheckboxSchema.safeParse({ type: "Checkbox", props: { validationBehavior: v } }).success).toBe(true)
		}
	})

	it("rejects an invalid validationBehavior", () => {
		expect(CheckboxSchema.safeParse({ type: "Checkbox", props: { validationBehavior: "html" } }).success).toBe(false)
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

	it("accepts isReadOnly", () => {
		expect(CheckboxGroupSchema.safeParse({ type: "CheckboxGroup", props: { isReadOnly: true } }).success).toBe(true)
	})

	it("accepts both validationBehavior values", () => {
		for (const v of ["aria", "native"]) {
			expect(CheckboxGroupSchema.safeParse({ type: "CheckboxGroup", props: { validationBehavior: v } }).success).toBe(
				true,
			)
		}
	})

	it("rejects an invalid validationBehavior", () => {
		expect(
			CheckboxGroupSchema.safeParse({ type: "CheckboxGroup", props: { validationBehavior: "html" } }).success,
		).toBe(false)
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

	it("accepts isReadOnly", () => {
		expect(RadioGroupSchema.safeParse({ type: "RadioGroup", props: { isReadOnly: true } }).success).toBe(true)
	})

	it("accepts both validationBehavior values", () => {
		for (const v of ["aria", "native"]) {
			expect(RadioGroupSchema.safeParse({ type: "RadioGroup", props: { validationBehavior: v } }).success).toBe(true)
		}
	})

	it("rejects an invalid validationBehavior", () => {
		expect(RadioGroupSchema.safeParse({ type: "RadioGroup", props: { validationBehavior: "html" } }).success).toBe(
			false,
		)
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

	it("accepts both validationBehavior values", () => {
		for (const v of ["aria", "native"]) {
			expect(SwitchSchema.safeParse({ type: "Switch", props: { validationBehavior: v } }).success).toBe(true)
		}
	})

	it("rejects an invalid validationBehavior", () => {
		expect(SwitchSchema.safeParse({ type: "Switch", props: { validationBehavior: "html" } }).success).toBe(false)
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

	it("accepts defaultOpen", () => {
		expect(DialogSchema.safeParse({ type: "Dialog", props: { defaultOpen: true } }).success).toBe(true)
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

	it("parses validationErrors as a record of string or string[]", () => {
		expect(
			FormSchema.safeParse({
				type: "Form",
				props: {
					validationErrors: {
						email: "Invalid email address",
						password: ["Too short", "Must contain a number"],
					},
				},
			}).success,
		).toBe(true)
	})

	it("rejects validationErrors with non-string values", () => {
		expect(FormSchema.safeParse({ type: "Form", props: { validationErrors: { field: 42 } } }).success).toBe(false)
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
				props: {
					items: [
						{ id: "a", label: "Item A" },
						{ id: "b", label: "Item B", isDisabled: true },
					],
				},
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

	it("accepts selectedKeys and disabledKeys as string arrays", () => {
		expect(
			MenuSchema.safeParse({
				type: "Menu",
				props: { selectedKeys: ["a", "b"], disabledKeys: ["c"] },
			}).success,
		).toBe(true)
	})

	it("rejects non-array selectedKeys", () => {
		expect(MenuSchema.safeParse({ type: "Menu", props: { selectedKeys: "a" } }).success).toBe(false)
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

	it("accepts defaultOpen, crossOffset, shouldFlip, isKeyboardDismissDisabled, maxHeight", () => {
		expect(
			PopoverSchema.safeParse({
				type: "Popover",
				props: {
					defaultOpen: false,
					crossOffset: 4,
					shouldFlip: true,
					isKeyboardDismissDisabled: false,
					maxHeight: 300,
				},
			}).success,
		).toBe(true)
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

	it("accepts defaultOpen, offset, crossOffset, shouldFlip", () => {
		expect(
			TooltipSchema.safeParse({
				type: "Tooltip",
				props: { defaultOpen: true, offset: 12, crossOffset: 4, shouldFlip: false },
			}).success,
		).toBe(true)
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

	it("accepts isOpen, defaultOpen, and disabledKeys", () => {
		expect(
			SelectSchema.safeParse({
				type: "Select",
				props: { isOpen: false, defaultOpen: true, disabledKeys: ["apple"] },
			}).success,
		).toBe(true)
	})

	it("accepts both validationBehavior values", () => {
		for (const v of ["aria", "native"]) {
			expect(SelectSchema.safeParse({ type: "Select", props: { validationBehavior: v } }).success).toBe(true)
		}
	})

	it("rejects an invalid validationBehavior", () => {
		expect(SelectSchema.safeParse({ type: "Select", props: { validationBehavior: "html" } }).success).toBe(false)
	})
})

describe("TabsSchema", () => {
	it("parses a minimal tabs node", () => {
		expect(TabsSchema.safeParse({ type: "Tabs" }).success).toBe(true)
	})

	it("parses tabs with tab items", () => {
		expect(
			TabsSchema.safeParse({
				type: "Tabs",
				props: {
					tabs: [
						{ id: "tab1", label: "Tab 1" },
						{ id: "tab2", label: "Tab 2", isDisabled: true },
					],
				},
			}).success,
		).toBe(true)
	})

	it("parses all valid orientation values", () => {
		for (const orientation of ["horizontal", "vertical"]) {
			expect(TabsSchema.safeParse({ type: "Tabs", props: { orientation } }).success).toBe(true)
		}
	})

	it("rejects an invalid orientation", () => {
		expect(TabsSchema.safeParse({ type: "Tabs", props: { orientation: "diagonal" } }).success).toBe(false)
	})

	it("parses all valid keyboardActivation values", () => {
		for (const keyboardActivation of ["automatic", "manual"]) {
			expect(TabsSchema.safeParse({ type: "Tabs", props: { keyboardActivation } }).success).toBe(true)
		}
	})

	it("rejects an invalid keyboardActivation", () => {
		expect(TabsSchema.safeParse({ type: "Tabs", props: { keyboardActivation: "instant" } }).success).toBe(false)
	})

	it("rejects a tab item missing id", () => {
		expect(TabsSchema.safeParse({ type: "Tabs", props: { tabs: [{ label: "No id" }] } }).success).toBe(false)
	})

	it("rejects wrong type literal", () => {
		expect(TabsSchema.safeParse({ type: "tabs" }).success).toBe(false)
	})

	it("accepts disabledKeys as string array", () => {
		expect(TabsSchema.safeParse({ type: "Tabs", props: { disabledKeys: ["tab2"] } }).success).toBe(true)
	})

	it("rejects non-array disabledKeys", () => {
		expect(TabsSchema.safeParse({ type: "Tabs", props: { disabledKeys: "tab2" } }).success).toBe(false)
	})
})

describe("BreadcrumbSchema", () => {
	it("parses a minimal breadcrumb node", () => {
		expect(BreadcrumbSchema.safeParse({ type: "Breadcrumb" }).success).toBe(true)
	})

	it("parses a breadcrumb with items", () => {
		expect(
			BreadcrumbSchema.safeParse({
				type: "Breadcrumb",
				props: {
					items: [
						{ id: "home", label: "Home", href: "/" },
						{ id: "page", label: "Current" },
					],
				},
			}).success,
		).toBe(true)
	})

	it("parses a breadcrumb with isDisabled", () => {
		expect(BreadcrumbSchema.safeParse({ type: "Breadcrumb", props: { isDisabled: true } }).success).toBe(true)
	})

	it("rejects an item missing id", () => {
		expect(BreadcrumbSchema.safeParse({ type: "Breadcrumb", props: { items: [{ label: "No id" }] } }).success).toBe(
			false,
		)
	})

	it("rejects an item missing label", () => {
		expect(BreadcrumbSchema.safeParse({ type: "Breadcrumb", props: { items: [{ id: "a" }] } }).success).toBe(false)
	})

	it("rejects a non-string ariaLabel", () => {
		expect(BreadcrumbSchema.safeParse({ type: "Breadcrumb", props: { ariaLabel: 42 } }).success).toBe(false)
	})

	it("rejects wrong type literal", () => {
		expect(BreadcrumbSchema.safeParse({ type: "breadcrumb" }).success).toBe(false)
	})
})

describe("DatePickerSchema", () => {
	it("parses a minimal datepicker node", () => {
		expect(DatePickerSchema.safeParse({ type: "DatePicker" }).success).toBe(true)
	})

	it("parses a datepicker with label and defaultValue", () => {
		expect(
			DatePickerSchema.safeParse({ type: "DatePicker", props: { label: "Date", defaultValue: "2024-06-15" } }).success,
		).toBe(true)
	})

	it("parses a disabled required datepicker", () => {
		expect(
			DatePickerSchema.safeParse({ type: "DatePicker", props: { isDisabled: true, isRequired: true } }).success,
		).toBe(true)
	})

	it("parses isInvalid, errorMessage, and name", () => {
		expect(
			DatePickerSchema.safeParse({
				type: "DatePicker",
				props: { isInvalid: true, errorMessage: "Date is required", name: "appointment" },
			}).success,
		).toBe(true)
	})

	it("rejects a non-string label", () => {
		expect(DatePickerSchema.safeParse({ type: "DatePicker", props: { label: 42 } }).success).toBe(false)
	})

	it("rejects wrong type literal", () => {
		expect(DatePickerSchema.safeParse({ type: "datepicker" }).success).toBe(false)
	})

	it("accepts a controlled value", () => {
		expect(DatePickerSchema.safeParse({ type: "DatePicker", props: { value: "2024-06-15" } }).success).toBe(true)
	})

	it("rejects a non-string value", () => {
		expect(DatePickerSchema.safeParse({ type: "DatePicker", props: { value: 20240615 } }).success).toBe(false)
	})

	it("accepts both validationBehavior values", () => {
		for (const v of ["aria", "native"]) {
			expect(DatePickerSchema.safeParse({ type: "DatePicker", props: { validationBehavior: v } }).success).toBe(true)
		}
	})

	it("rejects an invalid validationBehavior", () => {
		expect(DatePickerSchema.safeParse({ type: "DatePicker", props: { validationBehavior: "html" } }).success).toBe(
			false,
		)
	})
})

describe("DateRangePickerSchema", () => {
	it("parses a minimal daterangepicker node", () => {
		expect(DateRangePickerSchema.safeParse({ type: "DateRangePicker" }).success).toBe(true)
	})

	it("parses a daterangepicker with a defaultValue range", () => {
		expect(
			DateRangePickerSchema.safeParse({
				type: "DateRangePicker",
				props: { label: "Period", defaultValue: { start: "2024-07-01", end: "2024-07-14" } },
			}).success,
		).toBe(true)
	})

	it("parses isInvalid and errorMessage", () => {
		expect(
			DateRangePickerSchema.safeParse({
				type: "DateRangePicker",
				props: { isInvalid: true, errorMessage: "Invalid date range" },
			}).success,
		).toBe(true)
	})

	it("rejects a defaultValue missing end", () => {
		expect(
			DateRangePickerSchema.safeParse({
				type: "DateRangePicker",
				props: { defaultValue: { start: "2024-07-01" } },
			}).success,
		).toBe(false)
	})

	it("rejects wrong type literal", () => {
		expect(DateRangePickerSchema.safeParse({ type: "daterangepicker" }).success).toBe(false)
	})

	it("accepts a controlled value range", () => {
		expect(
			DateRangePickerSchema.safeParse({
				type: "DateRangePicker",
				props: { value: { start: "2024-07-01", end: "2024-07-14" } },
			}).success,
		).toBe(true)
	})

	it("rejects a value missing end", () => {
		expect(
			DateRangePickerSchema.safeParse({
				type: "DateRangePicker",
				props: { value: { start: "2024-07-01" } },
			}).success,
		).toBe(false)
	})

	it("accepts both validationBehavior values", () => {
		for (const v of ["aria", "native"]) {
			expect(
				DateRangePickerSchema.safeParse({ type: "DateRangePicker", props: { validationBehavior: v } }).success,
			).toBe(true)
		}
	})

	it("rejects an invalid validationBehavior", () => {
		expect(
			DateRangePickerSchema.safeParse({ type: "DateRangePicker", props: { validationBehavior: "html" } }).success,
		).toBe(false)
	})
})

describe("TableSchema", () => {
	it("parses a minimal table node", () => {
		expect(TableSchema.safeParse({ type: "Table" }).success).toBe(true)
	})

	it("parses a table with columns and rows", () => {
		expect(
			TableSchema.safeParse({
				type: "Table",
				props: {
					ariaLabel: "Users",
					columns: [
						{ id: "name", label: "Name", isRowHeader: true },
						{ id: "role", label: "Role" },
					],
					rows: [{ id: "1", data: { name: "Alice", role: "Admin" } }],
				},
			}).success,
		).toBe(true)
	})

	it("parses all valid selectionMode values", () => {
		for (const selectionMode of ["none", "single", "multiple"]) {
			expect(TableSchema.safeParse({ type: "Table", props: { selectionMode } }).success).toBe(true)
		}
	})

	it("rejects an invalid selectionMode", () => {
		expect(TableSchema.safeParse({ type: "Table", props: { selectionMode: "all" } }).success).toBe(false)
	})

	it("rejects a row missing data", () => {
		expect(TableSchema.safeParse({ type: "Table", props: { rows: [{ id: "1" }] } }).success).toBe(false)
	})

	it("rejects wrong type literal", () => {
		expect(TableSchema.safeParse({ type: "table" }).success).toBe(false)
	})

	it("accepts selectedKeys, defaultSelectedKeys, and disabledKeys as string arrays", () => {
		expect(
			TableSchema.safeParse({
				type: "Table",
				props: { selectedKeys: ["1", "2"], defaultSelectedKeys: ["1"], disabledKeys: ["3"] },
			}).success,
		).toBe(true)
	})

	it("accepts a valid sortDescriptor", () => {
		expect(
			TableSchema.safeParse({
				type: "Table",
				props: { sortDescriptor: { column: "name", direction: "ascending" } },
			}).success,
		).toBe(true)
	})

	it("rejects a sortDescriptor with invalid direction", () => {
		expect(
			TableSchema.safeParse({
				type: "Table",
				props: { sortDescriptor: { column: "name", direction: "asc" } },
			}).success,
		).toBe(false)
	})
})

describe("FlexSchema", () => {
	it("parses a minimal flex node", () => {
		expect(FlexSchema.safeParse({ type: "Flex" }).success).toBe(true)
	})

	it("parses all valid direction values", () => {
		for (const direction of ["row", "column", "row-reverse", "column-reverse"]) {
			expect(FlexSchema.safeParse({ type: "Flex", props: { direction } }).success).toBe(true)
		}
	})

	it("rejects an invalid direction", () => {
		expect(FlexSchema.safeParse({ type: "Flex", props: { direction: "diagonal" } }).success).toBe(false)
	})

	it("parses all valid gap values", () => {
		for (const gap of ["none", "xs", "sm", "md", "lg", "xl"]) {
			expect(FlexSchema.safeParse({ type: "Flex", props: { gap } }).success).toBe(true)
		}
	})

	it("rejects an invalid gap value", () => {
		expect(FlexSchema.safeParse({ type: "Flex", props: { gap: "2xl" } }).success).toBe(false)
	})

	it("parses all valid align values", () => {
		for (const align of ["start", "center", "end", "stretch", "baseline"]) {
			expect(FlexSchema.safeParse({ type: "Flex", props: { align } }).success).toBe(true)
		}
	})

	it("parses all valid justify values", () => {
		for (const justify of ["start", "center", "end", "between", "around", "evenly"]) {
			expect(FlexSchema.safeParse({ type: "Flex", props: { justify } }).success).toBe(true)
		}
	})

	it("rejects an invalid justify value", () => {
		expect(FlexSchema.safeParse({ type: "Flex", props: { justify: "left" } }).success).toBe(false)
	})

	it("parses wrap as boolean", () => {
		expect(FlexSchema.safeParse({ type: "Flex", props: { wrap: true } }).success).toBe(true)
	})

	it("rejects wrap as non-boolean", () => {
		expect(FlexSchema.safeParse({ type: "Flex", props: { wrap: "yes" } }).success).toBe(false)
	})

	it("parses flex with children array", () => {
		expect(FlexSchema.safeParse({ type: "Flex", children: [{ type: "Button" }] }).success).toBe(true)
	})

	it("rejects wrong type literal", () => {
		expect(FlexSchema.safeParse({ type: "flex" }).success).toBe(false)
	})
})

describe("GridSchema", () => {
	it("parses a minimal grid node", () => {
		expect(GridSchema.safeParse({ type: "Grid" }).success).toBe(true)
	})

	it("parses a grid with columns 1-12", () => {
		for (const columns of [1, 6, 12]) {
			expect(GridSchema.safeParse({ type: "Grid", props: { columns } }).success).toBe(true)
		}
	})

	it("rejects columns out of range", () => {
		expect(GridSchema.safeParse({ type: "Grid", props: { columns: 0 } }).success).toBe(false)
		expect(GridSchema.safeParse({ type: "Grid", props: { columns: 13 } }).success).toBe(false)
	})

	it("parses all valid gap values", () => {
		for (const gap of ["none", "xs", "sm", "md", "lg", "xl"]) {
			expect(GridSchema.safeParse({ type: "Grid", props: { gap } }).success).toBe(true)
		}
	})

	it("rejects an invalid gap value", () => {
		expect(GridSchema.safeParse({ type: "Grid", props: { gap: "huge" } }).success).toBe(false)
	})

	it("parses all valid align values", () => {
		for (const align of ["start", "center", "end", "stretch"]) {
			expect(GridSchema.safeParse({ type: "Grid", props: { align } }).success).toBe(true)
		}
	})

	it("rejects an invalid align value", () => {
		expect(GridSchema.safeParse({ type: "Grid", props: { align: "baseline" } }).success).toBe(false)
	})

	it("parses a grid with children array", () => {
		expect(GridSchema.safeParse({ type: "Grid", children: [{ type: "Button" }] }).success).toBe(true)
	})

	it("rejects columns as non-integer", () => {
		expect(GridSchema.safeParse({ type: "Grid", props: { columns: 2.5 } }).success).toBe(false)
	})

	it("rejects wrong type literal", () => {
		expect(GridSchema.safeParse({ type: "grid" }).success).toBe(false)
	})
})

describe("TextSchema", () => {
	it("parses a minimal text node", () => {
		expect(TextSchema.safeParse({ type: "Text" }).success).toBe(true)
	})

	it("parses a text node with all props", () => {
		expect(
			TextSchema.safeParse({
				type: "Text",
				props: { as: "h2", size: "xl", weight: "bold", color: "primary" },
				children: "Hello",
			}).success,
		).toBe(true)
	})

	it("parses all valid as values", () => {
		for (const as of ["h1", "h2", "h3", "h4", "p", "span", "label"]) {
			expect(TextSchema.safeParse({ type: "Text", props: { as } }).success).toBe(true)
		}
	})

	it("rejects an invalid as value", () => {
		expect(TextSchema.safeParse({ type: "Text", props: { as: "div" } }).success).toBe(false)
	})

	it("parses all valid size values", () => {
		for (const size of ["xs", "sm", "md", "lg", "xl", "2xl"]) {
			expect(TextSchema.safeParse({ type: "Text", props: { size } }).success).toBe(true)
		}
	})

	it("rejects an invalid size value", () => {
		expect(TextSchema.safeParse({ type: "Text", props: { size: "3xl" } }).success).toBe(false)
	})

	it("parses all valid weight values", () => {
		for (const weight of ["normal", "medium", "semibold", "bold"]) {
			expect(TextSchema.safeParse({ type: "Text", props: { weight } }).success).toBe(true)
		}
	})

	it("rejects an invalid weight value", () => {
		expect(TextSchema.safeParse({ type: "Text", props: { weight: "light" } }).success).toBe(false)
	})

	it("parses all valid color values", () => {
		for (const color of ["default", "muted", "primary", "danger"]) {
			expect(TextSchema.safeParse({ type: "Text", props: { color } }).success).toBe(true)
		}
	})

	it("rejects an invalid color value", () => {
		expect(TextSchema.safeParse({ type: "Text", props: { color: "success" } }).success).toBe(false)
	})

	it("parses all valid align values", () => {
		for (const align of ["left", "center", "right", "justify"]) {
			expect(TextSchema.safeParse({ type: "Text", props: { align } }).success).toBe(true)
		}
	})

	it("rejects an invalid align value", () => {
		expect(TextSchema.safeParse({ type: "Text", props: { align: "middle" } }).success).toBe(false)
	})

	it("parses italic as a boolean", () => {
		expect(TextSchema.safeParse({ type: "Text", props: { italic: true } }).success).toBe(true)
		expect(TextSchema.safeParse({ type: "Text", props: { italic: false } }).success).toBe(true)
	})

	it("parses truncate as a boolean", () => {
		expect(TextSchema.safeParse({ type: "Text", props: { truncate: true } }).success).toBe(true)
		expect(TextSchema.safeParse({ type: "Text", props: { truncate: false } }).success).toBe(true)
	})

	it("parses children as a string", () => {
		expect(TextSchema.safeParse({ type: "Text", children: "Hello world" }).success).toBe(true)
	})

	it("parses children as an array", () => {
		expect(TextSchema.safeParse({ type: "Text", children: [{ type: "Button" }] }).success).toBe(true)
	})

	it("rejects wrong type literal", () => {
		expect(TextSchema.safeParse({ type: "text" }).success).toBe(false)
	})
})

// ── Tier 6: UX enrichment ──────────────────────────────────────────────────

describe("ButtonSchema — Tier 6 props", () => {
	it("accepts isPending as boolean", () => {
		expect(ButtonSchema.safeParse({ type: "Button", props: { isPending: true } }).success).toBe(true)
	})

	it("accepts all valid type values", () => {
		for (const type of ["button", "reset", "submit"]) {
			expect(ButtonSchema.safeParse({ type: "Button", props: { type } }).success).toBe(true)
		}
	})

	it("rejects an invalid type value", () => {
		expect(ButtonSchema.safeParse({ type: "Button", props: { type: "image" } }).success).toBe(false)
	})

	it("accepts name and value as strings", () => {
		expect(ButtonSchema.safeParse({ type: "Button", props: { name: "action", value: "save" } }).success).toBe(true)
	})

	it("rejects non-boolean isPending", () => {
		expect(ButtonSchema.safeParse({ type: "Button", props: { isPending: "yes" } }).success).toBe(false)
	})
})

describe("TextFieldSchema — Tier 6 props", () => {
	it("accepts autoFocus as boolean", () => {
		expect(TextFieldSchema.safeParse({ type: "TextField", props: { autoFocus: true } }).success).toBe(true)
	})

	it("accepts autoComplete as string", () => {
		expect(TextFieldSchema.safeParse({ type: "TextField", props: { autoComplete: "email" } }).success).toBe(true)
	})

	it("accepts all valid inputMode values", () => {
		for (const inputMode of ["text", "numeric", "decimal", "email", "tel", "url", "search"]) {
			expect(TextFieldSchema.safeParse({ type: "TextField", props: { inputMode } }).success).toBe(true)
		}
	})

	it("rejects an invalid inputMode", () => {
		expect(TextFieldSchema.safeParse({ type: "TextField", props: { inputMode: "number" } }).success).toBe(false)
	})

	it("rejects non-boolean autoFocus", () => {
		expect(TextFieldSchema.safeParse({ type: "TextField", props: { autoFocus: "yes" } }).success).toBe(false)
	})
})

describe("NumberFieldSchema — Tier 6 props", () => {
	it("accepts isWheelDisabled as boolean", () => {
		expect(NumberFieldSchema.safeParse({ type: "NumberField", props: { isWheelDisabled: true } }).success).toBe(true)
	})

	it("rejects non-boolean isWheelDisabled", () => {
		expect(NumberFieldSchema.safeParse({ type: "NumberField", props: { isWheelDisabled: "yes" } }).success).toBe(false)
	})
})

describe("CheckboxSchema — Tier 6 props", () => {
	it("accepts autoFocus as boolean", () => {
		expect(CheckboxSchema.safeParse({ type: "Checkbox", props: { autoFocus: true } }).success).toBe(true)
	})

	it("rejects non-boolean autoFocus", () => {
		expect(CheckboxSchema.safeParse({ type: "Checkbox", props: { autoFocus: "yes" } }).success).toBe(false)
	})
})

describe("SwitchSchema — Tier 6 props", () => {
	it("accepts autoFocus as boolean", () => {
		expect(SwitchSchema.safeParse({ type: "Switch", props: { autoFocus: true } }).success).toBe(true)
	})

	it("rejects non-boolean autoFocus", () => {
		expect(SwitchSchema.safeParse({ type: "Switch", props: { autoFocus: "yes" } }).success).toBe(false)
	})
})

describe("DatePickerSchema — Tier 6 props", () => {
	it("accepts autoFocus, isOpen, defaultOpen as booleans", () => {
		expect(
			DatePickerSchema.safeParse({
				type: "DatePicker",
				props: { autoFocus: true, isOpen: false, defaultOpen: true },
			}).success,
		).toBe(true)
	})

	it("accepts all valid granularity values", () => {
		for (const granularity of ["day", "hour", "minute", "second"]) {
			expect(DatePickerSchema.safeParse({ type: "DatePicker", props: { granularity } }).success).toBe(true)
		}
	})

	it("rejects an invalid granularity", () => {
		expect(DatePickerSchema.safeParse({ type: "DatePicker", props: { granularity: "week" } }).success).toBe(false)
	})

	it("accepts all valid firstDayOfWeek values", () => {
		for (const firstDayOfWeek of ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]) {
			expect(DatePickerSchema.safeParse({ type: "DatePicker", props: { firstDayOfWeek } }).success).toBe(true)
		}
	})

	it("rejects an invalid firstDayOfWeek", () => {
		expect(DatePickerSchema.safeParse({ type: "DatePicker", props: { firstDayOfWeek: "sunday" } }).success).toBe(false)
	})
})

describe("DateRangePickerSchema — Tier 6 props", () => {
	it("accepts isOpen, defaultOpen, allowsNonContiguousRanges as booleans", () => {
		expect(
			DateRangePickerSchema.safeParse({
				type: "DateRangePicker",
				props: { isOpen: false, defaultOpen: true, allowsNonContiguousRanges: true },
			}).success,
		).toBe(true)
	})

	it("accepts startName and endName as strings", () => {
		expect(
			DateRangePickerSchema.safeParse({
				type: "DateRangePicker",
				props: { startName: "start_date", endName: "end_date" },
			}).success,
		).toBe(true)
	})

	it("accepts all valid granularity values", () => {
		for (const granularity of ["day", "hour", "minute", "second"]) {
			expect(DateRangePickerSchema.safeParse({ type: "DateRangePicker", props: { granularity } }).success).toBe(true)
		}
	})

	it("rejects an invalid granularity", () => {
		expect(DateRangePickerSchema.safeParse({ type: "DateRangePicker", props: { granularity: "year" } }).success).toBe(
			false,
		)
	})

	it("accepts all valid firstDayOfWeek values", () => {
		for (const firstDayOfWeek of ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]) {
			expect(DateRangePickerSchema.safeParse({ type: "DateRangePicker", props: { firstDayOfWeek } }).success).toBe(true)
		}
	})

	it("rejects an invalid firstDayOfWeek", () => {
		expect(
			DateRangePickerSchema.safeParse({ type: "DateRangePicker", props: { firstDayOfWeek: "monday" } }).success,
		).toBe(false)
	})
})

describe("FormSchema — Tier 6 props", () => {
	it("accepts all valid encType values", () => {
		for (const encType of ["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"]) {
			expect(FormSchema.safeParse({ type: "Form", props: { encType } }).success).toBe(true)
		}
	})

	it("rejects an invalid encType", () => {
		expect(FormSchema.safeParse({ type: "Form", props: { encType: "application/json" } }).success).toBe(false)
	})

	it("accepts both autoComplete values", () => {
		for (const autoComplete of ["on", "off"]) {
			expect(FormSchema.safeParse({ type: "Form", props: { autoComplete } }).success).toBe(true)
		}
	})

	it("rejects an invalid autoComplete", () => {
		expect(FormSchema.safeParse({ type: "Form", props: { autoComplete: "email" } }).success).toBe(false)
	})

	it("accepts target as string", () => {
		expect(FormSchema.safeParse({ type: "Form", props: { target: "_blank" } }).success).toBe(true)
	})

	it("rejects non-string target", () => {
		expect(FormSchema.safeParse({ type: "Form", props: { target: 42 } }).success).toBe(false)
	})
})
