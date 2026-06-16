import type { ReactNode } from "react"
import { Form as RACForm } from "react-aria-components"
import { getFormStyles } from "./form.styles"

interface FormProps {
	gap?: "sm" | "md" | "lg"
	validationBehavior?: "aria" | "native"
	validationErrors?: Record<string, string | string[]>
	action?: string
	method?: "get" | "post"
	onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
	onReset?: (e: React.FormEvent<HTMLFormElement>) => void
	children?: ReactNode
}

export function Form({
	gap = "md",
	validationBehavior = "native",
	validationErrors,
	action,
	method,
	onSubmit,
	onReset,
	children,
}: FormProps) {
	return (
		<RACForm
			action={action}
			method={method}
			validationBehavior={validationBehavior}
			validationErrors={validationErrors}
			onSubmit={onSubmit}
			onReset={onReset}
			className={getFormStyles(gap)}
		>
			{children}
		</RACForm>
	)
}
