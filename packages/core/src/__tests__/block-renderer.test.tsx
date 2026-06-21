import { fireEvent, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"
import { withAction } from "../action-context/action-context"
import { withFormState } from "../form-state/form-state"
import { A2Renderer, createRegistry } from "../index"

// ── mock components ──────────────────────────────────────────────────────────

function MockButton({ onPress, children }: { onPress?: () => void; children?: ReactNode }) {
	return (
		<button type="button" onClick={onPress}>
			{children}
		</button>
	)
}

function MockInput({ label, onChange }: { label?: string; onChange?: (v: string) => void }) {
	return <input aria-label={label} onChange={(e) => onChange?.(e.target.value)} />
}

function MockCard({ children }: { children?: ReactNode }) {
	return <div data-testid="card">{children}</div>
}

type RegComp = Parameters<typeof createRegistry>[0][string]["component"]

const registry = createRegistry({
	Button: { component: withAction(MockButton) as RegComp },
	TextField: { component: withFormState(MockInput) as RegComp },
	Card: { component: MockCard as RegComp },
})

// ── tests ────────────────────────────────────────────────────────────────────

describe("A2Renderer — interactive mode (nodes + onAction)", () => {
	it("returns null for an empty nodes array", () => {
		const { container } = render(<A2Renderer nodes={[]} registry={registry} onAction={vi.fn()} />)
		expect(container.firstChild).toBeNull()
	})

	it("returns null for undefined nodes", () => {
		const { container } = render(
			// biome-ignore lint/suspicious/noExplicitAny: testing undefined edge case
			<A2Renderer nodes={undefined as any} registry={registry} onAction={vi.fn()} />,
		)
		expect(container.firstChild).toBeNull()
	})

	it("renders a single node via the registry", () => {
		render(<A2Renderer nodes={[{ type: "Card", children: "Hello" }]} registry={registry} />)
		expect(screen.getByTestId("card")).toBeDefined()
	})

	it("renders multiple nodes", () => {
		render(
			<A2Renderer
				nodes={[
					{ type: "Button", children: "First" },
					{ type: "Button", children: "Second" },
				]}
				registry={registry}
			/>,
		)
		expect(screen.getByRole("button", { name: "First" })).toBeDefined()
		expect(screen.getByRole("button", { name: "Second" })).toBeDefined()
	})

	it("fires onAction with just the button label when no form fields are present", () => {
		const onAction = vi.fn()
		render(<A2Renderer nodes={[{ type: "Button", children: "Confirm" }]} registry={registry} onAction={onAction} />)
		fireEvent.click(screen.getByRole("button", { name: "Confirm" }))
		expect(onAction).toHaveBeenCalledWith("Confirm")
	})

	it("fires onAction with value prop directly", () => {
		const onAction = vi.fn()
		render(
			<A2Renderer
				nodes={[{ type: "Button", props: { value: "action:book" }, children: "Book" }]}
				registry={registry}
				onAction={onAction}
			/>,
		)
		fireEvent.click(screen.getByRole("button", { name: "Book" }))
		expect(onAction).toHaveBeenCalledWith("action:book")
	})

	it("collects form field values into the action string", () => {
		const onAction = vi.fn()
		render(
			<A2Renderer
				nodes={[
					{ type: "TextField", props: { label: "Name" } },
					{ type: "Button", children: "Submit" },
				]}
				registry={registry}
				onAction={onAction}
			/>,
		)
		fireEvent.change(screen.getByRole("textbox"), { target: { value: "Alice" } })
		fireEvent.click(screen.getByRole("button", { name: "Submit" }))
		expect(onAction).toHaveBeenCalledWith("Submit | Name: Alice")
	})

	it("excludes empty fields from the action string", () => {
		const onAction = vi.fn()
		render(
			<A2Renderer
				nodes={[
					{ type: "TextField", props: { label: "Comment" } },
					{ type: "Button", children: "Send" },
				]}
				registry={registry}
				onAction={onAction}
			/>,
		)
		// Do not fill the field — it stays empty
		fireEvent.click(screen.getByRole("button", { name: "Send" }))
		expect(onAction).toHaveBeenCalledWith("Send")
	})

	it("builds compound action string from multiple fields", () => {
		const onAction = vi.fn()
		render(
			<A2Renderer
				nodes={[
					{ type: "TextField", props: { label: "City" } },
					{ type: "TextField", props: { label: "Date" } },
					{ type: "Button", children: "Book" },
				]}
				registry={registry}
				onAction={onAction}
			/>,
		)
		const [cityInput, dateInput] = screen.getAllByRole("textbox")
		fireEvent.change(cityInput, { target: { value: "Sydney" } })
		fireEvent.change(dateInput, { target: { value: "Tonight" } })
		fireEvent.click(screen.getByRole("button", { name: "Book" }))
		expect(onAction).toHaveBeenCalledWith("Book | City: Sydney | Date: Tonight")
	})

	it("does not throw when onAction is not provided", () => {
		render(<A2Renderer nodes={[{ type: "Button", children: "OK" }]} registry={registry} />)
		expect(() => {
			fireEvent.click(screen.getByRole("button", { name: "OK" }))
		}).not.toThrow()
	})
})
