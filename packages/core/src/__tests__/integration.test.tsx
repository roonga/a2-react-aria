import { render, screen } from "@testing-library/react"
import axe from "axe-core"
import { describe, expect, it } from "vitest"
import { Button } from "../components/button"
import { Checkbox, CheckboxGroup } from "../components/checkbox"
import { Dialog } from "../components/dialog"
import { Form } from "../components/form"
import { Radio, RadioGroup } from "../components/radio"
import { Select } from "../components/select"
import { Switch } from "../components/switch"
import { TextField } from "../components/text-field"
import { A2Renderer, createRegistry } from "../index"

// Color contrast requires real CSS rendering — jsdom cannot compute it.
const AXE_CONFIG: axe.RunOptions = { rules: { "color-contrast": { enabled: false } } }

const registry = createRegistry({
	Button: { component: Button },
	Checkbox: { component: Checkbox },
	CheckboxGroup: { component: CheckboxGroup },
	Dialog: { component: Dialog },
	Form: { component: Form },
	Radio: { component: Radio },
	RadioGroup: { component: RadioGroup },
	Select: { component: Select },
	Switch: { component: Switch },
	TextField: { component: TextField },
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
					required: true,
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
					disabled: true,
					value: "readonly",
				},
			}
			render(<A2Renderer node={node} registry={registry} />)
			const input = screen.getByLabelText(/disabled/i) as HTMLInputElement
			expect(input.disabled).toBe(true)
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
					node={{ type: "TextField", props: { label: "Read only", disabled: true, value: "locked" } }}
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
})
