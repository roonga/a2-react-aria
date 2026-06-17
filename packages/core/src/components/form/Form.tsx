import type { ReactNode } from "react"
import { Form as RACForm } from "react-aria-components"
import { getFormStyles } from "./form.styles"

interface FormProps {
	gap?: "sm" | "md" | "lg"
	validationBehavior?: "aria" | "native"
	validationErrors?: Record<string, string | string[]>
	action?: string
	method?: "get" | "post"
	encType?: "application/x-www-form-urlencoded" | "multipart/form-data" | "text/plain"
	autoComplete?: "on" | "off"
	target?: "_blank" | "_self" | "_parent" | "_top"
	onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
	onReset?: (e: React.FormEvent<HTMLFormElement>) => void
	onInvalid?: (e: React.FormEvent<HTMLFormElement>) => void
	children?: ReactNode
}

export function Form({
	gap = "md",
	validationBehavior = "native",
	validationErrors,
	action,
	method,
	encType,
	autoComplete,
	target,
	onSubmit,
	onReset,
	onInvalid,
	children,
}: FormProps) {
	return (
		<RACForm
			action={action}
			method={method}
			encType={encType}
			autoComplete={autoComplete}
			target={target}
			validationBehavior={validationBehavior}
			validationErrors={validationErrors}
			onSubmit={onSubmit}
			onReset={onReset}
			onInvalid={onInvalid}
			className={getFormStyles(gap)}
		>
			{children}
		</RACForm>
	)
}
