import type { ReactNode } from "react"
import { Button as RACButton } from "react-aria-components"
import type { ButtonNode } from "./button.schema"

interface ButtonProps extends Omit<Required<ButtonNode>["props"], never> {
	children?: ReactNode
	disabled?: boolean
	variant?: "primary" | "secondary" | "danger" | "ghost"
	size?: "sm" | "md" | "lg"
	onClick?: () => void
}

const variantClasses = {
	primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
	secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400",
	danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
	ghost: "bg-transparent text-gray-900 hover:bg-gray-100 active:bg-gray-200",
}

const sizeClasses = {
	sm: "px-2 py-1 text-sm",
	md: "px-4 py-2 text-base",
	lg: "px-6 py-3 text-lg",
}

export function Button({ children, disabled = false, variant = "primary", size = "md", onClick }: ButtonProps) {
	return (
		<RACButton
			onPress={onClick}
			isDisabled={disabled}
			className={`inline-flex items-center justify-center rounded font-medium transition-colors ${variantClasses[variant]} ${sizeClasses[size]} disabled:opacity-50 disabled:cursor-not-allowed`}
		>
			{children}
		</RACButton>
	)
}
