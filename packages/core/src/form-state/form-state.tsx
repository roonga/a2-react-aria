import type React from "react"
import { createContext, useContext, useEffect } from "react"

export interface FormStateCtx {
	setValue: (label: string, value: string) => void
}

export const FormStateContext = createContext<FormStateCtx | null>(null)

/**
 * Wraps a string-value field component so it participates in form-state collection.
 * Seeds `defaultValue` into the context on mount, and pipes every `onChange` call
 * to `FormStateContext.setValue`. Use with TextField, Select, RadioGroup, DatePicker.
 */
export function withFormState<T extends { label?: string; defaultValue?: string; onChange?: (v: string) => void }>(
	Component: React.ComponentType<T>,
) {
	return function FormField(props: T) {
		const ctx = useContext(FormStateContext)
		// biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only seed — defaultValue is uncontrolled
		useEffect(() => {
			if (props.defaultValue && props.label) ctx?.setValue(props.label, props.defaultValue)
		}, [])
		return <Component {...props} onChange={(v) => props.label && ctx?.setValue(props.label, v)} />
	}
}

/**
 * Same as `withFormState` but for number-value fields (e.g. NumberField).
 * Converts the number value to a string before writing to context.
 */
export function withFormStateNum<T extends { label?: string; defaultValue?: number; onChange?: (v: number) => void }>(
	Component: React.ComponentType<T>,
) {
	return function FormField(props: T) {
		const ctx = useContext(FormStateContext)
		// biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only seed — defaultValue is uncontrolled
		useEffect(() => {
			if (props.defaultValue !== undefined && props.label) ctx?.setValue(props.label, String(props.defaultValue))
		}, [])
		return <Component {...props} onChange={(v) => props.label && ctx?.setValue(props.label, String(v))} />
	}
}
