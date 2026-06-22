import type { ReactNode } from "react"
import { useContext } from "react"
import { Button as RACButton } from "react-aria-components"
import { ActionContext } from "../../action-context"
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
	const actionCtx = useContext(ActionContext)

	const handlePress = actionCtx
		? () => {
				if (value) {
					actionCtx.fire(value)
				} else if (typeof children === "string") {
					actionCtx.fire(actionCtx.buildAction(children))
				}
			}
		: onPress

	return (
		<RACButton
			onPress={handlePress}
			isDisabled={isDisabled}
			isPending={isPending}
			type={type}
			name={name}
			value={actionCtx ? undefined : value}
			className={`${getButtonStyles(variant)} ${getSizeStyles(size)}`}
		>
			{children}
		</RACButton>
	)
}
