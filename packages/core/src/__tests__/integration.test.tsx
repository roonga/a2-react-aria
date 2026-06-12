import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Button } from "../components/button"
import { TextField } from "../components/text-field"
import { A2Renderer, createRegistry } from "../index"

const registry = createRegistry({
	Button: { component: Button },
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
			render(
				<A2Renderer
					node={{ type: "Unknown" }}
					registry={registry}
					fallback={<span>unknown fallback</span>}
				/>,
			)
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
