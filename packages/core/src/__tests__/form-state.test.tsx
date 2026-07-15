import { fireEvent, render, screen } from "@testing-library/react"
import { useContext, useEffect } from "react"
import { describe, expect, it, vi } from "vitest"
import { Checkbox, CheckboxGroup } from "../components/checkbox"
import { Radio, RadioGroup } from "../components/radio"
import { FormStateContext } from "../form-state/form-state"

// Mock components that use FormStateContext the same way built-in components do.
// These also serve as a reference pattern for custom component authors.

function MockInput({
	label,
	defaultValue,
	onChange,
}: {
	label?: string
	defaultValue?: string
	onChange?: (v: string) => void
}) {
	const ctx = useContext(FormStateContext)
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only seed
	useEffect(() => {
		if (defaultValue !== undefined && label) ctx?.setValue(label, defaultValue)
	}, [])
	return (
		<input
			aria-label={label}
			defaultValue={defaultValue}
			onChange={(e) => {
				const v = e.target.value
				if (label) ctx?.setValue(label, v)
				onChange?.(v)
			}}
		/>
	)
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
	const ctx = useContext(FormStateContext)
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only seed
	useEffect(() => {
		if (defaultValue !== undefined && label) ctx?.setValue(label, `${defaultValue}`)
	}, [])
	return (
		<input
			type="number"
			aria-label={label}
			defaultValue={defaultValue}
			onChange={(e) => {
				const v = Number(e.target.value)
				if (label) ctx?.setValue(label, `${v}`)
				onChange?.(v)
			}}
		/>
	)
}

describe("FormStateContext — component integration", () => {
	it("seeds string defaultValue into context on mount", () => {
		const setValue = vi.fn()
		render(
			<FormStateContext.Provider value={{ setValue }}>
				<MockInput label="Name" defaultValue="Alice" />
			</FormStateContext.Provider>,
		)
		expect(setValue).toHaveBeenCalledWith("Name", "Alice")
	})

	it("seeds number defaultValue as a string on mount", () => {
		const setValue = vi.fn()
		render(
			<FormStateContext.Provider value={{ setValue }}>
				<MockNumInput label="Guests" defaultValue={3} />
			</FormStateContext.Provider>,
		)
		expect(setValue).toHaveBeenCalledWith("Guests", "3")
	})

	it("seeds defaultValue of 0 (falsy number) correctly", () => {
		const setValue = vi.fn()
		render(
			<FormStateContext.Provider value={{ setValue }}>
				<MockNumInput label="Count" defaultValue={0} />
			</FormStateContext.Provider>,
		)
		expect(setValue).toHaveBeenCalledWith("Count", "0")
	})

	it("does not seed when defaultValue is absent", () => {
		const setValue = vi.fn()
		render(
			<FormStateContext.Provider value={{ setValue }}>
				<MockInput label="Name" />
			</FormStateContext.Provider>,
		)
		expect(setValue).not.toHaveBeenCalled()
	})

	it("does not seed when label is absent", () => {
		const setValue = vi.fn()
		render(
			<FormStateContext.Provider value={{ setValue }}>
				<MockInput defaultValue="Alice" />
			</FormStateContext.Provider>,
		)
		expect(setValue).not.toHaveBeenCalled()
	})

	it("calls setValue with the string value on change", () => {
		const setValue = vi.fn()
		render(
			<FormStateContext.Provider value={{ setValue }}>
				<MockInput label="City" />
			</FormStateContext.Provider>,
		)
		fireEvent.change(screen.getByRole("textbox"), { target: { value: "Sydney" } })
		expect(setValue).toHaveBeenCalledWith("City", "Sydney")
	})

	it("converts number onChange value to string in context", () => {
		const setValue = vi.fn()
		render(
			<FormStateContext.Provider value={{ setValue }}>
				<MockNumInput label="Qty" />
			</FormStateContext.Provider>,
		)
		fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "5" } })
		expect(setValue).toHaveBeenCalledWith("Qty", "5")
	})

	it("passes through onChange to the caller alongside context update", () => {
		const setValue = vi.fn()
		const onChange = vi.fn()
		render(
			<FormStateContext.Provider value={{ setValue }}>
				<MockInput label="City" onChange={onChange} />
			</FormStateContext.Provider>,
		)
		fireEvent.change(screen.getByRole("textbox"), { target: { value: "Sydney" } })
		expect(setValue).toHaveBeenCalledWith("City", "Sydney")
		expect(onChange).toHaveBeenCalledWith("Sydney")
	})

	it("does not call setValue on change when label is missing", () => {
		const setValue = vi.fn()
		render(
			<FormStateContext.Provider value={{ setValue }}>
				<MockInput />
			</FormStateContext.Provider>,
		)
		fireEvent.change(screen.getByRole("textbox"), { target: { value: "anything" } })
		expect(setValue).not.toHaveBeenCalled()
	})

	it("does not throw when there is no FormStateContext", () => {
		render(<MockInput label="Name" defaultValue="Bob" />)
		expect(() => {
			fireEvent.change(screen.getByRole("textbox"), { target: { value: "Charlie" } })
		}).not.toThrow()
	})
})

describe("FormStateContext — CheckboxGroup and name-keyed components", () => {
	it("CheckboxGroup reports its selected values as an array keyed by name", () => {
		const setValue = vi.fn()
		render(
			<FormStateContext.Provider value={{ setValue }}>
				<CheckboxGroup label="Languages used" name="languages">
					<Checkbox value="TypeScript" label="TypeScript" />
					<Checkbox value="Python" label="Python" />
				</CheckboxGroup>
			</FormStateContext.Provider>,
		)
		fireEvent.click(screen.getByRole("checkbox", { name: "TypeScript" }))
		expect(setValue).toHaveBeenLastCalledWith("languages", ["TypeScript"])
		fireEvent.click(screen.getByRole("checkbox", { name: "Python" }))
		expect(setValue).toHaveBeenLastCalledWith("languages", ["TypeScript", "Python"])
	})

	it("CheckboxGroup seeds defaultValue array into context on mount", () => {
		const setValue = vi.fn()
		render(
			<FormStateContext.Provider value={{ setValue }}>
				<CheckboxGroup label="Languages used" name="languages" defaultValue={["Python"]}>
					<Checkbox value="TypeScript" label="TypeScript" />
					<Checkbox value="Python" label="Python" />
				</CheckboxGroup>
			</FormStateContext.Provider>,
		)
		expect(setValue).toHaveBeenCalledWith("languages", ["Python"])
	})

	it("CheckboxGroup falls back to label as the key when name is absent", () => {
		const setValue = vi.fn()
		render(
			<FormStateContext.Provider value={{ setValue }}>
				<CheckboxGroup label="Languages used">
					<Checkbox value="TypeScript" label="TypeScript" />
				</CheckboxGroup>
			</FormStateContext.Provider>,
		)
		fireEvent.click(screen.getByRole("checkbox", { name: "TypeScript" }))
		expect(setValue).toHaveBeenLastCalledWith("Languages used", ["TypeScript"])
	})

	it("RadioGroup keys context values by name when both name and label are given", () => {
		const setValue = vi.fn()
		render(
			<FormStateContext.Provider value={{ setValue }}>
				<RadioGroup label="Which best describes you?" name="employment">
					<Radio value="Student" label="Student" />
				</RadioGroup>
			</FormStateContext.Provider>,
		)
		fireEvent.click(screen.getByRole("radio", { name: "Student" }))
		expect(setValue).toHaveBeenLastCalledWith("employment", "Student")
	})
})
