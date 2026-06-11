import type { ReactNode } from "react"
import { Button as RACButton } from "react-aria-components"
import type { ButtonNode } from "./button.schema"
import { getButtonStyles, getSizeStyles } from "./button.styles"

interface ButtonProps extends Omit<Required<ButtonNode>["props"], never> {
	children?: ReactNode
	disabled?: boolean
	variant?: "primary" | "secondary" | "danger" | "ghost"
	size?: "sm" | "md" | "lg"
	onClick?: () => void
}

export function Button({ children, disabled = false, variant = "primary", size = "md", onClick }: ButtonProps) {
	return (
		<RACButton
			onPress={onClick}
			isDisabled={disabled}
			className={`inline-flex items-center justify-center rounded font-medium transition-colors ${getButtonStyles(variant)} ${getSizeStyles(size)} disabled:opacity-50 disabled:cursor-not-allowed`}
		>
			{children}
		</RACButton>
	)
}
