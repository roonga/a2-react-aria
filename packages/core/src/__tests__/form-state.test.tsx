import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { FormStateContext, withFormState } from "../form-state/form-state"

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
const WrappedNumInput = withFormState(MockNumInput)

describe("withFormState", () => {
	it("seeds string defaultValue into FormStateContext on mount", () => {
		const setValue = vi.fn()
		render(
			<FormStateContext.Provider value={{ setValue }}>
				<WrappedInput label="Name" defaultValue="Alice" />
			</FormStateContext.Provider>,
		)
		expect(setValue).toHaveBeenCalledWith("Name", "Alice")
	})

	it("seeds number defaultValue as a string on mount", () => {
		const setValue = vi.fn()
		render(
			<FormStateContext.Provider value={{ setValue }}>
				<WrappedNumInput label="Guests" defaultValue={3} />
			</FormStateContext.Provider>,
		)
		expect(setValue).toHaveBeenCalledWith("Guests", "3")
	})

	it("seeds defaultValue of 0 (falsy number) correctly", () => {
		const setValue = vi.fn()
		render(
			<FormStateContext.Provider value={{ setValue }}>
				<WrappedNumInput label="Count" defaultValue={0} />
			</FormStateContext.Provider>,
		)
		expect(setValue).toHaveBeenCalledWith("Count", "0")
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

	it("calls setValue with the string value on change", () => {
		const setValue = vi.fn()
		render(
			<FormStateContext.Provider value={{ setValue }}>
				<WrappedInput label="City" />
			</FormStateContext.Provider>,
		)
		fireEvent.change(screen.getByRole("textbox"), { target: { value: "Sydney" } })
		expect(setValue).toHaveBeenCalledWith("City", "Sydney")
	})

	it("converts number onChange value to string in context", () => {
		const setValue = vi.fn()
		render(
			<FormStateContext.Provider value={{ setValue }}>
				<WrappedNumInput label="Qty" />
			</FormStateContext.Provider>,
		)
		fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "5" } })
		expect(setValue).toHaveBeenCalledWith("Qty", "5")
	})

	it("does not call setValue on change when label is missing", () => {
		const setValue = vi.fn()
		render(
			<FormStateContext.Provider value={{ setValue }}>
				<WrappedInput />
			</FormStateContext.Provider>,
		)
		fireEvent.change(screen.getByRole("textbox"), { target: { value: "anything" } })
		expect(setValue).not.toHaveBeenCalled()
	})

	it("does not throw when there is no FormStateContext", () => {
		render(<WrappedInput label="Name" defaultValue="Bob" />)
		expect(() => {
			fireEvent.change(screen.getByRole("textbox"), { target: { value: "Charlie" } })
		}).not.toThrow()
	})
})
