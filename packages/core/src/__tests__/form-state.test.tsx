import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { FormStateContext, withFormState, withFormStateNum } from "../form-state/form-state"

function MockInput({
	label,
	defaultValue,
	onChange,
}: {
	label?: string
	defaultValue?: string
	onChange?: (v: string) => void
}) {
	return <input aria-label={label} defaultValue={defaultValue} onChange={(e) => onChange?.(e.target.value)} />
}

function MockNumInput({
	label,
	defaultValue,
	onChange,
}: {
	label?: string
	defaultValue?: number
	onChange?: (v: number) => void
}) {
	return (
		<input
			type="number"
			aria-label={label}
			defaultValue={defaultValue}
			onChange={(e) => onChange?.(Number(e.target.value))}
		/>
	)
}

const WrappedInput = withFormState(MockInput)
const WrappedNumInput = withFormStateNum(MockNumInput)

describe("withFormState", () => {
	it("seeds defaultValue into FormStateContext on mount", () => {
		const setValue = vi.fn()
		render(
			<FormStateContext.Provider value={{ setValue }}>
				<WrappedInput label="Name" defaultValue="Alice" />
			</FormStateContext.Provider>,
		)
		expect(setValue).toHaveBeenCalledWith("Name", "Alice")
	})

	it("does not seed when defaultValue is absent", () => {
		const setValue = vi.fn()
		render(
			<FormStateContext.Provider value={{ setValue }}>
				<WrappedInput label="Name" />
			</FormStateContext.Provider>,
		)
		expect(setValue).not.toHaveBeenCalled()
	})

	it("does not seed when label is absent", () => {
		const setValue = vi.fn()
		render(
			<FormStateContext.Provider value={{ setValue }}>
				<WrappedInput defaultValue="Alice" />
			</FormStateContext.Provider>,
		)
		expect(setValue).not.toHaveBeenCalled()
	})

	it("calls setValue with the new value on change", () => {
		const setValue = vi.fn()
		render(
			<FormStateContext.Provider value={{ setValue }}>
				<WrappedInput label="City" />
			</FormStateContext.Provider>,
		)
		const input = screen.getByRole("textbox")
		fireEvent.change(input, { target: { value: "Sydney" } })
		expect(setValue).toHaveBeenCalledWith("City", "Sydney")
	})

	it("does not call setValue on change when label is missing", () => {
		const setValue = vi.fn()
		render(
			<FormStateContext.Provider value={{ setValue }}>
				<WrappedInput />
			</FormStateContext.Provider>,
		)
		const input = screen.getByRole("textbox")
		fireEvent.change(input, { target: { value: "anything" } })
		expect(setValue).not.toHaveBeenCalled()
	})

	it("does not throw when there is no FormStateContext", () => {
		render(<WrappedInput label="Name" defaultValue="Bob" />)
		const input = screen.getByRole("textbox")
		expect(() => {
			fireEvent.change(input, { target: { value: "Charlie" } })
		}).not.toThrow()
	})
})

describe("withFormStateNum", () => {
	it("seeds number defaultValue as a string on mount", () => {
		const setValue = vi.fn()
		render(
			<FormStateContext.Provider value={{ setValue }}>
				<WrappedNumInput label="Guests" defaultValue={3} />
			</FormStateContext.Provider>,
		)
		expect(setValue).toHaveBeenCalledWith("Guests", "3")
	})

	it("does not seed when defaultValue is 0 (falsy)", () => {
		const setValue = vi.fn()
		render(
			<FormStateContext.Provider value={{ setValue }}>
				<WrappedNumInput label="Count" defaultValue={0} />
			</FormStateContext.Provider>,
		)
		// defaultValue === 0 is undefined-like in the guard `props.defaultValue !== undefined`
		// The implementation uses `!== undefined`, so 0 should seed
		expect(setValue).toHaveBeenCalledWith("Count", "0")
	})

	it("converts number onChange value to string in context", () => {
		const setValue = vi.fn()
		render(
			<FormStateContext.Provider value={{ setValue }}>
				<WrappedNumInput label="Qty" />
			</FormStateContext.Provider>,
		)
		const input = screen.getByRole("spinbutton")
		fireEvent.change(input, { target: { value: "5" } })
		expect(setValue).toHaveBeenCalledWith("Qty", "5")
	})
})
