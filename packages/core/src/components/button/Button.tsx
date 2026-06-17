import type { ReactNode } from "react"
import { Button as RACButton } from "react-aria-components"
import { getButtonStyles, getSizeStyles } from "./button.styles"

interface ButtonProps {
	children?: ReactNode
	isDisabled?: boolean
	variant?: "primary" | "secondary" | "danger" | "ghost"
	size?: "sm" | "md" | "lg"
	onPress?: () => void
}

export function Button({ children, isDisabled = false, variant = "primary", size = "md", onPress }: ButtonProps) {
	return (
		<RACButton
			onPress={onPress}
			isDisabled={isDisabled}
			className={`${getButtonStyles(variant)} ${getSizeStyles(size)}`}
		>
			{children}
		</RACButton>
	)
}
