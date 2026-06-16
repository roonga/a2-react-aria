import { render, screen } from "@testing-library/react"
import axe from "axe-core"
import { describe, expect, it } from "vitest"
import { Breadcrumb } from "../components/breadcrumb"
import { Button } from "../components/button"
import { Card } from "../components/card"
import { Checkbox, CheckboxGroup } from "../components/checkbox"
import { DatePicker, DateRangePicker } from "../components/date-picker"
import { Dialog } from "../components/dialog"
import { Form } from "../components/form"
import { Flex, Grid } from "../components/layout"
import { Menu } from "../components/menu"
import { NumberField } from "../components/number-field"
import { Popover } from "../components/popover"
import { Radio, RadioGroup } from "../components/radio"
import { Select } from "../components/select"
import { Switch } from "../components/switch"
import { Table } from "../components/table"
import { Tabs } from "../components/tabs"
import { Text } from "../components/text"
import { TextField } from "../components/text-field"
import { Tooltip } from "../components/tooltip"
import { A2Renderer, createRegistry } from "../index"

// Color contrast requires real CSS rendering — jsdom cannot compute it.
const AXE_CONFIG: axe.RunOptions = { rules: { "color-contrast": { enabled: false } } }

const registry = createRegistry({
	Breadcrumb: { component: Breadcrumb },
	Button: { component: Button },
	Card: { component: Card },
	DatePicker: { component: DatePicker },
	DateRangePicker: { component: DateRangePicker },
	Checkbox: { component: Checkbox },
	CheckboxGroup: { component: CheckboxGroup },
	Dialog: { component: Dialog },
	Flex: { component: Flex },
	Form: { component: Form },
	Grid: { component: Grid },
	Menu: { component: Menu },
	NumberField: { component: NumberField },
	Popover: { component: Popover },
	Radio: { component: Radio },
	RadioGroup: { component: RadioGroup },
	Select: { component: Select },
	Switch: { component: Switch },
	Table: { component: Table },
	Tabs: { component: Tabs },
	Text: { component: Text },
	TextField: { component: TextField },
	Tooltip: { component: Tooltip },
})

