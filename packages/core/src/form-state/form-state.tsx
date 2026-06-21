import type React from "react"
import { createContext, type ReactElement, useContext, useEffect } from "react"

export interface FormStateCtx {
	setValue: (label: string, value: string) => void
}

export const FormStateContext = createContext<FormStateCtx | null>(null)

/**
 * Wraps any field component so it participates in form-state collection.
 * Seeds `defaultValue` into the context on mount and pipes every `onChange`
 * call to `FormStateContext.setValue` as a string.
 *
 * Works for both string-value fields (TextField, Select, RadioGroup, DatePicker)
 * and number-value fields (NumberField) — numbers are converted via template literals.
 */
export function withFormState<T extends { label?: string; defaultValue?: string; onChange?: (v: string) => void }>(
	Component: React.ComponentType<T>,
): (props: T) => ReactElement | null

export function withFormState<T extends { label?: string; defaultValue?: number; onChange?: (v: number) => void }>(
	Component: React.ComponentType<T>,
): (props: T) => ReactElement | null

export function withFormState<
	T extends {
		label?: string
		defaultValue?: string | number
		onChange?: ((v: string) => void) | ((v: number) => void)
	},
>(Component: React.ComponentType<T>): (props: T) => ReactElement | null {
	return function FormField(props: T): ReactElement | null {
		const ctx = useContext(FormStateContext)
		// biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only seed — defaultValue is uncontrolled
		useEffect(() => {
			if (props.defaultValue !== undefined && props.label) {
				ctx?.setValue(props.label, `${props.defaultValue}`)
			}
		}, [])
		return (
			<Component
				{...props}
				onChange={
					((v: unknown) => {
						if (props.label) ctx?.setValue(props.label, `${v}`)
					}) as T["onChange"]
				}
			/>
		) as ReactElement | null
	}
}
