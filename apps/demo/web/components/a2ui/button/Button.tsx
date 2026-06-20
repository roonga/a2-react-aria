import type { ReactNode } from "react"
import { Button as RACButton } from "react-aria-components"
import { getButtonStyles, getSizeStyles } from "./button.styles"

interface ButtonProps {
	children?: ReactNode
	isDisabled?: boolean
	isPending?: boolean
	type?: "button" | "reset" | "submit"
	name?: string
	value?: string
	variant?: "primary" | "secondary" | "danger" | "ghost"
	size?: "sm" | "md" | "lg"
	onPress?: () => void
}

export function Button({
	children,
	isDisabled = false,
	isPending,
	type,
	name,
	value,
	variant = "primary",
	size = "md",
	onPress,
}: ButtonProps) {
	return (
		<RACButton
			onPress={onPress}
			isDisabled={isDisabled}
			isPending={isPending}
			type={type}
			name={name}
			value={value}
			className={`${getButtonStyles(variant)} ${getSizeStyles(size)}`}
		>
			{children}
		</RACButton>
	)
}
