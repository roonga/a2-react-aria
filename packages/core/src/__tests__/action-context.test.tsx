import { fireEvent, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"
import { ActionContext, withAction } from "../action-context/action-context"

function MockButton({ onPress, children }: { onPress?: () => void; children?: ReactNode }) {
	return (
		<button type="button" onClick={onPress}>
			{children}
		</button>
	)
}

const ActionButton = withAction(MockButton)

function makeCtx(overrides?: { buildAction?: (l: string) => string; fire?: (t: string) => void }) {
	return {
		buildAction: overrides?.buildAction ?? ((label: string) => label),
		fire: overrides?.fire ?? vi.fn(),
	}
}

describe("withAction", () => {
	it("fires value prop directly when provided", () => {
		const fire = vi.fn()
		const ctx = makeCtx({ fire })
		render(
			<ActionContext.Provider value={ctx}>
				<ActionButton value="book:1">Confirm</ActionButton>
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
				<ActionButton>Submit</ActionButton>
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
				<ActionButton>Submit</ActionButton>
			</ActionContext.Provider>,
		)
		fireEvent.click(screen.getByRole("button", { name: "Submit" }))
		expect(fire).toHaveBeenCalledWith("Submit | Name: Alice")
	})

	it("does nothing on press when there is no ActionContext", () => {
		render(<ActionButton>Orphan</ActionButton>)
		// Should not throw
		expect(() => {
			fireEvent.click(screen.getByRole("button", { name: "Orphan" }))
		}).not.toThrow()
	})

	it("does nothing when children are not a string and no value prop", () => {
		const fire = vi.fn()
		const ctx = makeCtx({ fire })
		render(
			<ActionContext.Provider value={ctx}>
				<ActionButton>
					<span>icon</span>
				</ActionButton>
			</ActionContext.Provider>,
		)
		fireEvent.click(screen.getByRole("button"))
		expect(fire).not.toHaveBeenCalled()
	})

	it("strips value from props forwarded to the wrapped component", () => {
		const ctx = makeCtx()
		const { container } = render(
			<ActionContext.Provider value={ctx}>
				<ActionButton value="action-id">Go</ActionButton>
			</ActionContext.Provider>,
		)
		const btn = container.querySelector("button")
		// "value" is an A2UI action identifier, not a DOM attribute — should not appear
		expect(btn?.hasAttribute("value")).toBe(false)
	})

	it("still forwards other props to the wrapped component", () => {
		const ctx = makeCtx()
		render(
			<ActionContext.Provider value={ctx}>
				<ActionButton>Styled</ActionButton>
			</ActionContext.Provider>,
		)
		expect(screen.getByRole("button", { name: "Styled" })).toBeDefined()
	})
})