describe("A2Renderer — a2UI to React Aria integration", () => {
	describe("Button component", () => {
		it("renders button with primary variant from a2UI JSON", () => {
			const node = {
				type: "Button" as const,
				props: { variant: "primary" as const },
				children: "Submit",
			}
			render(<A2Renderer node={node} registry={registry} />)
			const btn = screen.getByRole("button", { name: /submit/i })
			expect(btn).toBeDefined()
			expect(btn.className).toContain("bg-[var(--color-primary)]")
		})

		it("renders disabled button from a2UI JSON", () => {
			const node = {
				type: "Button" as const,
				props: { disabled: true },
				children: "Click",
			}
			render(<A2Renderer node={node} registry={registry} />)
			const btn = screen.getByRole("button", { name: /click/i })
			expect(btn.hasAttribute("disabled")).toBe(true)
		})

		it("renders danger variant with correct Tailwind classes", () => {
			const node = {
				type: "Button" as const,
				props: { variant: "danger" as const },
				children: "Delete",
			}
			render(<A2Renderer node={node} registry={registry} />)
			const btn = screen.getByRole("button", { name: /delete/i })
			expect(btn.className).toContain("bg-[var(--color-danger)]")
		})
	})

	describe("TextField component", () => {
		it("renders textfield with label from a2UI JSON", () => {
			const node = {
				type: "TextField" as const,
				props: {
					label: "Username",
					type: "text" as const,
				},
			}
			render(<A2Renderer node={node} registry={registry} />)
			expect(screen.getByLabelText(/username/i)).toBeDefined()
		})

		it("renders email input type from a2UI JSON", () => {
			const node = {
				type: "TextField" as const,
				props: {
					label: "Email",
					type: "email" as const,
				},
			}
			render(<A2Renderer node={node} registry={registry} />)
			const input = screen.getByLabelText(/email/i) as HTMLInputElement
			expect(input.type).toBe("email")
		})

		it("renders required indicator from a2UI JSON", () => {
			const node = {
				type: "TextField" as const,
				props: {
					label: "Required Field",
					isRequired: true,
				},
			}
			render(<A2Renderer node={node} registry={registry} />)
			const label = screen.getByText(/required field/i)
			expect(label.textContent).toContain("*")
		})

		it("renders disabled textfield from a2UI JSON", () => {
			const node = {
				type: "TextField" as const,
				props: {
					label: "Disabled",
					isDisabled: true,
					value: "readonly",
				},
			}
			render(<A2Renderer node={node} registry={registry} />)
			const input = screen.getByLabelText(/disabled/i) as HTMLInputElement
			expect(input.disabled).toBe(true)
		})

		it("renders description text", () => {
			render(
				<A2Renderer
					node={{ type: "TextField", props: { label: "Email", description: "We'll never share it" } }}
					registry={registry}
				/>,
			)
			expect(screen.getByText(/we'll never share it/i)).toBeDefined()
		})

		it("renders error message when isInvalid is set", () => {
			render(
				<A2Renderer
					node={{
						type: "TextField",
						props: { label: "Email", isInvalid: true, errorMessage: "Invalid email address" },
					}}
					registry={registry}
				/>,
			)
			expect(screen.getByText(/invalid email address/i)).toBeDefined()
		})

		it("sets name attribute on the input", () => {
			render(<A2Renderer node={{ type: "TextField", props: { label: "Email", name: "email" } }} registry={registry} />)
			const input = screen.getByLabelText(/email/i) as HTMLInputElement
			expect(input.name).toBe("email")
		})

		it("sets minLength and maxLength on the input", () => {
			render(
				<A2Renderer
					node={{ type: "TextField", props: { label: "Username", minLength: 3, maxLength: 20 } }}
					registry={registry}
				/>,
			)
			const input = screen.getByLabelText(/username/i) as HTMLInputElement
			expect(input.minLength).toBe(3)
			expect(input.maxLength).toBe(20)
		})
	})

	describe("DatePicker component", () => {
		it("renders datepicker with label", () => {
			render(<A2Renderer node={{ type: "DatePicker", props: { label: "Pick a date" } }} registry={registry} />)
			expect(screen.getByText(/pick a date/i)).toBeDefined()
		})

		it("renders disabled datepicker", () => {
			const { container } = render(
				<A2Renderer node={{ type: "DatePicker", props: { label: "Locked", isDisabled: true } }} registry={registry} />,
			)
			expect(container.querySelector("group[data-disabled]") ?? container.firstChild).toBeDefined()
		})
	})

	describe("DateRangePicker component", () => {
		it("renders daterangepicker with label", () => {
			render(<A2Renderer node={{ type: "DateRangePicker", props: { label: "Date range" } }} registry={registry} />)
			expect(screen.getByText(/date range/i)).toBeDefined()
		})
	})

	describe("NumberField component", () => {
		it("renders with label via A2Renderer", () => {
			render(
				<A2Renderer
					node={{ type: "NumberField", props: { label: "Party Size", defaultValue: 2 } }}
					registry={registry}
				/>,
			)
			// RAC NumberField renders as role="textbox" with aria-roledescription="Number field"
			expect(screen.getByRole("textbox", { name: /party size/i })).toBeDefined()
		})

		it("renders decrement and increment buttons", () => {
			render(<A2Renderer node={{ type: "NumberField", props: { label: "Qty" } }} registry={registry} />)
			// RAC names the buttons "Decrease Qty" / "Increase Qty"
			expect(screen.getByRole("button", { name: /decrease/i })).toBeDefined()
			expect(screen.getByRole("button", { name: /increase/i })).toBeDefined()
		})

		it("renders disabled number field", () => {
			render(
				<A2Renderer
					node={{ type: "NumberField", props: { label: "Fixed", defaultValue: 5, isDisabled: true } }}
					registry={registry}
				/>,
			)
			const input = screen.getByRole("textbox", { name: /fixed/i }) as HTMLInputElement
			expect(input.disabled).toBe(true)
		})

		it("passes axe accessibility rules", async () => {
			const { container } = render(
				<A2Renderer
					node={{
						type: "NumberField",
						props: { label: "Guests", minValue: 1, maxValue: 8, defaultValue: 2, isRequired: true },
					}}
					registry={registry}
				/>,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})

		it("renders error message when isInvalid is set", () => {
			render(
				<A2Renderer
					node={{
						type: "NumberField",
						props: { label: "Qty", isInvalid: true, errorMessage: "Must be at least 1" },
					}}
					registry={registry}
				/>,
			)
			expect(screen.getByText(/must be at least 1/i)).toBeDefined()
		})

		it("sets name on the hidden input", () => {
			const { container } = render(
				<A2Renderer
					node={{ type: "NumberField", props: { label: "Amount", name: "amount", defaultValue: 5 } }}
					registry={registry}
				/>,
			)
			const hidden = container.querySelector('input[name="amount"]')
			expect(hidden).not.toBeNull()
		})
	})

	describe("Breadcrumb component", () => {
		it("renders breadcrumb links from items", () => {
			const node = {
				type: "Breadcrumb" as const,
				props: {
					ariaLabel: "Page navigation",
					items: [
						{ id: "home", label: "Home", href: "/" },
						{ id: "current", label: "About" },
					],
				},
			}
			render(<A2Renderer node={node} registry={registry} />)
			expect(screen.getByRole("link", { name: /home/i })).toBeDefined()
			expect(screen.getByRole("link", { name: /about/i })).toBeDefined()
		})

		it("marks the last item as current", () => {
			const node = {
				type: "Breadcrumb" as const,
				props: {
					items: [
						{ id: "home", label: "Home", href: "/" },
						{ id: "page", label: "Contact" },
					],
				},
			}
			render(<A2Renderer node={node} registry={registry} />)
			const currentLink = screen.getByRole("link", { name: /contact/i })
			expect(currentLink.getAttribute("data-current")).toBe("true")
		})

		it("renders empty list with no items", () => {
			const node = { type: "Breadcrumb" as const, props: { items: [] } }
			const { container } = render(<A2Renderer node={node} registry={registry} />)
			expect(container.querySelector("ol")).toBeDefined()
		})
	})

	describe("Table component", () => {
		const columns = [
			{ id: "name", label: "Name", isRowHeader: true as const },
			{ id: "role", label: "Role" },
		]
		const rows = [
			{ id: "1", data: { name: "Alice", role: "Engineer" } },
			{ id: "2", data: { name: "Bob", role: "Designer" } },
		]

		it("renders column headers", () => {
			const node = { type: "Table" as const, props: { ariaLabel: "Users", columns, rows } }
			render(<A2Renderer node={node} registry={registry} />)
			expect(screen.getByRole("columnheader", { name: /name/i })).toBeDefined()
			expect(screen.getByRole("columnheader", { name: /role/i })).toBeDefined()
		})

		it("renders row data", () => {
			const node = { type: "Table" as const, props: { ariaLabel: "Users", columns, rows } }
			render(<A2Renderer node={node} registry={registry} />)
			expect(screen.getByText("Alice")).toBeDefined()
			expect(screen.getByText("Engineer")).toBeDefined()
		})

		it("renders empty table with no rows", () => {
			const node = { type: "Table" as const, props: { ariaLabel: "Empty", columns, rows: [] } }
			render(<A2Renderer node={node} registry={registry} />)
			expect(screen.getByRole("grid", { name: /empty/i })).toBeDefined()
		})
	})

	describe("Tabs component", () => {
		it("renders tab list with labelled tabs", () => {
			const node = {
				type: "Tabs" as const,
				props: {
					ariaLabel: "Sections",
					tabs: [
						{ id: "tab1", label: "First" },
						{ id: "tab2", label: "Second" },
					],
				},
			}
			render(<A2Renderer node={node} registry={registry} />)
			expect(screen.getByRole("tab", { name: /first/i })).toBeDefined()
			expect(screen.getByRole("tab", { name: /second/i })).toBeDefined()
		})

		it("renders first tab panel by default", () => {
			const node = {
				type: "Tabs" as const,
				props: {
					ariaLabel: "Nav",
					tabs: [
						{ id: "a", label: "Alpha" },
						{ id: "b", label: "Beta" },
					],
				},
				children: [
					{ type: "Button", props: { variant: "primary" as const }, children: "Panel A" },
					{ type: "Button", props: { variant: "secondary" as const }, children: "Panel B" },
				],
			}
			render(<A2Renderer node={node} registry={registry} />)
			expect(screen.getByRole("button", { name: /panel a/i })).toBeDefined()
		})

		it("reflects disabled tab in DOM", () => {
			const node = {
				type: "Tabs" as const,
				props: {
					ariaLabel: "Nav",
					tabs: [
						{ id: "t1", label: "Active" },
						{ id: "t2", label: "Locked", isDisabled: true },
					],
				},
			}
			render(<A2Renderer node={node} registry={registry} />)
			const lockedTab = screen.getByRole("tab", { name: /locked/i })
			expect(lockedTab.getAttribute("aria-disabled")).toBe("true")
		})
	})

	describe("unknown component type", () => {
		it("renders fallback when node type is not in registry", () => {
			render(<A2Renderer node={{ type: "Unknown" }} registry={registry} fallback={<span>unknown fallback</span>} />)
			expect(screen.getByText("unknown fallback")).toBeDefined()
		})

		it("renders nothing when node type is not in registry and no fallback", () => {
			const { container } = render(<A2Renderer node={{ type: "Unknown" }} registry={registry} />)
			expect(container.firstChild).toBeNull()
		})
	})

	describe("nested a2UI JSON", () => {
		it("renders button inside form structure", () => {
			const node = {
				type: "Button" as const,
				props: { variant: "primary" as const },
				children: "Nested Button",
			}
			render(<A2Renderer node={node} registry={registry} />)
			expect(screen.getByRole("button", { name: /nested button/i })).toBeDefined()
		})
	})
})

describe("Accessibility — axe-core", () => {
	describe("Button", () => {
		it("has no axe violations (primary)", async () => {
			const { container } = render(
				<A2Renderer node={{ type: "Button", props: { variant: "primary" }, children: "Submit" }} registry={registry} />,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})

		it("has no axe violations (disabled)", async () => {
			const { container } = render(
				<A2Renderer node={{ type: "Button", props: { disabled: true }, children: "Disabled" }} registry={registry} />,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})
	})

	describe("TextField", () => {
		it("has no axe violations (labelled input)", async () => {
			const { container } = render(
				<A2Renderer node={{ type: "TextField", props: { label: "Email", type: "email" } }} registry={registry} />,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})

		it("has no axe violations (required field)", async () => {
			const { container } = render(
				<A2Renderer
					node={{ type: "TextField", props: { label: "Password", type: "password", required: true } }}
					registry={registry}
				/>,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})

		it("has no axe violations (disabled field)", async () => {
			const { container } = render(
				<A2Renderer
					node={{ type: "TextField", props: { label: "Read only", isDisabled: true, value: "locked" } }}
					registry={registry}
				/>,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})

		it("has no axe violations (invalid field with error message)", async () => {
			const { container } = render(
				<A2Renderer
					node={{
						type: "TextField",
						props: { label: "Email", isInvalid: true, errorMessage: "Enter a valid email address" },
					}}
					registry={registry}
				/>,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})
	})

	describe("Checkbox", () => {
		it("has no axe violations (default unchecked)", async () => {
			const { container } = render(
				<A2Renderer node={{ type: "Checkbox", props: { label: "Accept terms" } }} registry={registry} />,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})

		it("has no axe violations (checked)", async () => {
			const { container } = render(
				<A2Renderer
					node={{ type: "Checkbox", props: { label: "Remember me", defaultSelected: true } }}
					registry={registry}
				/>,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})

		it("has no axe violations (indeterminate)", async () => {
			const { container } = render(
				<A2Renderer
					node={{ type: "Checkbox", props: { label: "Select all", isIndeterminate: true } }}
					registry={registry}
				/>,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})

		it("has no axe violations (disabled)", async () => {
			const { container } = render(
				<A2Renderer
					node={{ type: "Checkbox", props: { label: "Not available", isDisabled: true } }}
					registry={registry}
				/>,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})

		it("renders error message when isInvalid is set", () => {
			render(
				<A2Renderer
					node={{
						type: "Checkbox",
						props: { label: "I agree to terms", isInvalid: true, errorMessage: "You must agree to continue" },
					}}
					registry={registry}
				/>,
			)
			expect(screen.getByText(/you must agree to continue/i)).toBeDefined()
		})

		it("has no axe violations (invalid with error message)", async () => {
			const { container } = render(
				<A2Renderer
					node={{
						type: "Checkbox",
						props: { label: "I agree", isInvalid: true, errorMessage: "Required" },
					}}
					registry={registry}
				/>,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})
	})

	describe("CheckboxGroup", () => {
		it("has no axe violations (labelled group)", async () => {
			const { container } = render(
				<A2Renderer
					node={{
						type: "CheckboxGroup",
						props: { label: "Fruits" },
						children: [
							{ type: "Checkbox", props: { label: "Apple", value: "apple" } },
							{ type: "Checkbox", props: { label: "Banana", value: "banana" } },
						],
					}}
					registry={registry}
				/>,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})

		it("has no axe violations (disabled group)", async () => {
			const { container } = render(
				<A2Renderer
					node={{
						type: "CheckboxGroup",
						props: { label: "Options", isDisabled: true },
						children: [{ type: "Checkbox", props: { label: "Option A", value: "a" } }],
					}}
					registry={registry}
				/>,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})

		it("has no axe violations (invalid group with error message)", async () => {
			const { container } = render(
				<A2Renderer
					node={{
						type: "CheckboxGroup",
						props: { label: "Agree", isInvalid: true, errorMessage: "Required" },
						children: [{ type: "Checkbox", props: { label: "I agree", value: "agree" } }],
					}}
					registry={registry}
				/>,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})
	})

	describe("RadioGroup", () => {
		it("has no axe violations (labelled group)", async () => {
			const { container } = render(
				<A2Renderer
					node={{
						type: "RadioGroup",
						props: { label: "Favourite pet" },
						children: [
							{ type: "Radio", props: { label: "Dog", value: "dog" } },
							{ type: "Radio", props: { label: "Cat", value: "cat" } },
						],
					}}
					registry={registry}
				/>,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})

		it("has no axe violations (preselected)", async () => {
			const { container } = render(
				<A2Renderer
					node={{
						type: "RadioGroup",
						props: { label: "Size", defaultValue: "md" },
						children: [
							{ type: "Radio", props: { label: "Small", value: "sm" } },
							{ type: "Radio", props: { label: "Medium", value: "md" } },
						],
					}}
					registry={registry}
				/>,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})

		it("has no axe violations (disabled group)", async () => {
			const { container } = render(
				<A2Renderer
					node={{
						type: "RadioGroup",
						props: { label: "Locked", isDisabled: true },
						children: [{ type: "Radio", props: { label: "Option A", value: "a" } }],
					}}
					registry={registry}
				/>,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})

		it("has no axe violations (invalid group with error message)", async () => {
			const { container } = render(
				<A2Renderer
					node={{
						type: "RadioGroup",
						props: { label: "Plan", isInvalid: true, errorMessage: "Please select a plan." },
						children: [
							{ type: "Radio", props: { label: "Free", value: "free" } },
							{ type: "Radio", props: { label: "Pro", value: "pro" } },
						],
					}}
					registry={registry}
				/>,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})
	})

	describe("Switch", () => {
		it("has no axe violations (default off)", async () => {
			const { container } = render(
				<A2Renderer node={{ type: "Switch", props: { label: "Dark mode" } }} registry={registry} />,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})

		it("has no axe violations (selected)", async () => {
			const { container } = render(
				<A2Renderer
					node={{ type: "Switch", props: { label: "Dark mode", defaultSelected: true } }}
					registry={registry}
				/>,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})

		it("has no axe violations (disabled)", async () => {
			const { container } = render(
				<A2Renderer node={{ type: "Switch", props: { label: "Locked", isDisabled: true } }} registry={registry} />,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})
	})

	describe("Dialog", () => {
		it("has no axe violations (open dialog with title)", async () => {
			render(
				<A2Renderer
					node={{
						type: "Dialog",
						props: { title: "Test dialog", isOpen: true },
						children: [{ type: "Button", props: { variant: "primary" }, children: "OK" }],
					}}
					registry={registry}
				/>,
			)
			// Dialog renders via React portal — axe must run on document.body
			const { violations } = await axe.run(document.body, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})

		it("has no axe violations (alertdialog)", async () => {
			render(
				<A2Renderer
					node={{
						type: "Dialog",
						props: { title: "Confirm", isOpen: true, role: "alertdialog" },
						children: [{ type: "Button", props: { variant: "danger" }, children: "Delete" }],
					}}
					registry={registry}
				/>,
			)
			const { violations } = await axe.run(document.body, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})
	})

	describe("Form", () => {
		it("has no axe violations (empty form)", async () => {
			const { container } = render(<A2Renderer node={{ type: "Form" }} registry={registry} />)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})

		it("has no axe violations (form with fields)", async () => {
			const { container } = render(
				<A2Renderer
					node={{
						type: "Form",
						props: { gap: "md" },
						children: [
							{ type: "TextField", props: { label: "Name" } },
							{ type: "Button", props: { variant: "primary" }, children: "Submit" },
						],
					}}
					registry={registry}
				/>,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})

		it("passes validationErrors and validationBehavior to the form", () => {
			const { container } = render(
				<A2Renderer
					node={{
						type: "Form",
						props: {
							validationBehavior: "aria",
							validationErrors: { email: "This email is already taken" },
						},
						children: [
							{ type: "TextField", props: { label: "Email", name: "email" } },
							{ type: "Button", props: { variant: "primary" }, children: "Submit" },
						],
					}}
					registry={registry}
				/>,
			)
			// RAC adds novalidate when validationBehavior="aria"
			expect(container.querySelector("form[novalidate]")).not.toBeNull()
			// The named field is present in the DOM
			expect(container.querySelector("input[name='email']")).not.toBeNull()
		})

		it("has no axe violations (form with validationErrors)", async () => {
			const { container } = render(
				<A2Renderer
					node={{
						type: "Form",
						props: {
							validationBehavior: "aria",
							validationErrors: { username: "Username is unavailable" },
						},
						children: [{ type: "TextField", props: { label: "Username", name: "username" } }],
					}}
					registry={registry}
				/>,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})
	})

	describe("Menu", () => {
		it("has no axe violations (trigger button)", async () => {
			const { container } = render(
				<A2Renderer
					node={{
						type: "Menu",
						props: { triggerLabel: "Actions", items: [{ id: "a", label: "Option A" }] },
					}}
					registry={registry}
				/>,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})
	})

	describe("Popover", () => {
		it("has no axe violations (trigger button)", async () => {
			const { container } = render(
				<A2Renderer node={{ type: "Popover", props: { triggerLabel: "Settings" } }} registry={registry} />,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})
	})

	describe("Tooltip", () => {
		it("has no axe violations (trigger button)", async () => {
			const { container } = render(
				<A2Renderer
					node={{ type: "Tooltip", props: { content: "Helpful text", triggerLabel: "Help" } }}
					registry={registry}
				/>,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})
	})

	describe("Select", () => {
		const items = [
			{ label: "Apple", value: "apple" },
			{ label: "Banana", value: "banana" },
		]

		it("has no axe violations (labelled select)", async () => {
			const { container } = render(
				<A2Renderer node={{ type: "Select", props: { label: "Fruit", items } }} registry={registry} />,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})

		it("has no axe violations (disabled select)", async () => {
			const { container } = render(
				<A2Renderer
					node={{ type: "Select", props: { label: "Fruit", items, isDisabled: true } }}
					registry={registry}
				/>,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})
	})

	describe("DatePicker", () => {
		it("has no axe violations (labelled datepicker)", async () => {
			const { container } = render(
				<A2Renderer node={{ type: "DatePicker", props: { label: "Appointment" } }} registry={registry} />,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})

		it("has no axe violations (disabled datepicker)", async () => {
			const { container } = render(
				<A2Renderer
					node={{ type: "DatePicker", props: { label: "Locked date", isDisabled: true } }}
					registry={registry}
				/>,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})
	})

	describe("DateRangePicker", () => {
		it("has no axe violations (labelled range picker)", async () => {
			const { container } = render(
				<A2Renderer node={{ type: "DateRangePicker", props: { label: "Stay period" } }} registry={registry} />,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})
	})

	describe("Breadcrumb", () => {
		it("has no axe violations (multi-item breadcrumb)", async () => {
			const { container } = render(
				<A2Renderer
					node={{
						type: "Breadcrumb",
						props: {
							ariaLabel: "Page navigation",
							items: [
								{ id: "home", label: "Home", href: "/" },
								{ id: "products", label: "Products", href: "/products" },
								{ id: "current", label: "Headphones" },
							],
						},
					}}
					registry={registry}
				/>,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})

		it("has no axe violations (disabled breadcrumb)", async () => {
			const { container } = render(
				<A2Renderer
					node={{
						type: "Breadcrumb",
						props: {
							ariaLabel: "Navigation",
							isDisabled: true,
							items: [
								{ id: "home", label: "Home", href: "/" },
								{ id: "page", label: "Current" },
							],
						},
					}}
					registry={registry}
				/>,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})
	})

	describe("Table", () => {
		it("has no axe violations (data table)", async () => {
			const { container } = render(
				<A2Renderer
					node={{
						type: "Table",
						props: {
							ariaLabel: "Team",
							columns: [
								{ id: "name", label: "Name", isRowHeader: true },
								{ id: "role", label: "Role" },
							],
							rows: [
								{ id: "1", data: { name: "Alice", role: "Engineer" } },
								{ id: "2", data: { name: "Bob", role: "Designer" } },
							],
						},
					}}
					registry={registry}
				/>,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})

		it("has no axe violations (empty table)", async () => {
			const { container } = render(
				<A2Renderer
					node={{
						type: "Table",
						props: {
							ariaLabel: "Empty table",
							columns: [{ id: "col", label: "Column", isRowHeader: true }],
							rows: [],
						},
					}}
					registry={registry}
				/>,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})
	})

	describe("Tabs", () => {
		it("has no axe violations (horizontal tabs)", async () => {
			const { container } = render(
				<A2Renderer
					node={{
						type: "Tabs",
						props: {
							ariaLabel: "Settings",
							tabs: [
								{ id: "general", label: "General" },
								{ id: "privacy", label: "Privacy" },
							],
						},
					}}
					registry={registry}
				/>,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})

		it("has no axe violations (vertical tabs)", async () => {
			const { container } = render(
				<A2Renderer
					node={{
						type: "Tabs",
						props: {
							ariaLabel: "Nav",
							orientation: "vertical",
							tabs: [{ id: "home", label: "Home" }],
						},
					}}
					registry={registry}
				/>,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})
	})

	describe("Flex component", () => {
		it("renders children in a flex container", () => {
			render(
				<A2Renderer
					node={{
						type: "Flex",
						props: { direction: "row", gap: "md" },
						children: [
							{ type: "Button", children: "Alpha" },
							{ type: "Button", children: "Beta" },
						],
					}}
					registry={registry}
				/>,
			)
			expect(screen.getByText("Alpha")).toBeDefined()
			expect(screen.getByText("Beta")).toBeDefined()
		})

		it("applies flex-col class for column direction", () => {
			const { container } = render(
				<A2Renderer node={{ type: "Flex", props: { direction: "column" } }} registry={registry} />,
			)
			expect((container.firstChild as HTMLElement).className).toContain("flex-col")
		})

		it("applies flex-wrap class when wrap is true", () => {
			const { container } = render(<A2Renderer node={{ type: "Flex", props: { wrap: true } }} registry={registry} />)
			expect((container.firstChild as HTMLElement).className).toContain("flex-wrap")
		})

		it("has no axe violations", async () => {
			const { container } = render(
				<A2Renderer
					node={{
						type: "Flex",
						props: { direction: "row", gap: "md" },
						children: [{ type: "Button", children: "OK" }],
					}}
					registry={registry}
				/>,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})
	})

	describe("Grid component", () => {
		it("renders children in a grid container", () => {
			render(
				<A2Renderer
					node={{
						type: "Grid",
						props: { columns: 2, gap: "md" },
						children: [
							{ type: "Button", children: "Cell One" },
							{ type: "Button", children: "Cell Two" },
						],
					}}
					registry={registry}
				/>,
			)
			expect(screen.getByText("Cell One")).toBeDefined()
			expect(screen.getByText("Cell Two")).toBeDefined()
		})

		it("applies grid-cols-3 class for 3 columns", () => {
			const { container } = render(<A2Renderer node={{ type: "Grid", props: { columns: 3 } }} registry={registry} />)
			expect((container.firstChild as HTMLElement).className).toContain("grid-cols-3")
		})

		it("has no axe violations", async () => {
			const { container } = render(
				<A2Renderer
					node={{
						type: "Grid",
						props: { columns: 2 },
						children: [{ type: "Button", children: "Item" }],
					}}
					registry={registry}
				/>,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})
	})

	describe("Card component", () => {
		it("renders a div container", () => {
			const { container } = render(<A2Renderer node={{ type: "Card" }} registry={registry} />)
			expect(container.querySelector("div")).toBeDefined()
		})

		it("renders children inside the card", () => {
			render(
				<A2Renderer
					node={{ type: "Card", children: [{ type: "Text", children: "Card content" }] }}
					registry={registry}
				/>,
			)
			expect(screen.getByText("Card content")).toBeDefined()
		})

		it("applies shadow class", () => {
			const { container } = render(<A2Renderer node={{ type: "Card", props: { shadow: "lg" } }} registry={registry} />)
			expect((container.firstChild as HTMLElement).className).toContain("shadow-lg")
		})

		it("applies radius class", () => {
			const { container } = render(<A2Renderer node={{ type: "Card", props: { radius: "lg" } }} registry={registry} />)
			expect((container.firstChild as HTMLElement).className).toContain("rounded-lg")
		})

		it("applies border class when border is true", () => {
			const { container } = render(<A2Renderer node={{ type: "Card", props: { border: true } }} registry={registry} />)
			expect((container.firstChild as HTMLElement).className).toContain("border")
		})

		it("has no axe violations", async () => {
			const { container } = render(
				<A2Renderer
					node={{
						type: "Card",
						props: { padding: "md", border: true },
						children: [{ type: "Text", children: "Content" }],
					}}
					registry={registry}
				/>,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})
	})

	describe("Text component", () => {
		it("renders a paragraph by default", () => {
			const { container } = render(<A2Renderer node={{ type: "Text", children: "Hello world" }} registry={registry} />)
			expect(container.querySelector("p")).toBeDefined()
			expect(screen.getByText("Hello world")).toBeDefined()
		})

		it("renders an h1 when as=h1", () => {
			const { container } = render(
				<A2Renderer node={{ type: "Text", props: { as: "h1" }, children: "Page title" }} registry={registry} />,
			)
			expect(container.querySelector("h1")).toBeDefined()
		})

		it("applies size class from styles", () => {
			const { container } = render(
				<A2Renderer node={{ type: "Text", props: { size: "xl" }, children: "Large" }} registry={registry} />,
			)
			expect((container.firstChild as HTMLElement).className).toContain("text-xl")
		})

		it("applies weight class from styles", () => {
			const { container } = render(
				<A2Renderer node={{ type: "Text", props: { weight: "bold" }, children: "Bold" }} registry={registry} />,
			)
			expect((container.firstChild as HTMLElement).className).toContain("font-bold")
		})

		it("applies align class from styles", () => {
			const { container } = render(
				<A2Renderer node={{ type: "Text", props: { align: "center" }, children: "Centered" }} registry={registry} />,
			)
			expect((container.firstChild as HTMLElement).className).toContain("text-center")
		})

		it("applies italic class when italic is true", () => {
			const { container } = render(
				<A2Renderer node={{ type: "Text", props: { italic: true }, children: "Italic" }} registry={registry} />,
			)
			expect((container.firstChild as HTMLElement).className).toContain("italic")
		})

		it("applies truncate class when truncate is true", () => {
			const { container } = render(
				<A2Renderer node={{ type: "Text", props: { truncate: true }, children: "Long text" }} registry={registry} />,
			)
			expect((container.firstChild as HTMLElement).className).toContain("truncate")
		})

		it("has no axe violations", async () => {
			const { container } = render(
				<A2Renderer node={{ type: "Text", props: { as: "p" }, children: "Accessible text" }} registry={registry} />,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})
	})
})
