import type { ReactNode } from "react"
import { alertBodyStyles, alertTitleStyles, getAlertStyles } from "./alert.styles"

interface AlertProps {
	variant?: "info" | "success" | "warning" | "error"
	title?: string
	children?: ReactNode
}

export function Alert({ variant = "info", title, children }: AlertProps) {
	return (
		<div role="alert" className={getAlertStyles(variant)}>
			{title && <p className={alertTitleStyles}>{title}</p>}
			{children && <div className={alertBodyStyles}>{children}</div>}
		</div>
	)
}
