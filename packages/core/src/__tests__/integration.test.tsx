import { render, screen } from "@testing-library/react"
import axe from "axe-core"
import type React from "react"
import { describe, expect, it } from "vitest"
import { Text } from "../components/text"
import { A2Renderer, createRegistry } from "../index"
import { defaultRegistry } from "../registry/defaultRegistry"

// Color contrast requires real CSS rendering — jsdom cannot compute it.
const AXE_CONFIG: axe.RunOptions = { rules: { "color-contrast": { enabled: false } } }

// The full built-in component set with schemas, so every node in this suite is
// validated exactly as strict consumer registries validate untrusted input.
const registry = createRegistry(Object.fromEntries(defaultRegistry))

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
			expect(btn.className).toContain("bg-(--color-primary)")
		})

		it("renders disabled button from a2UI JSON", () => {
			const node = {
				type: "Button" as const,
				props: { isDisabled: true },
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
			expect(btn.className).toContain("bg-(--color-danger)")
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

		it("renders with a controlled value", () => {
			render(
				<A2Renderer
					node={{ type: "DatePicker", props: { label: "Appointment", value: "2024-06-15" } }}
					registry={registry}
				/>,
			)
			expect(screen.getByText(/appointment/i)).toBeDefined()
		})
	})

	describe("DateRangePicker component", () => {
		it("renders daterangepicker with label", () => {
			render(<A2Renderer node={{ type: "DateRangePicker", props: { label: "Date range" } }} registry={registry} />)
			expect(screen.getByText(/date range/i)).toBeDefined()
		})

		it("renders with a controlled value range", () => {
			render(
				<A2Renderer
					node={{
						type: "DateRangePicker",
						props: { label: "Stay period", value: { start: "2024-07-01", end: "2024-07-14" } },
					}}
					registry={registry}
				/>,
			)
			expect(screen.getByText(/stay period/i)).toBeDefined()
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

		it("renders with a controlled value", () => {
			render(<A2Renderer node={{ type: "NumberField", props: { label: "Count", value: 7 } }} registry={registry} />)
			const input = screen.getByRole("textbox", { name: /count/i }) as HTMLInputElement
			expect(input.value).toBe("7")
		})

		it("stepper buttons are first and last children of the group for correct corner rounding", () => {
			render(
				<A2Renderer node={{ type: "NumberField", props: { label: "Guests", defaultValue: 2 } }} registry={registry} />,
			)
			const decrementBtn = screen.getByRole("button", { name: /decrease/i })
			const incrementBtn = screen.getByRole("button", { name: /increase/i })
			const group = decrementBtn.parentElement as HTMLElement

			// Decrement must be first child so first:rounded-l applies to its corners
			expect(group.firstElementChild).toBe(decrementBtn)
			// Increment must be last child so last:rounded-r applies to its corners
			expect(group.lastElementChild).toBe(incrementBtn)

			// Both stepper buttons carry the pseudo-class corner utilities
			expect(decrementBtn.className).toContain("first:rounded-l")
			expect(decrementBtn.className).toContain("last:rounded-r")
			expect(incrementBtn.className).toContain("first:rounded-l")
			expect(incrementBtn.className).toContain("last:rounded-r")

			// Group must not use overflow-hidden (clips button content in flex containers)
			expect(group.className).not.toContain("overflow-hidden")

			// Input must have min-w-0 so flex-1 can shrink in narrow grid cells
			// (without it the browser's default min-width pushes + outside the border)
			const input = group.querySelector("input") as HTMLInputElement
			expect(input.className).toContain("min-w-0")
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
				<A2Renderer node={{ type: "Button", props: { isDisabled: true }, children: "Disabled" }} registry={registry} />,
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

	describe("Alert component", () => {
		it("renders with role=alert", () => {
			const { container } = render(
				<A2Renderer
					node={{ type: "Alert", props: { variant: "info" }, children: "Info message" }}
					registry={registry}
				/>,
			)
			expect(container.querySelector("[role='alert']")).not.toBeNull()
		})

		it("renders title and children", () => {
			render(
				<A2Renderer
					node={{ type: "Alert", props: { variant: "success", title: "Done" }, children: "Operation succeeded." }}
					registry={registry}
				/>,
			)
			expect(screen.getByText("Done")).toBeDefined()
			expect(screen.getByText("Operation succeeded.")).toBeDefined()
		})

		it("renders without title", () => {
			const { container } = render(
				<A2Renderer
					node={{ type: "Alert", props: { variant: "warning" }, children: "Watch out" }}
					registry={registry}
				/>,
			)
			expect(container.querySelector("[role='alert']")).not.toBeNull()
		})

		it("has no axe violations", async () => {
			const { container } = render(
				<A2Renderer
					node={{ type: "Alert", props: { variant: "error", title: "Error" }, children: "Something went wrong." }}
					registry={registry}
				/>,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})
	})

	describe("TagGroup component", () => {
		it("renders tags from children", () => {
			render(
				<A2Renderer
					node={{
						type: "TagGroup",
						children: [
							{ type: "Tag", props: { id: "news" }, children: "News" },
							{ type: "Tag", props: { id: "travel" }, children: "Travel" },
						],
					}}
					registry={registry}
				/>,
			)
			expect(screen.getByText("News")).toBeDefined()
			expect(screen.getByText("Travel")).toBeDefined()
		})

		it("renders with a label", () => {
			render(
				<A2Renderer
					node={{
						type: "TagGroup",
						props: { label: "Categories" },
						children: [{ type: "Tag", props: { id: "ai" }, children: "AI" }],
					}}
					registry={registry}
				/>,
			)
			expect(screen.getByText("Categories")).toBeDefined()
		})

		it("has no axe violations", async () => {
			const { container } = render(
				<A2Renderer
					node={{
						type: "TagGroup",
						props: { label: "Topics" },
						children: [
							{ type: "Tag", props: { id: "a" }, children: "Alpha" },
							{ type: "Tag", props: { id: "b" }, children: "Beta" },
						],
					}}
					registry={registry}
				/>,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})
	})

	describe("Accordion component", () => {
		it("renders accordion items with headings", () => {
			render(
				<A2Renderer
					node={{
						type: "Accordion",
						children: [
							{
								type: "AccordionItem",
								props: { id: "a", heading: "Section A" },
								children: [{ type: "Text", children: "Content A" }],
							},
							{
								type: "AccordionItem",
								props: { id: "b", heading: "Section B" },
								children: [{ type: "Text", children: "Content B" }],
							},
						],
					}}
					registry={registry}
				/>,
			)
			expect(screen.getByText("Section A")).toBeDefined()
			expect(screen.getByText("Section B")).toBeDefined()
		})

		it("renders expanded content when defaultExpanded is true", () => {
			render(
				<A2Renderer
					node={{
						type: "Accordion",
						children: [
							{
								type: "AccordionItem",
								props: { id: "faq", heading: "What is this?", defaultExpanded: true },
								children: [{ type: "Text", children: "This is a collapsible section." }],
							},
						],
					}}
					registry={registry}
				/>,
			)
			expect(screen.getByText("This is a collapsible section.")).toBeDefined()
		})

		it("has no axe violations", async () => {
			const { container } = render(
				<A2Renderer
					node={{
						type: "Accordion",
						children: [
							{
								type: "AccordionItem",
								props: { id: "x", heading: "Item X" },
								children: [{ type: "Text", children: "Content X" }],
							},
						],
					}}
					registry={registry}
				/>,
			)
			const { violations } = await axe.run(container, AXE_CONFIG)
			expect(violations).toHaveLength(0)
		})
	})
})

describe("A2Renderer security", () => {
	// Simple components that pass props directly to DOM elements for testing sanitization
	const Anchor = ({ href, children }: { href?: string; children?: React.ReactNode }) => <a href={href}>{children}</a>
	const Img = ({ src }: { src?: string }) => <img src={src} alt="" />
	const securityRegistry = createRegistry(
		{
			Anchor: { component: Anchor as Parameters<typeof createRegistry>[0][string]["component"] },
			Img: { component: Img as Parameters<typeof createRegistry>[0][string]["component"] },
			Text: { component: Text },
		},
		{ strict: false },
	)

	it("replaces javascript: href with about:blank", () => {
		const { container } = render(
			<A2Renderer
				node={{ type: "Anchor", props: { href: "javascript:alert(1)" }, children: "Click" }}
				registry={securityRegistry}
			/>,
		)
		expect(container.querySelector("a")?.getAttribute("href")).toBe("about:blank")
	})

	it("replaces data: src with about:blank", () => {
		const { container } = render(
			<A2Renderer
				node={{ type: "Img", props: { src: "data:text/html,<script>alert(1)</script>" } }}
				registry={securityRegistry}
			/>,
		)
		expect(container.querySelector("img")?.getAttribute("src")).toBe("about:blank")
	})

	it("allows safe https: href through unchanged", () => {
		const { container } = render(
			<A2Renderer
				node={{ type: "Anchor", props: { href: "https://example.com" }, children: "Link" }}
				registry={securityRegistry}
			/>,
		)
		expect(container.querySelector("a")?.getAttribute("href")).toBe("https://example.com")
	})

	it("renders fallback when render depth exceeds 50", () => {
		const buildDeep = (depth: number): { type: string; children?: unknown } =>
			depth === 0 ? { type: "Text", children: "leaf" } : { type: "Text", children: buildDeep(depth - 1) }

		const { container } = render(
			<A2Renderer
				node={buildDeep(55) as Parameters<typeof A2Renderer>[0]["node"]}
				registry={securityRegistry}
				fallback={<span data-testid="depth-fallback">error</span>}
			/>,
		)
		expect(container.querySelector("[data-testid='depth-fallback']")).not.toBeNull()
	})
})

describe("TextArea component", () => {
	it("renders a multiline textarea with label from a2UI JSON", () => {
		const node = {
			type: "TextArea" as const,
			props: { label: "Comments", rows: 4 },
		}
		render(<A2Renderer node={node} registry={registry} />)
		const el = screen.getByLabelText(/comments/i) as HTMLTextAreaElement
		expect(el.tagName).toBe("TEXTAREA")
		expect(el.rows).toBe(4)
	})

	it("renders required indicator from a2UI JSON", () => {
		const node = {
			type: "TextArea" as const,
			props: { label: "Feedback", isRequired: true },
		}
		render(<A2Renderer node={node} registry={registry} />)
		const label = screen.getByText(/feedback/i)
		expect(label.textContent).toContain("*")
	})

	it("renders disabled textarea from a2UI JSON", () => {
		const node = {
			type: "TextArea" as const,
			props: { label: "Notes", isDisabled: true },
		}
		render(<A2Renderer node={node} registry={registry} />)
		const el = screen.getByLabelText(/notes/i) as HTMLTextAreaElement
		expect(el.disabled).toBe(true)
	})

	it("associates the description with the textarea", () => {
		const node = {
			type: "TextArea" as const,
			props: { label: "Bio", description: "Tell us about yourself" },
		}
		render(<A2Renderer node={node} registry={registry} />)
		const el = screen.getByLabelText(/bio/i)
		expect(el.getAttribute("aria-describedby")).toBeTruthy()
		expect(screen.getByText(/tell us about yourself/i)).toBeDefined()
	})

	it("has no axe violations (labelled textarea)", async () => {
		const { container } = render(
			<A2Renderer
				node={{ type: "TextArea", props: { label: "Comments", description: "Optional", rows: 3 } }}
				registry={registry}
			/>,
		)
		const { violations } = await axe.run(container, AXE_CONFIG)
		expect(violations).toHaveLength(0)
	})
})
