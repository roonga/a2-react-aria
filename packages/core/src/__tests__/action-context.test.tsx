import { fireEvent, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { useContext } from "react"
import { describe, expect, it, vi } from "vitest"
import { ActionContext } from "../action-context/action-context"

// Mock component that uses ActionContext the same way the built-in Button does.
// Also serves as a reference pattern for custom component authors.
function MockButton({ onPress, value, children }: { onPress?: () => void; value?: string; children?: ReactNode }) {
	const ctx = useContext(ActionContext)
	return (
		<button
			type="button"
			onClick={() => {
				if (ctx) {
					if (value) {
						ctx.fire(value)
					} else if (typeof children === "string") {
						ctx.fire(ctx.buildAction(children))
					}
				} else {
					onPress?.()
				}
			}}
		>
			{children}
		</button>
	)
}

function makeCtx(overrides?: { buildAction?: (l: string) => string; fire?: (t: string) => void }) {
	return {
		buildAction: overrides?.buildAction ?? ((label: string) => label),
		fire: overrides?.fire ?? vi.fn(),
	}
}

describe("ActionContext — component integration", () => {
	it("fires value prop directly when provided", () => {
		const fire = vi.fn()
		const ctx = makeCtx({ fire })
		render(
			<ActionContext.Provider value={ctx}>
				<MockButton value="book:1">Confirm</MockButton>
			</ActionContext.Provider>,
		)
		fireEvent.click(screen.getByRole("button", { name: "Confirm" }))
		expect(fire).toHaveBeenCalledWith("book:1")
	})

	it("calls buildAction with children text when no value prop", () => {
		const buildAction = vi.fn().mockReturnValue("Submit | Name: Alice")
		const fire = vi.fn()
		const ctx = makeCtx({ buildAction, fire })
		render(
			<ActionContext.Provider value={ctx}>
				<MockButton>Submit</MockButton>
			</ActionContext.Provider>,
		)
		fireEvent.click(screen.getByRole("button", { name: "Submit" }))
		expect(buildAction).toHaveBeenCalledWith("Submit")
		expect(fire).toHaveBeenCalledWith("Submit | Name: Alice")
	})

	it("fires the compound string returned by buildAction", () => {
		const fire = vi.fn()
		const ctx = makeCtx({ buildAction: () => "Submit | Name: Alice", fire })
		render(
			<ActionContext.Provider value={ctx}>
				<MockButton>Submit</MockButton>
			</ActionContext.Provider>,
		)
		fireEvent.click(screen.getByRole("button", { name: "Submit" }))
		expect(fire).toHaveBeenCalledWith("Submit | Name: Alice")
	})

	it("falls back to onPress when there is no ActionContext", () => {
		const onPress = vi.fn()
		render(<MockButton onPress={onPress}>Orphan</MockButton>)
		fireEvent.click(screen.getByRole("button", { name: "Orphan" }))
		expect(onPress).toHaveBeenCalled()
	})

	it("does nothing when children are not a string and no value prop", () => {
		const fire = vi.fn()
		const ctx = makeCtx({ fire })
		render(
			<ActionContext.Provider value={ctx}>
				<MockButton>
					<span>icon</span>
				</MockButton>
			</ActionContext.Provider>,
		)
		fireEvent.click(screen.getByRole("button"))
		expect(fire).not.toHaveBeenCalled()
	})

	it("does not forward value to the DOM element", () => {
		const ctx = makeCtx()
		const { container } = render(
			<ActionContext.Provider value={ctx}>
				<MockButton value="action-id">Go</MockButton>
			</ActionContext.Provider>,
		)
		const btn = container.querySelector("button")
		expect(btn?.hasAttribute("value")).toBe(false)
	})

	it("renders children correctly", () => {
		const ctx = makeCtx()
		render(
			<ActionContext.Provider value={ctx}>
				<MockButton>Styled</MockButton>
			</ActionContext.Provider>,
		)
		expect(screen.getByRole("button", { name: "Styled" })).toBeDefined()
	})
})
